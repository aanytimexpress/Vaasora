import type { MetadataRoute } from 'next';
import { getCategories, getProducts } from '@/lib/data';
import { POLICIES } from '@/content/policies';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vaasora.com';
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([getProducts({ limit: 1000 }), getCategories()]);
  const staticPaths = ['', '/shop', '/categories', '/about', '/contact', '/faq', '/track-order', ...POLICIES.map((p) => `/policy/${p.slug}`)];
  return [
    ...staticPaths.map((p) => ({ url: `${SITE}${p}`, changeFrequency: 'weekly' as const, priority: p === '' ? 1 : 0.6 })),
    ...categories.map((c) => ({ url: `${SITE}/category/${c.slug}`, changeFrequency: 'weekly' as const, priority: 0.7 })),
    ...products.map((p) => ({ url: `${SITE}/product/${p.slug}`, lastModified: p.created_at, changeFrequency: 'weekly' as const, priority: 0.8 })),
  ];
}
