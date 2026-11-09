'use server';

import { z } from 'zod';
import { serviceClient } from '@/lib/supabase/admin';
import { normalizeBdPhone } from '@/lib/phone';
import { findLocation } from '@/lib/bd-locations';
import { getProvider } from '@/lib/payments/registry';
import { errorMessage, messageFor } from '@/lib/errors';
import { rateLimit } from '@/lib/rate-limit';
import type { Quote } from '@/lib/types';

const itemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().nullable(),
  quantity: z.number().int().min(1).max(100),
});
const itemsSchema = z.array(itemSchema).min(1).max(50);

const toDbItems = (items: z.infer<typeof itemsSchema>) =>
  items.map((i) => ({ product_id: i.productId, variant_id: i.variantId, quantity: i.quantity }));

// ───────── Quote (authoritative totals for the checkout summary) ─────────
export type QuoteResult = { ok: true; quote: Quote } | { ok: false; error: string };

export async function quoteCart(input: { items: unknown; districtCode?: string; couponCode?: string }): Promise<QuoteResult> {
  const items = itemsSchema.safeParse(input.items);
  if (!items.success) return { ok: false, error: errorMessage('INVALID_REQUEST') };
  if (!(await rateLimit('quote', 120, 60))) return { ok: false, error: errorMessage('RATE_LIMITED') };
  const db = serviceClient();
  if (!db) return { ok: false, error: errorMessage('NOT_CONFIGURED') };

  const { data, error } = await db.rpc('quote_order', {
    p: { items: toDbItems(items.data), district_code: input.districtCode ?? null, coupon_code: (input.couponCode ?? '').slice(0, 40) },
  });
  if (error) return { ok: false, error: messageFor(error) };
  return { ok: true, quote: data as Quote };
}

// ───────── Place order (Cash on Delivery) ─────────
const req = (msg: string, min = 1, max = 300) => z.string().trim().min(min, msg).max(max, msg);

const orderSchema = z.object({
  name: req('আপনার নাম লিখুন।', 2, 80),
  phone: z.string().max(20),
  email: z.union([z.literal(''), z.string().trim().email('সঠিক ইমেইল ঠিকানা দিন।').max(120)]),
  divisionCode: req('বিভাগ নির্বাচন করুন।'),
  districtCode: req('জেলা নির্বাচন করুন।'),
  upazila: req('উপজেলা / থানার নাম লিখুন।', 2, 80),
  area: req('এলাকার নাম লিখুন।', 2, 120),
  addressLine: req('বাসা / রোড নম্বরসহ পূর্ণ ঠিকানা লিখুন।', 5, 300),
  note: z.string().trim().max(500, 'নোট ৫০০ অক্ষরের মধ্যে রাখুন।'),
  couponCode: z.string().trim().max(40),
  paymentMethod: z.string().max(30),
  items: itemsSchema,
  idempotencyKey: z.string().min(16).max(64),
  website: z.string().max(0), // honeypot: real customers never see or fill this
});

