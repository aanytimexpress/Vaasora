'use client';

import Link from 'next/link';
import { Minus, Plus, X } from 'lucide-react';
import { useStore } from '@/components/store/store-provider';
import { ProductImage } from '@/components/product-image';
import { EmptyState } from '@/components/empty-state';
import { formatTaka } from '@/lib/format';

export default function CartPage() {
  const { cart, updateQty, removeItem, cartSubtotal, ready } = useStore();

  if (!ready) return <div className="container-x min-h-[50vh] py-20" />;

  return (
    <div className="container-x py-12 lg:py-20">
      <h1 className="heading-lg mb-10">শপিং কার্ট</h1>
      {cart.length === 0 ? (
        <EmptyState title="আপনার কার্ট খালি" body="পছন্দের পণ্য কার্টে যোগ করে এখানে ফিরে আসুন।" action={{ href: '/shop', label: 'কেনাকাটা শুরু করুন' }} />
      ) : (
        <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
          <ul className="divide-y divide-line border-y border-line">
            {cart.map((i) => (
              <li key={i.key} className="flex gap-4 py-6 sm:gap-6">
                <Link href={`/product/${i.slug}`} className="relative aspect-[4/5] w-24 shrink-0 bg-sand sm:w-28">
                  <ProductImage src={i.image} alt={i.name} sizes="112px" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/product/${i.slug}`} className="font-medium leading-snug hover:text-bronze">{i.name}</Link>
                      {i.variantName && <p className="text-sm text-stone">{i.variantName}</p>}
                      <p className="mt-1 font-ui text-[15px]">{formatTaka(i.price)}</p>
                    </div>
                    <button onClick={() => removeItem(i.key)} aria-label={`${i.name} কার্ট থেকে সরান`} className="-mr-2 -mt-2 flex h-10 w-10 shrink-0 items-center justify-center text-stone hover:text-ink">
                      <X size={18} strokeWidth={1.4} />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="flex h-11 items-center border border-line bg-card" role="group" aria-label="পরিমাণ">
                      <button className="flex h-full w-11 items-center justify-center disabled:opacity-30" disabled={i.quantity <= 1} onClick={() => updateQty(i.key, i.quantity - 1)} aria-label="কমান"><Minus size={15} /></button>
                      <span className="w-8 text-center font-ui">{i.quantity}</span>
                      <button className="flex h-full w-11 items-center justify-center disabled:opacity-30" disabled={i.quantity >= i.maxQty} onClick={() => updateQty(i.key, i.quantity + 1)} aria-label="বাড়ান"><Plus size={15} /></button>
                    </div>
                    <p className="font-ui font-medium">{formatTaka(i.price * i.quantity)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit border border-line bg-card p-6 lg:sticky lg:top-28">
            <div className="flex justify-between text-[17px]"><span>সাবটোটাল</span><span className="font-ui font-medium">{formatTaka(cartSubtotal)}</span></div>
            <p className="mt-3 text-sm leading-7 text-stone">ডেলিভারি চার্জ ও চূড়ান্ত মোট মূল্য চেকআউটে আপনার জেলা অনুযায়ী দেখানো হবে।</p>
            <Link href="/checkout" className="btn-primary mt-6 w-full">চেকআউট করুন</Link>
            <Link href="/shop" className="mt-4 block text-center text-sm text-stone underline-offset-4 hover:underline">আরও কেনাকাটা করুন</Link>
          </aside>
        </div>
      )}
    </div>
  );
}
