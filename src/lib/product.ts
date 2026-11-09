import type { Product, ProductSummary } from './types';

export const effectivePrice = (p: Pick<Product, 'regular_price' | 'sale_price'>) => p.sale_price ?? p.regular_price;

export function productImages(p: Product): string[] {
  const gallery = [...p.images].sort((a, b) => a.sort_order - b.sort_order).map((i) => i.url);
  const all = p.thumbnail_url ? [p.thumbnail_url, ...gallery.filter((u) => u !== p.thumbnail_url)] : gallery;
  return all;
}

export function totalStock(p: Product) {
  const active = p.variants.filter((v) => v.is_active);
  return active.length ? active.reduce((s, v) => s + v.stock, 0) : p.stock;
}

export function toSummary(p: Product): ProductSummary {
  const images = productImages(p);
  return {
    id: p.id, name_bn: p.name_bn, name_en: p.name_en, slug: p.slug, short_description: p.short_description,
    regular_price: p.regular_price, sale_price: p.sale_price, is_new: p.is_new,
    image: images[0] ?? null, images, stock: totalStock(p), hasVariants: p.variants.some((v) => v.is_active),
    categoryName: p.category?.name_bn ?? null,
  };
}

export function stockLabel(stock: number): { text: string; tone: 'ok' | 'low' | 'out' } {
  if (stock <= 0) return { text: 'স্টক শেষ', tone: 'out' };
  if (stock <= 3) return { text: 'সীমিত স্টক', tone: 'low' };
  return { text: 'স্টকে আছে', tone: 'ok' };
}

export const DEFAULT_CARE_INFO = [
  'সিরামিক ভঙ্গুর — এক হাতে ধরে না তুলে নিচ থেকে দুই হাতে ধরুন।',
  'নরম, শুকনো বা হালকা ভেজা কাপড় দিয়ে পরিষ্কার করুন; ঘষামাজার স্পঞ্জ বা কড়া কেমিক্যাল ব্যবহার করবেন না।',
  'সমতল ও স্থির জায়গায় রাখুন, টেবিলের কিনারা থেকে দূরে।',
  'হঠাৎ খুব গরম বা ঠান্ডা পানি ঢালবেন না।',
  'ডেলিভারির সময় প্যাকেট খুলে ডেলিভারিম্যানের সামনেই পণ্যটি দেখে নিন।',
];