export type PlaceOrderResult =
  | { ok: true; orderNumber: string; token: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function placeOrder(raw: unknown): Promise<PlaceOrderResult> {
  const parsed = orderSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = String(issue.path[0]);
      if (!fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    if (fieldErrors.website || fieldErrors.items || fieldErrors.idempotencyKey)
      return { ok: false, error: errorMessage('INVALID_REQUEST') };
    return { ok: false, error: 'ফর্মের লাল চিহ্নিত ঘরগুলো ঠিক করুন।', fieldErrors };
  }
  const f = parsed.data;

  const phone = normalizeBdPhone(f.phone);
  if (!phone) return { ok: false, error: 'ফর্মের লাল চিহ্নিত ঘরগুলো ঠিক করুন।', fieldErrors: { phone: errorMessage('INVALID_PHONE') } };

  const loc = findLocation(f.divisionCode, f.districtCode);
  if (!loc) return { ok: false, error: 'ফর্মের লাল চিহ্নিত ঘরগুলো ঠিক করুন।', fieldErrors: { districtCode: 'জেলা নির্বাচন করুন।' } };

  const provider = getProvider(f.paymentMethod);
  if (!provider) return { ok: false, error: errorMessage('PAYMENT_METHOD_UNAVAILABLE') };

  if (!(await rateLimit('order', 8, 600))) return { ok: false, error: errorMessage('RATE_LIMITED') };

  const db = serviceClient();
  if (!db) return { ok: false, error: errorMessage('NOT_CONFIGURED') };

  const { data, error } = await db.rpc('create_order', {
    p: {
      idempotency_key: f.idempotencyKey,
      items: toDbItems(f.items),
      coupon_code: f.couponCode,
      name: f.name,
      phone,
      email: f.email,
      division: loc.division.bn,
      district: loc.district.bn,
      district_code: loc.district.code,
      upazila: f.upazila,
      area: f.area,
      address_line: f.addressLine,
      note: f.note,
      payment_method: provider.code,
    },
  });
  if (error) {
    console.error('[placeOrder]', error.message);
    return { ok: false, error: messageFor(error) };
  }
  const result = data as { order_number: string; token: string };
  // COD needs no online step. Gateway adapters will return a redirect here later.
  await provider.initiate({ orderNumber: result.order_number, amount: 0 });
  return { ok: true, orderNumber: result.order_number, token: result.token };
}

// ───────── Track order ─────────
export type TrackResult =
  | { ok: true; order: { order_number: string; status: string; created_at: string; total: number; items: { name: string; variant: string | null; quantity: number }[]; history: { status: string; at: string }[] } }
  | { ok: false; error: string };

export async function trackOrder(input: { orderNumber: string; phone: string }): Promise<TrackResult> {
  const orderNumber = String(input.orderNumber ?? '').trim().toUpperCase().slice(0, 20);
  const phone = normalizeBdPhone(String(input.phone ?? ''));
  if (!/^VAA-\d{6}-\d{4,}$/.test(orderNumber) || !phone)
    return { ok: false, error: 'সঠিক অর্ডার নম্বর (যেমন VAA-202611-0001) ও মোবাইল নম্বর দিন।' };
  if (!(await rateLimit('track', 15, 600))) return { ok: false, error: errorMessage('RATE_LIMITED') };
  const db = serviceClient();
  if (!db) return { ok: false, error: errorMessage('NOT_CONFIGURED') };
  const { data, error } = await db.rpc('track_order', { p_order_number: orderNumber, p_phone: phone });
  if (error) return { ok: false, error: messageFor(error) };
  // Same message whether the number or the phone is wrong, so the form can't be used to probe orders.
  if (!data) return { ok: false, error: 'এই অর্ডার নম্বর ও মোবাইল নম্বরের সাথে মেলে এমন কোনো অর্ডার পাওয়া যায়নি।' };
  return { ok: true, order: data };
}

// ───────── Contact & newsletter ─────────
export type FormResult = { ok: boolean; message: string };

const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().max(20),
  email: z.union([z.literal(''), z.string().trim().email().max(120)]),
  subject: z.string().trim().max(120),
  message: z.string().trim().min(5).max(2000),
  website: z.string().max(0),
});

export async function sendContactMessage(raw: unknown): Promise<FormResult> {
  const p = contactSchema.safeParse(raw);
  if (!p.success) return { ok: false, message: 'নাম ও বার্তা লিখুন। ইমেইল দিলে সঠিক ঠিকানা দিন।' };
  const phone = p.data.phone ? normalizeBdPhone(p.data.phone) : null;
  if (p.data.phone && !phone) return { ok: false, message: errorMessage('INVALID_PHONE') };
  if (!(await rateLimit('contact', 5, 3600))) return { ok: false, message: errorMessage('RATE_LIMITED') };
  const db = serviceClient();
  if (!db) return { ok: false, message: 'বার্তা পাঠানো যায়নি। সরাসরি 01411420001 নম্বরে কল করুন।' };
  const { error } = await db.from('contact_messages').insert({
    name: p.data.name, phone, email: p.data.email || null, subject: p.data.subject || null, message: p.data.message,
  });
  if (error) {
    console.error('[contact]', error.message);
    return { ok: false, message: 'বার্তা পাঠানো যায়নি। সরাসরি 01411420001 নম্বরে কল করুন।' };
  }
  return { ok: true, message: 'আপনার বার্তা আমরা পেয়েছি। শীঘ্রই যোগাযোগ করা হবে।' };
}

export async function subscribeNewsletter(raw: unknown): Promise<FormResult> {
  const p = z.object({ email: z.string().trim().toLowerCase().email().max(120), website: z.string().max(0) }).safeParse(raw);
  if (!p.success) return { ok: false, message: 'সঠিক ইমেইল ঠিকানা দিন।' };
  if (!(await rateLimit('newsletter', 5, 3600))) return { ok: false, message: errorMessage('RATE_LIMITED') };
  const db = serviceClient();
  if (!db) return { ok: false, message: 'এই মুহূর্তে সাবস্ক্রাইব করা যাচ্ছে না।' };
  const { error } = await db.from('newsletter_subscribers').upsert({ email: p.data.email }, { onConflict: 'email', ignoreDuplicates: true });
  if (error) {
    console.error('[newsletter]', error.message);
    return { ok: false, message: 'এই মুহূর্তে সাবস্ক্রাইব করা যাচ্ছে না।' };
  }
  return { ok: true, message: 'ধন্যবাদ! নতুন কালেকশন এলে আপনাকে জানানো হবে।' };
}
