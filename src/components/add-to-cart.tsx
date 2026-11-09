'use client';

import { useMemo, useState } from 'react';
import { Heart, Minus, Plus } from 'lucide-react';
import type { Variant } from '@/lib/types';
import { formatTaka } from '@/lib/format';
import { stockLabel } from '@/lib/product';
import { useStore } from './store/store-provider';

type Props = {
  product: { id: string; slug: string; name_bn: string; regular_price: number; sale_price: number | null; stock: number; image: string | null };
  variants: Variant[];
};

export function AddToCart({ product, variants }: Props) {
  const { addToCart, toggleWish, isWished } = useStore();
  const active = useMemo(() => variants.filter((v) => v.is_active).sort((a, b) => a.sort_order - b.sort_order), [variants]);
  const [variantId, setVariantId] = useState<string | null>(active.find((v) => v.stock > 0)?.id ?? null);
  const [qty, setQty] = useState(1);

  const variant = active.find((v) => v.id === variantId) ?? null;
  const needsVariant = active.length > 0;
  const stock = needsVariant ? variant?.stock ?? 0 : product.stock;
  const unitPrice = variant?.price ?? product.sale_price ?? product.regular_price;
  const showRegular = !variant?.price && product.sale_price !== null;
  const label = stockLabel(stock);
  const wished = isWished(product.id);

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-3 font-ui">
        <span className="text-[28px] font-medium">{formatTaka(unitPrice)}</span>
        {showRegular && <span className="text-stone line-through">{formatTaka(product.regular_price)}</span>}
      </div>
      <p className={`mt-1 text-sm ${label.tone === 'out' ? 'text-[#A24A3A]' : label.tone === 'low' ? 'text-bronze' : 'text-stone'}`}>{label.text}</p>

      {needsVariant && (
        <fieldset className="mt-7">
          <legend className="mb-3 text-sm font-medium">বিকল্প বেছে নিন</legend>
          <div className="flex flex-wrap gap-2.5">
            {active.map((v) => (
              <button key={v.id} type="button" onClick={() => { setVariantId(v.id); setQty(1); }} disabled={v.stock <= 0}
                aria-pressed={v.id === variantId}
                className={`min-h-[44px] border px-4 text-[15px] transition-colors disabled:cursor-not-allowed disabled:opacity-40 disabled:line-through ${v.id === variantId ? 'border-ink bg-ink text-ivory' : 'border-line bg-card hover:border-ink'}`}>
                {v.name_bn}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="mt-8 flex flex-wrap items-stretch gap-3">
        <div className="flex h-12 items-center border border-line bg-card" role="group" aria-label="পরিমাণ">
          <button type="button" className="flex h-full w-12 items-center justify-center disabled:opacity-30" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="কমান"><Minus size={16} /></button>
          <span className="w-10 text-center font-ui" aria-live="polite">{qty}</span>
          <button type="button" className="flex h-full w-12 items-center justify-center disabled:opacity-30" onClick={() => setQty((q) => Math.min(stock, q + 1))} disabled={qty >= stock} aria-label="বাড়ান"><Plus size={16} /></button>
        </div>
        <button type="button" className="btn-primary flex-1" disabled={stock <= 0 || (needsVariant && !variant)}
          onClick={() => addToCart({ productId: product.id, variantId: variant?.id ?? null, slug: product.slug, name: product.name_bn, variantName: variant?.name_bn ?? null, price: unitPrice, image: product.image, maxQty: stock }, qty)}>
          {stock <= 0 ? 'স্টক শেষ' : 'কার্টে যোগ করুন'}
        </button>
        <button type="button" aria-pressed={wished} aria-label={wished ? 'পছন্দের তালিকা থেকে সরান' : 'পছন্দের তালিকায় রাখুন'}
          onClick={() => toggleWish({ productId: product.id, slug: product.slug, name: product.name_bn, price: unitPrice, image: product.image })}
          className="flex h-12 w-12 items-center justify-center border border-line bg-card hover:border-ink">
          <Heart size={18} strokeWidth={1.5} fill={wished ? '#9B8060' : 'none'} className={wished ? 'text-bronze' : ''} />
        </button>
      </div>
      <p className="mt-4 text-sm text-stone">পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন — ক্যাশ অন ডেলিভারি।</p>
    </div>
  );
}
