import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategories, getCategory, getProducts } from '@/lib/data';
import { ProductListing } from '@/components/product-listing';

type Params = Promise<{ slug: string }>;
type SP = Promise<{ q?: string; sort?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCategory(slug);
  if (!c) return {};
  return { title: c.name_bn, description: c.description ?? `VAASORA — ${c.name_bn}`, alternates: { canonical: `/category/${c.slug}` } };
}

export default async function CategoryPage({ params, searchParams }: { params: Params; searchParams: SP }) {
  const [{ slug }, { q, sort }] = await Promise.all([params, searchParams]);
  const category = await getCategory(slug);
  if (!category) notFound();
  const [products, categories] = await Promise.all([getProducts({ categorySlug: slug, q, sort }), getCategories()]);
  return (
    <div className="container-x py-12 lg:py-20">
      <h1 className="heading-lg">{category.name_bn}</h1>
      {category.name_en && <p className="font-display text-lg italic text-stone">{category.name_en}</p>}
      {category.description && <p className="lead mt-4 max-w-2xl">{category.description}</p>}
      <div className="mt-10">
        <ProductListing products={products} categories={categories} activeCategory={slug} q={q} sort={sort} basePath={`/category/${slug}`} />
      </div>
    </div>
  );
}
