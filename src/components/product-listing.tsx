import Link from 'next/link';
import type { Category, Product } from '@/lib/types';
import { toSummary } from '@/lib/product';
import { ProductCard } from './product-card';
import { EmptyState } from './empty-state';
import { SortSelect } from './sort-select';

export function ProductListing({ products, categories, activeCategory, q, sort, basePath }: {
  products: Product[]; categories: Category[]; activeCategory?: string; q?: string; sort?: string; basePath: string;
}) {
  const qs = (params: Record<string, string | undefined>) => {
    const s = new URLSearchParams(Object.entries(params).filter(([, v]) => !!v) as [string, string][]).toString();
    return s ? `?${s}` : '';
  };
  const pill = (active: boolean) =>
    `whitespace-nowrap border px-4 py-2 text-[14px] transition-colors ${active ? 'border-ink bg-ink text-ivory' : 'border-line bg-card hover:border-ink'}`;

  return (
    <>
      <div className="mb-10 flex flex-col gap-5 border-b border-line pb-6 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="ক্যাটাগরি ফিল্টার" className="-mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
          <Link href={`/shop${qs({ q, sort })}`} className={pill(!activeCategory)}>সব</Link>
          {categories.map((c) => (
            <Link key={c.id} href={`/category/${c.slug}${qs({ q, sort })}`} className={pill(activeCategory === c.slug)}>{c.name_bn}</Link>
          ))}
        </nav>
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-stone">{products.length}টি পণ্য</p>
          <SortSelect value={sort ?? ''} basePath={basePath} q={q} />
        </div>
      </div>

      {q && <p className="mb-8 text-stone">“{q}” — অনুসন্ধানের ফলাফল</p>}

      {products.length ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
          {products.map((p, i) => <ProductCard key={p.id} product={toSummary(p)} priority={i < 4} />)}
        </div>
      ) : q ? (
        <EmptyState title="কোনো পণ্য পাওয়া যায়নি" body="অন্য কোনো শব্দ দিয়ে খুঁজে দেখুন, অথবা সব পণ্য দেখুন।" action={{ href: '/shop', label: 'সকল পণ্য দেখুন' }} />
      ) : (
        <EmptyState title="এই মুহূর্তে কোনো পণ্য নেই" body="নতুন কালেকশন শীঘ্রই যোগ হবে। বিশেষ অর্ডারের জন্য আমাদের কল করতে পারেন।" action={{ href: '/contact', label: 'যোগাযোগ করুন' }} />
      )}
    </>
  );
}
