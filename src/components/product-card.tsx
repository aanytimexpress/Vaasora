'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Eye, Heart } from 'lucide-react';
import type { ProductSummary } from '@/lib/types';
import { stockLabel } from '@/lib/product';
import { ProductImage } from './product-image';
import { Price } from './price';
import { useStore } from './store/store-provider';
import { QuickView } from './quick-view';

export function ProductCard({ product, priority = false }: { product: ProductSummary; priority?: boolean }) {
  const { addToCart, toggleWish, isWished } = useStore();
  const [quick, setQuick] = useState(false);
  const stock = stockLabel(product.stock);
  const wished = isWished(product.id);
  const price = product.sale_price ?? product.regular_price;

  return (
    <article className="group flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden bg-sand">
        <Link href={`/product/${product.slug}`} className="absolute inset-0" aria-label={product.name_bn}>
          <ProductImage src={product.image} alt={product.name_bn} priority={priority}
            sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
            className="transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]" />
        </Link>

        {(product.is_new || product.sale_price !== null) && (
          <span className="absolute left-3 top-3 bg-ivory/95 px-2.5 py-0.5 text-[12px] text-ink">
            {product.sale_price !== null ? 'বিশেষ মূল্য' : 'নতুন'}
          </span>
        )}

        <button onClick={() => toggleWish({ productId: product.id, slug: product.slug, name: product.name_bn, price, image: product.image })}
          aria-label={wished ? 'পছন্দের তালিকা থেকে সরান' : 'পছন্দের তালিকায় রাখুন'} aria-pressed={wished}
          className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center bg-ivory/90 text-ink transition-colors hover:text-bronze">
          <Heart size={17} strokeWidth={1.5} fill={wished ? '#9B8060' : 'none'} className={wished ? 'text-bronze' : ''} />
        </button>

        <button onClick={() => setQuick(true)}
          className="absolute inset-x-3 bottom-3 hidden items-center justify-center gap-2 bg-ivory/95 py-2.5 text-sm text-ink opacity-0 transition-opacity duration-300 hover:bg-ivory group-hover:opacity-100 focus-visible:opacity-100 md:flex">
          <Eye size={16} strokeWidth={1.5} /> এক নজরে দেখুন
        </button>
      </div>

      <div className="flex flex-1 flex-col pt-4">
        {product.categoryName && <p className="text-[13px] text-stone">{product.categoryName}</p>}
        <h3 className="mt-0.5 font-sans text-[16px] font-medium leading-snug">
          <Link href={`/product/${product.slug}`} className="hover:text-bronze">{product.name_bn}</Link>
        </h3>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <Price regular={product.regular_price} sale={product.sale_price} />
          <span className={`text-[12px] ${stock.tone === 'out' ? 'text-[#A24A3A]' : stock.tone === 'low' ? 'text-bronze' : 'text-stone'}`}>{stock.text}</span>
        </div>

        <div className="mt-4">
          {product.hasVariants ? (
            <Link href={`/product/${product.slug}`} className="btn-outline min-h-[44px] w-full text-sm">সাইজ / রং বেছে নিন</Link>
          ) : (
            <button disabled={product.stock <= 0} className="btn-outline min-h-[44px] w-full text-sm"
              onClick={() => addToCart({ productId: product.id, variantId: null, slug: product.slug, name: product.name_bn, variantName: null, price, image: product.image, maxQty: product.stock })}>
              {product.stock <= 0 ? 'স্টক শেষ' : 'কার্টে যোগ করুন'}
            </button>
          )}
        </div>
      </div>

      {quick && <QuickView product={product} onClose={() => setQuick(false)} />}
    </article>
  );
}
