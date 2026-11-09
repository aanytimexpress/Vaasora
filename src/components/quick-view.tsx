'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { ProductSummary } from '@/lib/types';
import { stockLabel } from '@/lib/product';
import { ProductImage } from './product-image';
import { Price } from './price';
import { useStore } from './store/store-provider';

export function QuickView({ product, onClose }: { product: ProductSummary; onClose: () => void }) {
  const { addToCart } = useStore();
  const closeRef = useRef<HTMLButtonElement>(null);
  const stock = stockLabel(product.stock);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center sm:p-6" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={product.name_bn}
        className="relative grid max-h-[92vh] w-full max-w-3xl overflow-y-auto bg-ivory sm:grid-cols-2"
        onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} onClick={onClose} aria-label="বন্ধ করুন"
          className="absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center bg-ivory/90"><X size={20} strokeWidth={1.4} /></button>
        <div className="relative aspect-[4/5] bg-sand">
          <ProductImage src={product.image} alt={product.name_bn} sizes="(min-width:640px) 384px, 100vw" />
        </div>
        <div className="flex flex-col p-6 sm:p-8">
          {product.categoryName && <p className="text-sm text-stone">{product.categoryName}</p>}
          <h2 className="mt-1 heading-md">{product.name_bn}</h2>
          <div className="mt-4"><Price regular={product.regular_price} sale={product.sale_price} size="lg" /></div>
          <p className="mt-2 text-sm text-stone">{stock.text}</p>
          {product.short_description && <p className="mt-5 leading-8 text-[#3d3a34]">{product.short_description}</p>}
          <div className="mt-auto flex flex-col gap-3 pt-8">
            {!product.hasVariants && (
              <button disabled={product.stock <= 0} className="btn-primary"
                onClick={() => { addToCart({ productId: product.id, variantId: null, slug: product.slug, name: product.name_bn, variantName: null, price: product.sale_price ?? product.regular_price, image: product.image, maxQty: product.stock }); onClose(); }}>
                {product.stock <= 0 ? 'স্টক শেষ' : 'কার্টে যোগ করুন'}
              </button>
            )}
            <Link href={`/product/${product.slug}`} className={product.hasVariants ? 'btn-primary' : 'btn-outline'}>
              {product.hasVariants ? 'সাইজ / রং বেছে নিন' : 'বিস্তারিত দেখুন'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
