import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { serviceClient } from '@/lib/supabase/admin';
import { formatDateTime, formatTaka } from '@/lib/format';
import { STATUS_BN } from '@/lib/order-status';

export const metadata: Metadata = { title: 'অর্ডার নিশ্চিতকরণ', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

type Params = Promise<{ orderNumber: string }>;
type SP = Promise<{ t?: string }>;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function OrderConfirmationPage({ params, searchParams }: { params: Params; searchParams: SP }) {
  const [{ orderNumber }, { t }] = await Promise.all([params, searchParams]);
  // The secret token in the link is required; the order number alone reveals nothing.
  if (!t || !UUID.test(t)) notFound();
  const db = serviceClient();
  if (!db) notFound();

  const { data: order } = await db.from('orders')
    .select('order_number,customer_name,phone,district,upazila,area,address_line,subtotal,discount,delivery_charge,total,payment_method,status,created_at,items:order_items(product_name,variant_name,quantity,line_total)')
    .eq('order_number', decodeURIComponent(orderNumber)).eq('public_token', t).maybeSingle();
  if (!order) notFound();

  const maskedPhone = `${order.phone.slice(0, 3)}•••••${order.phone.slice(-3)}`;

  return (
    <div className="container-x max-w-3xl py-14 lg:py-20">
      <p className="font-display text-xl italic text-bronze">Thank you</p>
      <h1 className="heading-lg mt-2">আপনার অর্ডারটি গ্রহণ করা হয়েছে</h1>
      <p className="lead mt-4">ধন্যবাদ, {order.customer_name}। অর্ডারের আপডেট জানতে নিচের অর্ডার নম্বরটি সংরক্ষণ করে রাখুন।</p>

      <div className="mt-10 border border-line bg-card">
        <div className="grid gap-6 border-b border-line p-6 sm:grid-cols-3">
          <div><p className="text-sm text-stone">অর্ডার নম্বর</p><p className="mt-1 font-ui text-lg font-medium tracking-wide">{order.order_number}</p></div>
          <div><p className="text-sm text-stone">তারিখ</p><p className="mt-1 font-ui">{formatDateTime(order.created_at)}</p></div>
          <div><p className="text-sm text-stone">অবস্থা</p><p className="mt-1">{STATUS_BN[order.status] ?? order.status}</p></div>
        </div>

        <ul className="divide-y divide-line px-6">
          {(order.items as { product_name: string; variant_name: string | null; quantity: number; line_total: number }[]).map((i, idx) => (
            <li key={idx} className="flex justify-between gap-4 py-4 text-[15px]">
              <span>{i.product_name}{i.variant_name ? ` — ${i.variant_name}` : ''} <span className="font-ui text-stone">× {i.quantity}</span></span>
              <span className="font-ui">{formatTaka(i.line_total)}</span>
            </li>
          ))}
        </ul>

        <dl className="space-y-2 border-t border-line p-6 text-[15px]">
          <div className="flex justify-between"><dt>পণ্যের মূল্য</dt><dd className="font-ui">{formatTaka(order.subtotal)}</dd></div>
          {order.discount > 0 && <div className="flex justify-between text-bronze"><dt>ছাড়</dt><dd className="font-ui">− {formatTaka(order.discount)}</dd></div>}
          <div className="flex justify-between"><dt>ডেলিভারি চার্জ</dt><dd className="font-ui">{order.delivery_charge === 0 ? 'ফ্রি' : formatTaka(order.delivery_charge)}</dd></div>
          <div className="flex justify-between border-t border-line pt-3 text-lg font-medium"><dt>সর্বমোট (ক্যাশ অন ডেলিভারি)</dt><dd className="font-ui">{formatTaka(order.total)}</dd></div>
        </dl>

        <div className="border-t border-line p-6 text-[15px] leading-8">
          <p className="text-sm text-stone">ডেলিভারির ঠিকানা</p>
          <p>{order.address_line}, {order.area}, {order.upazila}, {order.district}</p>
          <p className="font-ui text-stone">{maskedPhone}</p>
        </div>
      </div>

      <p className="mt-8 leading-8 text-[#3d3a34]">পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন। ডেলিভারির সময় প্যাকেট খুলে ডেলিভারিম্যানের সামনেই পণ্যটি দেখে নিন।</p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link href="/track-order" className="btn-primary">অর্ডার ট্র্যাক করুন</Link>
        <Link href="/shop" className="btn-outline">কেনাকাটা চালিয়ে যান</Link>
      </div>
    </div>
  );
}
