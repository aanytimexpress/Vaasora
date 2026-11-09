-- OPTIONAL DEMO DATA — for testing only. Every row is named "ডেমো" so it cannot be mistaken for real stock.
-- Remove before launch:  delete from products where sku like 'DEMO-%';
insert into public.products (name_bn, name_en, slug, sku, category_id, short_description, description,
  regular_price, sale_price, stock, dimensions, material, color, features, is_featured, is_new)
select 'ডেমো — সাদা সিরামিক ফুলদানি', 'Demo — White Ceramic Vase', 'demo-white-ceramic-vase', 'DEMO-001', c.id,
  'পরীক্ষার জন্য তৈরি ডেমো পণ্য।', 'এটি একটি ডেমো পণ্য। আসল পণ্যের তথ্য দিয়ে প্রতিস্থাপন করুন।',
  2450, null, 10, 'উচ্চতা ৩০ সেমি', 'সিরামিক', 'সাদা', '{"ডেমো বৈশিষ্ট্য"}', true, true
from public.categories c where c.slug = 'ceramic-vase'
on conflict (slug) do nothing;

insert into public.products (name_bn, name_en, slug, sku, category_id, short_description, regular_price, sale_price, stock, is_featured)
select 'ডেমো — অফিস টেবিল প্ল্যান্টার', 'Demo — Office Planter', 'demo-office-planter', 'DEMO-002', c.id,
  'পরীক্ষার জন্য তৈরি ডেমো পণ্য।', 1800, 1550, 4, true
from public.categories c where c.slug = 'office-decor'
on conflict (slug) do nothing;

insert into public.products (name_bn, name_en, slug, sku, category_id, short_description, regular_price, stock, is_featured)
select 'ডেমো — প্রিমিয়াম লম্বা ফুলদানি', 'Demo — Tall Premium Vase', 'demo-tall-premium-vase', 'DEMO-003', c.id,
  'পরীক্ষার জন্য তৈরি ডেমো পণ্য — সাইজ ভ্যারিয়েশনসহ।', 3900, 0, true
from public.categories c where c.slug = 'premium-collection'
on conflict (slug) do nothing;

insert into public.product_variants (product_id, name_bn, size, sku, price, stock, sort_order)
select p.id, v.name_bn, v.size, v.sku, v.price, v.stock, v.ord
from public.products p,
  (values ('মাঝারি', 'M', 'DEMO-003-M', 3900::numeric, 5, 1), ('বড়', 'L', 'DEMO-003-L', 4600::numeric, 2, 2)) as v(name_bn, size, sku, price, stock, ord)
where p.slug = 'demo-tall-premium-vase'
on conflict (sku) do nothing;
