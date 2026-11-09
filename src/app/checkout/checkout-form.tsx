'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useStore } from '@/components/store/store-provider';
import { ProductImage } from '@/components/product-image';
import { EmptyState } from '@/components/empty-state';
import { DIVISIONS, UPAZILA_SUGGESTIONS } from '@/lib/bd-locations';
import { formatTaka } from '@/lib/format';
import { normalizeBdPhone } from '@/lib/phone';
import type { PaymentMethodOption, Quote } from '@/lib/types';
import { placeOrder, quoteCart } from '../actions';

type Fields = {
  name: string; phone: string; email: string; divisionCode: string; districtCode: string;
  upazila: string; area: string; addressLine: string; note: string;
};
const EMPTY: Fields = { name: '', phone: '', email: '', divisionCode: '', districtCode: '', upazila: '', area: '', addressLine: '', note: '' };

const newKey = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`);

export function CheckoutForm({ paymentMethods, phone: storePhone }: { paymentMethods: PaymentMethodOption[]; phone: string }) {
  const router = useRouter();
  const { cart, ready, clearCart } = useStore();
  const [f, setF] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [method, setMethod] = useState(paymentMethods[0]?.code ?? '');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [website, setWebsite] = useState('');
  const [submitting, startSubmit] = useTransition();
  const idemKey = useRef<string>('');
  const placed = useRef(false);

  useEffect(() => { idemKey.current = newKey(); }, []);

  const items = useMemo(() => cart.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })), [cart]);
  const division = DIVISIONS.find((d) => d.code === f.divisionCode);
  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setF((prev) => ({ ...prev, [k]: e.target.value, ...(k === 'divisionCode' ? { districtCode: '', upazila: '' } : {}) }));
    setErrors((prev) => ({ ...prev, [k]: '' }));
  };

  // Server-calculated totals: refresh when cart, district or coupon changes.
  useEffect(() => {
    if (!ready || items.length === 0) return;
    let cancelled = false;
    setQuoting(true);
    const t = setTimeout(async () => {
      const r = await quoteCart({ items, districtCode: f.districtCode || undefined, couponCode: appliedCoupon || undefined });
      if (cancelled) return;
      setQuoting(false);
      if (r.ok) { setQuote(r.quote); setQuoteError(null); }
      else if (appliedCoupon) { setAppliedCoupon(''); setCouponMsg(r.error); }
      else { setQuote(null); setQuoteError(r.error); }
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
  }, [ready, items, f.districtCode, appliedCoupon]);

  if (!ready) return <div className="min-h-[50vh]" />;
  if (cart.length === 0 && !placed.current) {
    return <EmptyState title="আপনার কার্ট খালি" body="চেকআউটের আগে কার্টে পণ্য যোগ করুন।" action={{ href: '/shop', label: 'পণ্য দেখুন' }} />;
  }

  const validate = () => {
    const e: Record<string, string> = {};
    if (f.name.trim().length < 2) e.name = 'আপনার নাম লিখুন।';
    if (!normalizeBdPhone(f.phone)) e.phone = 'সঠিক মোবাইল নম্বর দিন (যেমন 01XXXXXXXXX)।';
    if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'সঠিক ইমেইল ঠিকানা দিন।';
    if (!f.divisionCode) e.divisionCode = 'বিভাগ নির্বাচন করুন।';
    if (!f.districtCode) e.districtCode = 'জেলা নির্বাচন করুন।';
    if (f.upazila.trim().length < 2) e.upazila = 'উপজেলা / থানার নাম লিখুন।';
    if (f.area.trim().length < 2) e.area = 'এলাকার নাম লিখুন।';
    if (f.addressLine.trim().length < 5) e.addressLine = 'বাসা / রোড নম্বরসহ পূর্ণ ঠিকানা লিখুন।';
    return e;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (submitting) return;
    setFormError(null);
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      setFormError('ফর্মের লাল চিহ্নিত ঘরগুলো ঠিক করুন।');
      document.getElementById(`f-${Object.keys(e)[0]}`)?.focus();
      return;
    }
    startSubmit(async () => {
      const r = await placeOrder({ ...f, couponCode: appliedCoupon, paymentMethod: method, items, idempotencyKey: idemKey.current, website });
      if (r.ok) {
        placed.current = true;
        clearCart();
        router.replace(`/order/${r.orderNumber}?t=${r.token}`);
      } else {
        setFormError(r.error);
        if (r.fieldErrors) setErrors(r.fieldErrors);
      }
    });
  };

  const err = (k: keyof Fields) => errors[k] ? <p id={`e-${k}`} className="help-error">{errors[k]}</p> : null;
  const fieldProps = (k: keyof Fields) => ({
    id: `f-${k}`, value: f[k], onChange: set(k), 'aria-invalid': !!errors[k] || undefined,
    'aria-describedby': errors[k] ? `e-${k}` : undefined, className: `field ${errors[k] ? 'field-error' : ''}`,
  });
  const upazilaList = UPAZILA_SUGGESTIONS[f.districtCode] ?? [];
  const canOrder = !!quote && !quoteError && !!method && !submitting;

  return (
    <form onSubmit={submit} noValidate className="grid gap-12 lg:grid-cols-[1fr_420px]">
      <div className="space-y-12">
        <fieldset>
          <legend className="heading-md mb-6">আপনার তথ্য</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="f-name">নাম *</label>
              <input {...fieldProps('name')} autoComplete="name" />{err('name')}
            </div>
            <div>
              <label className="label" htmlFor="f-phone">মোবাইল নম্বর *</label>
              <input {...fieldProps('phone')} type="tel" inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" />{err('phone')}
            </div>
            <div>
              <label className="label" htmlFor="f-email">ইমেইল <span className="font-normal text-stone">(ঐচ্ছিক)</span></label>
              <input {...fieldProps('email')} type="email" autoComplete="email" />{err('email')}
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="heading-md mb-6">ডেলিভারির ঠিকানা</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="f-divisionCode">বিভাগ *</label>
              <select {...fieldProps('divisionCode')}>
                <option value="">নির্বাচন করুন</option>
                {DIVISIONS.map((d) => <option key={d.code} value={d.code}>{d.bn}</option>)}
              </select>{err('divisionCode')}
            </div>
            <div>
              <label className="label" htmlFor="f-districtCode">জেলা *</label>
              <select {...fieldProps('districtCode')} disabled={!division}>
                <option value="">{division ? 'নির্বাচন করুন' : 'আগে বিভাগ নির্বাচন করুন'}</option>
                {division?.districts.map((d) => <option key={d.code} value={d.code}>{d.bn}</option>)}
              </select>{err('districtCode')}
            </div>
            <div>
              <label className="label" htmlFor="f-upazila">উপজেলা / থানা *</label>
              <input {...fieldProps('upazila')} list="upazila-list" />
              <datalist id="upazila-list">{upazilaList.map((u) => <option key={u} value={u} />)}</datalist>
              {err('upazila')}
            </div>
            <div>
              <label className="label" htmlFor="f-area">এলাকা *</label>
              <input {...fieldProps('area')} placeholder="যেমন: উপশহর" />{err('area')}
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="f-addressLine">পূর্ণ ঠিকানা *</label>
              <textarea {...fieldProps('addressLine')} rows={2} autoComplete="street-address" placeholder="বাসা / ফ্ল্যাট নম্বর, রোড, পরিচিত জায়গা" />{err('addressLine')}
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="f-note">অর্ডার নোট <span className="font-normal text-stone">(ঐচ্ছিক)</span></label>
              <textarea {...fieldProps('note')} rows={2} placeholder="ডেলিভারি সংক্রান্ত কোনো নির্দেশনা থাকলে লিখুন" />{err('note')}
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="heading-md mb-6">পেমেন্ট পদ্ধতি</legend>
          {paymentMethods.length === 0 ? (
            <p className="border border-line bg-card p-5 text-stone">অনলাইন অর্ডার এই মুহূর্তে বন্ধ আছে। অর্ডার করতে <a className="font-ui text-ink underline" href={`tel:${storePhone}`}>{storePhone}</a> নম্বরে কল করুন।</p>
          ) : (
            <div className="space-y-3">
              {paymentMethods.map((m) => (
                <label key={m.code} className={`flex cursor-pointer items-start gap-4 border bg-card p-5 ${method === m.code ? 'border-ink' : 'border-line'}`}>
                  <input type="radio" name="payment" value={m.code} checked={method === m.code} onChange={() => setMethod(m.code)} className="mt-1.5 h-4 w-4 accent-[#25231F]" />
                  <span><span className="block font-medium">{m.name_bn}</span>{m.description_bn && <span className="block text-sm text-stone">{m.description_bn}</span>}</span>
                </label>
              ))}
            </div>
          )}
        </fieldset>

        <input tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={website} onChange={(e) => setWebsite(e.target.value)} name="website" />
      </div>

      {/* SUMMARY */}
      <aside className="h-fit border border-line bg-card p-6 lg:sticky lg:top-28">
        <h2 className="heading-md mb-5">অর্ডারের সারসংক্ষেপ</h2>
        <ul className="space-y-4 border-b border-line pb-5">
          {cart.map((i) => (
            <li key={i.key} className="flex gap-3">
              <div className="relative aspect-[4/5] w-14 shrink-0 bg-sand"><ProductImage src={i.image} alt={i.name} sizes="56px" /></div>
              <div className="min-w-0 flex-1 text-[15px]">
                <p className="leading-snug">{i.name}</p>
                <p className="text-sm text-stone">{i.variantName ? `${i.variantName} · ` : ''}<span className="font-ui">× {i.quantity}</span></p>
              </div>
              <p className="font-ui text-[15px]">{formatTaka(i.price * i.quantity)}</p>
            </li>
          ))}
        </ul>

        <div className="border-b border-line py-5">
          <label htmlFor="coupon" className="label">কুপন কোড</label>
          <div className="flex gap-2">
            <input id="coupon" value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} className="field min-w-0 flex-1 font-ui uppercase" autoComplete="off" />
            <button type="button" className="btn-outline min-h-[50px] px-5 text-sm" disabled={!coupon.trim()}
              onClick={() => { setCouponMsg(null); setAppliedCoupon(coupon.trim()); }}>প্রয়োগ করুন</button>
          </div>
          {appliedCoupon && quote && quote.discount > 0 && <p className="mt-2 text-sm text-bronze">কুপন প্রয়োগ হয়েছে।</p>}
          {couponMsg && <p className="help-error">{couponMsg}</p>}
        </div>

        <dl className="space-y-3 py-5 text-[15px]" aria-busy={quoting}>
          <div className="flex justify-between"><dt>পণ্যের মূল্য</dt><dd className="font-ui">{quote ? formatTaka(quote.subtotal) : '—'}</dd></div>
          {quote && quote.discount > 0 && <div className="flex justify-between text-bronze"><dt>ছাড়</dt><dd className="font-ui">− {formatTaka(quote.discount)}</dd></div>}
          <div className="flex justify-between">
            <dt>ডেলিভারি চার্জ{quote && f.districtCode ? <span className="block text-sm text-stone">{quote.zone_name}</span> : null}</dt>
            <dd className="font-ui">{!f.districtCode ? <span className="font-sans text-sm text-stone">জেলা নির্বাচন করুন</span> : quote ? (quote.delivery_charge === 0 ? 'ফ্রি' : formatTaka(quote.delivery_charge)) : '—'}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-4 text-lg font-medium">
            <dt>সর্বমোট</dt><dd className="font-ui">{quote && f.districtCode ? formatTaka(quote.total) : '—'}</dd>
          </div>
        </dl>

        {quoteError && <p role="alert" className="mb-4 border border-[#A24A3A]/30 bg-[#A24A3A]/5 p-3 text-sm text-[#A24A3A]">{quoteError}</p>}
        {formError && <p role="alert" className="mb-4 border border-[#A24A3A]/30 bg-[#A24A3A]/5 p-3 text-sm text-[#A24A3A]">{formError}</p>}

        <button type="submit" className="btn-primary w-full text-base" disabled={!canOrder}>
          {submitting ? 'অর্ডার নেওয়া হচ্ছে…' : 'অর্ডার নিশ্চিত করুন'}
        </button>
        <p className="mt-4 text-center text-sm leading-6 text-stone">পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন।</p>
        <p className="mt-3 text-center text-[13px] text-stone">অর্ডার করে আপনি আমাদের <Link href="/policy/terms" className="underline">শর্তাবলি</Link> মেনে নিচ্ছেন।</p>
      </aside>
    </form>
  );
}
