'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { useStore } from '@/components/store/store-provider';
import { ProductImage } from '@/components/product-image';
import { EmptyState } from '@/components/empty-state';
import { formatTaka } from '@/lib/format';

export default function WishlistPage() {
  const { wishlist, toggleWish, ready } = useStore();
  return (
    <div className="container-x py-12 lg:py-20">
      <h1 className="heading-lg mb-10">পছন্দের তালিকা</h1>
      {!ready ? null : wishlist.length === 0 ? (
        <EmptyState title="পছন্দের তালিকা খালি" body="পণ্যের ছবিতে হার্ট চিহ্নে চাপ দিয়ে পছন্দের পণ্য এখানে রেখে দিন।" action={{ href: '/shop', label: 'পণ্য দেখুন' }} />
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {wishlist.map((w) => (
            <div key={w.productId} className="relative">
              <Link href={`/product/${w.slug}`} className="block">
                <div className="relative aspect-[4/5] bg-sand"><ProductImage src={w.image} alt={w.name} sizes="25vw" /></div>
                <p className="mt-3 font-medium">{w.name}</p>
                <p className="font-ui text-[15px]">{formatTaka(w.price)}</p>
              </Link>
              <button onClick={() => toggleWish(w)} aria-label="তালিকা থেকে সরান" className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center bg-ivory/90"><X size={16} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
