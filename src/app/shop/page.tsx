import type { Metadata } from 'next';
import { getCategories, getProducts } from '@/lib/data';
import { ProductListing } from '@/components/product-listing';

export const metadata: Metadata = {
  title: 'সকল পণ্য',
  description: 'VAASORA-এর সিরামিক ফুলদানি, প্ল্যান্টার ও অফিস ডেকোরের সম্পূর্ণ কালেকশন।',
  alternates: { canonical: '/shop' },
};

type SP = Promise<{ q?: string; sort?: string }>;

export default async function ShopPage({ searchParams }: { searchParams: SP }) {
  const { q, sort } = await searchParams;
  const [products, categories] = await Promise.all([getProducts({ q, sort }), getCategories()]);
  return (
    <div className="container-x py-12 lg:py-20">
      <h1 className="heading-lg mb-10">সকল পণ্য</h1>
      <ProductListing products={products} categories={categories} q={q} sort={sort} basePath="/shop" />
    </div>
  );
}
