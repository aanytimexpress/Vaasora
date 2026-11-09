import type { Metadata } from 'next';
import { Fragment } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getApprovedReviews, getProductBySlug, getRelatedProducts } from '@/lib/data';
import { DEFAULT_CARE_INFO, effectivePrice, productImages, toSummary, totalStock } from '@/lib/product';
import { formatDate } from '@/lib/format';
import { ProductGallery } from '@/components/product-gallery';
import { AddToCart } from '@/components/add-to-cart';
import { ProductCard } from '@/components/product-card';

type Params = Promise<{ slug: string }>;
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vaasora.com';

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return {};
  const img = productImages(p)[0];
  const description = p.meta_description || p.short_description || `${p.name_bn} — VAASORA`;
  return {
    title: p.meta_title || p.name_bn,
    description,
    alternates: { canonical: `/product/${p.slug}` },
    openGraph: { title: p.name_bn, description, images: img ? [{ url: img }] : undefined },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, reviews] = await Promise.all([getRelatedProducts(product), getApprovedReviews(product.id, 10)]);
  const images = productImages(product);
  const stock = totalStock(product);
  const care = product.care_info ? product.care_info.split('\n').filter(Boolean) : DEFAULT_CARE_INFO;
  const specs = [
    ['উপাদান', product.material], ['রং', product.color], ['মাপ', product.dimensions],
    ['ওজন', product.weight_grams ? `${product.weight_grams} গ্রাম` : null], ['SKU', product.sku],
  ].filter(([, v]) => v) as [string, string][];

  const ld = {
    '@context': 'https://schema.org', '@type': 'Product', name: product.name_bn, sku: product.sku ?? undefined,
    description: product.short_description ?? undefined, image: images, brand: { '@type': 'Brand', name: 'VAASORA' },
    offers: {
      '@type': 'Offer', priceCurrency: 'BDT', price: effectivePrice(product), url: `${SITE}/product/${product.slug}`,
      availability: stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    ...(reviews.length ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1), reviewCount: reviews.length } } : {}),
  };

  return (
    <div className="container-x py-8 lg:py-14">
      <nav aria-label="ব্রেডক্রাম্ব" className="mb-8 text-sm text-stone">
        <Link href="/" className="hover:text-ink">হোম</Link>
        <span className="mx-2">/</span>
        <Link href="/shop" className="hover:text-ink">সকল পণ্য</Link>
        {product.category && (<><span className="mx-2">/</span><Link href={`/category/${product.category.slug}`} className="hover:text-ink">{product.category.name_bn}</Link></>)}
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <ProductGallery images={images} alt={product.name_bn} />

        <div className="lg:sticky lg:top-28 lg:self-start">
          <h1 className="heading-lg">{product.name_bn}</h1>
          {product.name_en && <p className="mt-1 font-display text-xl italic text-stone">{product.name_en}</p>}
          {product.short_description && <p className="lead mt-5">{product.short_description}</p>}

          <div className="mt-8 border-t border-line pt-8">
            <AddToCart
              product={{ id: product.id, slug: product.slug, name_bn: product.name_bn, regular_price: product.regular_price, sale_price: product.sale_price, stock: product.stock, image: images[0] ?? null }}
              variants={product.variants} />
          </div>

          {specs.length > 0 && (
            <dl className="mt-10 grid grid-cols-[auto_1fr] gap-x-8 gap-y-3 border-t border-line pt-8 text-[15px]">
              {specs.map(([k, v]) => (<Fragment key={k}><dt className="text-stone">{k}</dt><dd className={k === 'SKU' ? 'font-ui' : ''}>{v}</dd></Fragment>))}
            </dl>
          )}

          <details className="group mt-8 border-t border-line pt-6" open>
            <summary className="flex cursor-pointer list-none items-center justify-between font-bn-serif text-lg">
              যত্ন ও ব্যবহারবিধি <span className="text-stone transition-transform group-open:rotate-45">+</span>
            </summary>
            <ul className="mt-4 list-disc space-y-2 pl-5 leading-8 text-[#3d3a34]">{care.map((c) => <li key={c}>{c}</li>)}</ul>
          </details>
        </div>
      </div>

      {(product.description || product.features.length > 0) && (
        <section className="mt-20 grid gap-10 border-t border-line pt-14 lg:grid-cols-[1fr_2fr]">
          <h2 className="heading-md">পণ্যের বিবরণ</h2>
          <div className="prose-bn max-w-2xl">
            {product.description?.split('\n').filter(Boolean).map((para) => <p key={para}>{para}</p>)}
            {product.features.length > 0 && <ul>{product.features.map((f) => <li key={f}>{f}</li>)}</ul>}
          </div>
        </section>
      )}

      {reviews.length > 0 && (
        <section className="mt-20 border-t border-line pt-14">
          <h2 className="heading-md mb-8">গ্রাহক রিভিউ</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {reviews.map((r) => (
              <figure key={r.id} className="border border-line bg-card p-6">
                <p className="font-ui text-sm text-bronze">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</p>
                <blockquote className="mt-3 leading-8">{r.comment}</blockquote>
                <figcaption className="mt-4 text-sm text-stone">{r.customer_name} <span className="font-ui">· {formatDate(r.created_at)}</span></figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="heading-md mb-10">একই ধরনের আরও পণ্য</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={toSummary(p)} />)}
          </div>
        </section>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </div>
  );
}
