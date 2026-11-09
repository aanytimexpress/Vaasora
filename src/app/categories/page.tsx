import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getCategories } from '@/lib/data';
import { EmptyState } from '@/components/empty-state';
import { VaseMark } from '@/components/vase-mark';

export const metadata: Metadata = { title: 'ক্যাটাগরি', alternates: { canonical: '/categories' } };

export default async function CategoriesPage() {
  const categories = await getCategories();
  return (
    <div className="container-x py-12 lg:py-20">
      <h1 className="heading-lg mb-12">ক্যাটাগরি</h1>
      {categories.length ? (
        <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <Link key={c.id} href={`/category/${c.slug}`} className="group">
              <div className="alcove relative aspect-[3/4] bg-sand">
                {c.image_url
                  ? <Image src={c.image_url} alt={c.name_bn} fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover transition-transform duration-[900ms] group-hover:scale-[1.04]" />
                  : <div className="flex h-full items-end justify-center pb-8 text-bronze/50"><VaseMark className="h-1/2" /></div>}
              </div>
              <p className="mt-4 text-center font-bn-serif text-lg group-hover:text-bronze">{c.name_bn}</p>
              {c.name_en && <p className="text-center font-display italic text-stone">{c.name_en}</p>}
            </Link>
          ))}
        </div>
      ) : <EmptyState title="ক্যাটাগরি শীঘ্রই যোগ হবে" />}
    </div>
  );
}
