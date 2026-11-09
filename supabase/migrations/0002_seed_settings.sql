-- Base configuration. Everything here is editable later (Admin, Phase 2) or in the Supabase table editor.

insert into public.site_settings (key, value) values
  ('announcement_text', to_jsonb('VAASORA-তে স্বাগতম | আপনার ঘরের সৌন্দর্যে নতুন মাত্রা যোগ করুন'::text)),
  ('contact_phone', to_jsonb('01411420001'::text)),
  ('whatsapp_number', to_jsonb(''::text)),        -- e.g. 8801411420001 once confirmed as a WhatsApp number
  ('contact_email', to_jsonb(''::text)),
  ('address', to_jsonb('Ekota Nir, Ground Floor, Upashahar Main Road, Bogura Sadar, Bogura 5800, Bangladesh.'::text)),
  ('social_links', '{"facebook":"","instagram":"","youtube":""}'::jsonb),
  ('free_delivery_threshold', 'null'::jsonb)      -- set a number (e.g. 5000) to enable free delivery
on conflict (key) do nothing;

-- ⚠ Zones start INACTIVE with charge 0. Checkout stays closed (with a "call us" message)
-- until you set the real charges and activate them:
--   update delivery_zones set charge = <amount>, is_active = true where code = 'inside_bogura';
--   update delivery_zones set charge = <amount>, is_active = true where code = 'outside_bogura';
insert into public.delivery_zones (code, name_bn, charge, districts, is_default, estimated_days, sort_order, is_active) values
  ('inside_bogura', 'বগুড়ার ভেতরে', 0, '{bogura}', false, null, 1, false),
  ('outside_bogura', 'বগুড়ার বাইরে / অন্যান্য জেলা', 0, '{}', true, null, 2, false)
on conflict (code) do nothing;

-- Only COD is available. Others become available once a real integration is built and tested.
insert into public.payment_methods (code, name_bn, description_bn, is_available, is_enabled, sort_order) values
  ('cod', 'ক্যাশ অন ডেলিভারি', 'পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন।', true, true, 1),
  ('bkash', 'বিকাশ', null, false, false, 2),
  ('nagad', 'নগদ', null, false, false, 3),
  ('rocket', 'রকেট', null, false, false, 4),
  ('upay', 'উপায়', null, false, false, 5),
  ('sslcommerz', 'কার্ড / অনলাইন পেমেন্ট (SSLCommerz)', null, false, false, 6)
on conflict (code) do nothing;

insert into public.categories (name_bn, name_en, slug, sort_order) values
  ('সিরামিক ফুলদানি', 'Ceramic Vase', 'ceramic-vase', 1),
  ('ডেকোরেটিভ ফুলদানি', 'Decorative Vase', 'decorative-vase', 2),
  ('মডার্ন প্ল্যান্টার', 'Modern Planters', 'modern-planters', 3),
  ('অফিস ডেকোর', 'Office Decor', 'office-decor', 4),
  ('প্রিমিয়াম কালেকশন', 'Premium Collection', 'premium-collection', 5)
on conflict (slug) do nothing;
