import { cache } from 'react';
import { publicClient } from './supabase/public';
import type { Banner, Category, DeliveryZone, PaymentMethodOption, Product, Review, SiteSettings } from './types';

export const DEFAULT_SETTINGS: SiteSettings = {
  announcement_text: 'VAASORA-তে স্বাগতম | আপনার ঘরের সৌন্দর্যে নতুন মাত্রা যোগ করুন',
  contact_phone: '01411420001',
  whatsapp_number: '',
  contact_email: '',
  address: 'Ekota Nir, Ground Floor, Upashahar Main Road, Bogura Sadar, Bogura 5800, Bangladesh.',
  social_links: {},
  free_delivery_threshold: null,
};

const PRODUCT_SELECT =
  'id,name_bn,name_en,slug,sku,short_description,description,care_info,regular_price,sale_price,stock,dimensions,weight_grams,material,color,features,thumbnail_url,is_featured,is_new,meta_title,meta_description,created_at,' +
  'category:categories(name_bn,slug),images:product_images(url,alt,sort_order),variants:product_variants(id,name_bn,size,color,sku,price,stock,sort_order,is_active)';

function logError(where: string, error: unknown) {
  if (error) console.error(`[data:${where}]`, error);
}

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const db = publicClient();
  if (!db) return DEFAULT_SETTINGS;
  const { data, error } = await db.from('site_settings').select('key,value');
  logError('settings', error);
  const merged: Record<string, unknown> = { ...DEFAULT_SETTINGS };
  for (const row of data ?? []) if (row.value !== null && row.value !== '') merged[row.key] = row.value;
  return merged as SiteSettings;
});

export const getCategories = cache(async (): Promise<Category[]> => {
  const db = publicClient();
  if (!db) return [];
  const { data, error } = await db.from('categories').select('id,name_bn,name_en,slug,description,image_url,sort_order').order('sort_order');
  logError('categories', error);
  return (data ?? []) as Category[];
});

export async function getCategory(slug: string): Promise<Category | null> {
  return (await getCategories()).find((c) => c.slug === slug) ?? null;
}

export type ProductQuery = { q?: string; categorySlug?: string; sort?: string; featured?: boolean; limit?: number };

export async function getProducts(opts: ProductQuery = {}): Promise<Product[]> {
  const db = publicClient();
  if (!db) return [];
  let query = db.from('products').select(PRODUCT_SELECT);

  if (opts.featured) query = query.eq('is_featured', true);
  if (opts.categorySlug) {
    const cat = await getCategory(opts.categorySlug);
    if (!cat) return [];
    query = query.eq('category_id', cat.id);
  }
  // Strip characters that have meaning in PostgREST filter syntax.
  const q = opts.q?.replace(/[%,()*\\]/g, ' ').trim().slice(0, 60);
  if (q) query = query.or(`name_bn.ilike.%${q}%,name_en.ilike.%${q}%,short_description.ilike.%${q}%`);

  if (opts.sort === 'price_asc') query = query.order('effective_price', { ascending: true });
  else if (opts.sort === 'price_desc') query = query.order('effective_price', { ascending: false });
  else query = query.order('created_at', { ascending: false });

  query = query.limit(opts.limit ?? 60);
  const { data, error } = await query;
  logError('products', error);
  return (data ?? []) as unknown as Product[];
}

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  const db = publicClient();
  if (!db) return null;
  const { data, error } = await db.from('products').select(PRODUCT_SELECT).eq('slug', slug).maybeSingle();
  logError('product', error);
  return (data as unknown as Product) ?? null;
});

export async function getRelatedProducts(p: Product, limit = 4): Promise<Product[]> {
  if (!p.category) return [];
  return (await getProducts({ categorySlug: p.category.slug, limit: limit + 1 })).filter((x) => x.id !== p.id).slice(0, limit);
}

export async function getApprovedReviews(productId?: string, limit = 6): Promise<Review[]> {
  const db = publicClient();
  if (!db) return [];
  let q = db.from('reviews').select('id,customer_name,rating,comment,created_at').order('created_at', { ascending: false }).limit(limit);
  if (productId) q = q.eq('product_id', productId);
  const { data, error } = await q;
  logError('reviews', error);
  return (data ?? []) as Review[];
}

export async function getBanner(placement: string): Promise<Banner | null> {
  const db = publicClient();
  if (!db) return null;
  const { data, error } = await db.from('banners').select('id,title,subtitle,image_url,cta_label,cta_href')
    .eq('placement', placement).order('sort_order').limit(1).maybeSingle();
  logError('banner', error);
  return (data as Banner) ?? null;
}

export async function getDeliveryZones(): Promise<DeliveryZone[]> {
  const db = publicClient();
  if (!db) return [];
  const { data, error } = await db.from('delivery_zones').select('id,code,name_bn,charge,districts,is_default').order('sort_order');
  logError('zones', error);
  return (data ?? []) as DeliveryZone[];
}

export async function getEnabledPaymentMethods(): Promise<PaymentMethodOption[]> {
  const db = publicClient();
  if (!db) return [];
  const { data, error } = await db.from('payment_methods').select('code,name_bn,description_bn')
    .eq('is_enabled', true).eq('is_available', true).order('sort_order');
  logError('payment_methods', error);
  return (data ?? []) as PaymentMethodOption[];
}
