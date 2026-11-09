-- VAASORA — initial schema
-- Prices are always recalculated inside the database (quote_order / create_order).
-- The browser never supplies a price or total that is trusted.

create extension if not exists pgcrypto;

-- ───────────────────────── helpers ─────────────────────────
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

-- ───────────────────────── auth / admin ─────────────────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('owner','admin','staff')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid() and role = 'owner');
$$;

-- ───────────────────────── catalog ─────────────────────────
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name_bn text not null,
  name_en text,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text,
  image_url text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name_bn text not null check (length(trim(name_bn)) > 0),
  name_en text,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  sku text unique,
  category_id uuid references public.categories(id) on delete set null,
  short_description text,
  description text,
  care_info text,
  regular_price numeric(12,2) not null check (regular_price >= 0),
  sale_price numeric(12,2) check (sale_price is null or (sale_price >= 0 and sale_price < regular_price)),
  effective_price numeric(12,2) generated always as (coalesce(sale_price, regular_price)) stored,
  stock int not null default 0 check (stock >= 0),
  dimensions text,
  weight_grams int check (weight_grams is null or weight_grams > 0),
  material text,
  color text,
  features text[] not null default '{}',
  thumbnail_url text,
  is_featured boolean not null default false,
  is_new boolean not null default false,
  is_active boolean not null default true,
  meta_title text,
  meta_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_idx on public.products(category_id);
create index products_active_featured_idx on public.products(is_active, is_featured);
create index products_price_idx on public.products(effective_price);
create index products_created_idx on public.products(created_at desc);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index product_images_product_idx on public.product_images(product_id, sort_order);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name_bn text not null,          -- e.g. "বড় / সাদা"
  size text,
  color text,
  sku text unique,
  price numeric(12,2) check (price is null or price >= 0),  -- null = use product price
  stock int not null default 0 check (stock >= 0),
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index product_variants_product_idx on public.product_variants(product_id);

-- ───────────────────────── customers ─────────────────────────
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique check (phone ~ '^01[3-9][0-9]{8}$'),
  name text not null,
  email text,
  user_id uuid references auth.users(id) on delete set null,  -- for future accounts
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  division text not null,
  district text not null,
  upazila text not null,
  area text not null,
  address_line text not null,
  created_at timestamptz not null default now()
);
create index addresses_customer_idx on public.addresses(customer_id);

-- ───────────────────────── delivery & payment ─────────────────────────
create table public.delivery_zones (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name_bn text not null,
  charge numeric(12,2) not null check (charge >= 0),
  districts text[] not null default '{}',   -- district codes, e.g. {bogura}
  is_default boolean not null default false, -- used when no zone matches the district
  estimated_days text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payment_methods (
  code text primary key,
  name_bn text not null,
  description_bn text,
  is_available boolean not null default false, -- true only after a real, tested integration exists
  is_enabled boolean not null default false,   -- admin toggle
  sort_order int not null default 0,
  updated_at timestamptz not null default now(),
  constraint enabled_requires_available check (not is_enabled or is_available)
);

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = upper(code) and length(code) between 3 and 40),
  discount_type text not null check (discount_type in ('percent','fixed')),
  value numeric(12,2) not null check (value > 0),
  min_order numeric(12,2) not null default 0,
  max_discount numeric(12,2),
  starts_at timestamptz,
  ends_at timestamptz,
  usage_limit int check (usage_limit is null or usage_limit > 0),
  used_count int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint percent_range check (discount_type <> 'percent' or value <= 100)
);

-- ───────────────────────── orders ─────────────────────────
create table public.order_counters (
  period text primary key,   -- YYYYMM (Asia/Dhaka)
  last_value int not null
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  public_token uuid not null unique default gen_random_uuid(), -- secret link for the confirmation page
  customer_id uuid references public.customers(id) on delete set null,
  customer_name text not null,
  phone text not null check (phone ~ '^01[3-9][0-9]{8}$'),
  email text,
  division text not null,
  district text not null,
  district_code text not null,
  upazila text not null,
  area text not null,
  address_line text not null,
  note text,
  delivery_zone_id uuid references public.delivery_zones(id) on delete set null,
  subtotal numeric(12,2) not null check (subtotal >= 0),
  discount numeric(12,2) not null default 0 check (discount >= 0),
  delivery_charge numeric(12,2) not null default 0 check (delivery_charge >= 0),
  total numeric(12,2) not null check (total >= 0),
  coupon_id uuid references public.coupons(id) on delete set null,
  payment_method text not null references public.payment_methods(code),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','paid','refunded')),
  status text not null default 'pending' check (status in
    ('pending','confirmed','processing','shipped','out_for_delivery','delivered','cancelled','returned')),
  idempotency_key text not null unique,
  courier_name text,          -- future courier integration
  courier_tracking_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint total_matches check (total = subtotal - discount + delivery_charge)
);
create index orders_phone_idx on public.orders(phone);
create index orders_status_idx on public.orders(status);
create index orders_created_idx on public.orders(created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  variant_name text,
  sku text,
  unit_price numeric(12,2) not null check (unit_price >= 0),
  quantity int not null check (quantity > 0),
  line_total numeric(12,2) not null check (line_total = unit_price * quantity),
  created_at timestamptz not null default now()
);
create index order_items_order_idx on public.order_items(order_id);

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null,
  changed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index order_status_history_order_idx on public.order_status_history(order_id, created_at);

create table public.order_notes (     -- internal, admin-only
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  note text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  method text not null references public.payment_methods(code),
  amount numeric(12,2) not null check (amount >= 0),
  status text not null default 'pending' check (status in ('pending','completed','failed','refunded')),
  provider_ref text,
  raw_response jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index payments_order_idx on public.payments(order_id);

create table public.coupon_usages (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  phone text not null,
  created_at timestamptz not null default now()
);

-- ───────────────────────── content ─────────────────────────
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  customer_name text not null,
  rating int not null check (rating between 1 and 5),
  comment text not null,
  is_approved boolean not null default false,  -- only approved reviews are public
  created_at timestamptz not null default now()
);
create index reviews_public_idx on public.reviews(product_id) where is_approved;

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  subject text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.site_settings (
  key text primary key,
  value jsonb,
  updated_at timestamptz not null default now()
);

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  placement text not null default 'hero',
  title text,
  subtitle text,
  image_url text,
  cta_label text,
  cta_href text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

create table public.inventory_logs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  change int not null,
  reason text not null,
  order_id uuid references public.orders(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.rate_limits (
  key text not null,
  window_start timestamptz not null,
  count int not null,
  primary key (key, window_start)
);

-- updated_at triggers
do $$ declare t text; begin
  foreach t in array array['profiles','categories','products','product_variants','customers',
    'delivery_zones','payment_methods','coupons','orders','payments','banners','site_settings'] loop
    execute format('create trigger %I_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

-- ───────────────────────── RLS ─────────────────────────
do $$ declare t text; begin
  foreach t in array array['profiles','categories','products','product_images','product_variants',
    'customers','addresses','delivery_zones','payment_methods','coupons','order_counters','orders',
    'order_items','order_status_history','order_notes','payments','coupon_usages','reviews',
    'contact_messages','site_settings','banners','newsletter_subscribers','inventory_logs','rate_limits'] loop
    execute format('alter table public.%I enable row level security', t);
    if t <> 'rate_limits' then
      execute format('create policy "admins manage %s" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t, t);
    end if;
  end loop;
end $$;

alter table public.admin_users enable row level security;
create policy "admins read admin list" on public.admin_users for select to authenticated using (public.is_admin());
create policy "owner manages admins" on public.admin_users for all to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid());
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Public (anon + logged-in) read access: published catalog and approved content only.
create policy "public read categories" on public.categories for select to anon, authenticated using (is_active);
create policy "public read products" on public.products for select to anon, authenticated using (is_active);
create policy "public read product images" on public.product_images for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.is_active));
create policy "public read variants" on public.product_variants for select to anon, authenticated
  using (is_active and exists (select 1 from public.products p where p.id = product_id and p.is_active));
create policy "public read zones" on public.delivery_zones for select to anon, authenticated using (is_active);
create policy "public read payment methods" on public.payment_methods for select to anon, authenticated using (true);
create policy "public read approved reviews" on public.reviews for select to anon, authenticated using (is_approved);
create policy "public read banners" on public.banners for select to anon, authenticated using (is_active);
-- site_settings is public: NEVER store secrets or API keys here.
create policy "public read settings" on public.site_settings for select to anon, authenticated using (true);
-- orders, customers, addresses, payments, coupons, messages: no public policy => no public access.

-- ───────────────────────── storage ─────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do nothing;

create policy "public read product images bucket" on storage.objects for select using (bucket_id = 'product-images');
create policy "admins upload product images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin());
create policy "admins update product images" on storage.objects for update to authenticated using (bucket_id = 'product-images' and public.is_admin());
create policy "admins delete product images" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());

-- ───────────────────────── pricing (single source of truth) ─────────────────────────
-- Input: { items:[{product_id, variant_id|null, quantity}], district_code, coupon_code }
create or replace function public.quote_order(p jsonb) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_item jsonb; v_qty int; v_prod record; v_var record; v_price numeric(12,2);
  v_lines jsonb := '[]'::jsonb; v_subtotal numeric(12,2) := 0; v_discount numeric(12,2) := 0;
  v_zone record; v_delivery numeric(12,2); v_threshold numeric; v_coupon record; v_coupon_id uuid;
  v_code text := upper(trim(coalesce(p->>'coupon_code', '')));
begin
  if jsonb_typeof(p->'items') is distinct from 'array' or jsonb_array_length(p->'items') = 0 then
    raise exception 'EMPTY_CART';
  end if;
  if jsonb_array_length(p->'items') > 50 then raise exception 'TOO_MANY_ITEMS'; end if;

  for v_item in select value from jsonb_array_elements(p->'items') loop
    v_qty := (v_item->>'quantity')::int;
    if v_qty is null or v_qty < 1 or v_qty > 100 then raise exception 'INVALID_QUANTITY'; end if;

    select id, name_bn, sku, stock, regular_price, sale_price into v_prod
      from products where id = (v_item->>'product_id')::uuid and is_active;
    if not found then raise exception 'PRODUCT_UNAVAILABLE'; end if;

    if nullif(v_item->>'variant_id', '') is not null then
      select id, name_bn, sku, stock, price into v_var
        from product_variants where id = (v_item->>'variant_id')::uuid and product_id = v_prod.id and is_active;
      if not found then raise exception 'PRODUCT_UNAVAILABLE'; end if;
      if v_var.stock < v_qty then raise exception 'OUT_OF_STOCK'; end if;
      v_price := coalesce(v_var.price, v_prod.sale_price, v_prod.regular_price);
      v_lines := v_lines || jsonb_build_array(jsonb_build_object(
        'product_id', v_prod.id, 'variant_id', v_var.id, 'name', v_prod.name_bn, 'variant_name', v_var.name_bn,
        'sku', coalesce(v_var.sku, v_prod.sku), 'unit_price', v_price, 'quantity', v_qty, 'line_total', v_price * v_qty));
    else
      if v_prod.stock < v_qty then raise exception 'OUT_OF_STOCK'; end if;
      v_price := coalesce(v_prod.sale_price, v_prod.regular_price);
      v_lines := v_lines || jsonb_build_array(jsonb_build_object(
        'product_id', v_prod.id, 'variant_id', null, 'name', v_prod.name_bn, 'variant_name', null,
        'sku', v_prod.sku, 'unit_price', v_price, 'quantity', v_qty, 'line_total', v_price * v_qty));
    end if;
    v_subtotal := v_subtotal + v_price * v_qty;
  end loop;

  if v_code <> '' then
    select id, discount_type, value, min_order, max_discount into v_coupon from coupons
     where code = v_code and is_active
       and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now())
       and (usage_limit is null or used_count < usage_limit);
    if not found then raise exception 'INVALID_COUPON'; end if;
    if v_subtotal < v_coupon.min_order then raise exception 'COUPON_MIN_ORDER'; end if;
    v_discount := case when v_coupon.discount_type = 'percent' then round(v_subtotal * v_coupon.value / 100) else v_coupon.value end;
    if v_coupon.max_discount is not null then v_discount := least(v_discount, v_coupon.max_discount); end if;
    v_discount := least(v_discount, v_subtotal);
    v_coupon_id := v_coupon.id;
  end if;

  select id, name_bn, charge into v_zone from delivery_zones
   where is_active and nullif(p->>'district_code', '') = any(districts) order by sort_order limit 1;
  if not found then
    select id, name_bn, charge into v_zone from delivery_zones where is_active and is_default order by sort_order limit 1;
  end if;
  if not found then raise exception 'NO_DELIVERY_ZONE'; end if;
  v_delivery := v_zone.charge;

  select (value #>> '{}')::numeric into v_threshold from site_settings where key = 'free_delivery_threshold';
  if v_threshold is not null and v_threshold > 0 and (v_subtotal - v_discount) >= v_threshold then
    v_delivery := 0;
  end if;

  return jsonb_build_object(
    'lines', v_lines, 'subtotal', v_subtotal, 'discount', v_discount, 'delivery_charge', v_delivery,
    'total', v_subtotal - v_discount + v_delivery, 'zone_id', v_zone.id, 'zone_name', v_zone.name_bn,
    'coupon_id', v_coupon_id, 'free_delivery_threshold', v_threshold);
end $$;

-- Input: quote_order input + { idempotency_key, name, phone (normalised 01XXXXXXXXX), email, division,
--   district, district_code, upazila, area, address_line, note, payment_method }
create or replace function public.create_order(p jsonb) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare
  v_key text := p->>'idempotency_key'; v_phone text := p->>'phone';
  v_existing record; v_q jsonb; v_line jsonb; v_order_id uuid; v_token uuid; v_customer_id uuid;
  v_seq int; v_period text := to_char(now() at time zone 'Asia/Dhaka', 'YYYYMM'); v_number text;
  v_rows int; v_qty int;
begin
  if v_key is null or length(v_key) < 16 or length(v_key) > 64 then raise exception 'INVALID_REQUEST'; end if;

  -- Serialise concurrent submissions with the same key (double taps, retries).
  perform pg_advisory_xact_lock(hashtext(v_key));
  select order_number, public_token into v_existing from orders where idempotency_key = v_key;
  if found then
    return jsonb_build_object('order_number', v_existing.order_number, 'token', v_existing.public_token, 'duplicate', true);
  end if;

  if v_phone is null or v_phone !~ '^01[3-9][0-9]{8}$' then raise exception 'INVALID_PHONE'; end if;
  if length(trim(coalesce(p->>'name', ''))) < 2 then raise exception 'INVALID_NAME'; end if;
  if coalesce(trim(p->>'division'),'') = '' or coalesce(trim(p->>'district'),'') = ''
     or coalesce(trim(p->>'upazila'),'') = '' or coalesce(trim(p->>'area'),'') = ''
     or coalesce(trim(p->>'address_line'),'') = '' then
    raise exception 'INVALID_ADDRESS';
  end if;
  if not exists (select 1 from payment_methods where code = p->>'payment_method' and is_enabled and is_available) then
    raise exception 'PAYMENT_METHOD_UNAVAILABLE';
  end if;

  v_q := quote_order(p);

  insert into customers (phone, name, email)
  values (v_phone, trim(p->>'name'), nullif(trim(p->>'email'), ''))
  on conflict (phone) do update set name = excluded.name, email = coalesce(excluded.email, customers.email)
  returning id into v_customer_id;

  insert into addresses (customer_id, division, district, upazila, area, address_line)
  values (v_customer_id, p->>'division', p->>'district', trim(p->>'upazila'), trim(p->>'area'), trim(p->>'address_line'));

  insert into order_counters (period, last_value) values (v_period, 1)
  on conflict (period) do update set last_value = order_counters.last_value + 1
  returning last_value into v_seq;
  v_number := 'VAA-' || v_period || '-' || lpad(v_seq::text, 4, '0');

  insert into orders (order_number, customer_id, customer_name, phone, email, division, district, district_code,
    upazila, area, address_line, note, delivery_zone_id, subtotal, discount, delivery_charge, total, coupon_id,
    payment_method, idempotency_key)
  values (v_number, v_customer_id, trim(p->>'name'), v_phone, nullif(trim(p->>'email'), ''), p->>'division',
    p->>'district', p->>'district_code', trim(p->>'upazila'), trim(p->>'area'), trim(p->>'address_line'),
    nullif(trim(p->>'note'), ''), (v_q->>'zone_id')::uuid, (v_q->>'subtotal')::numeric,
    (v_q->>'discount')::numeric, (v_q->>'delivery_charge')::numeric, (v_q->>'total')::numeric,
    (v_q->>'coupon_id')::uuid, p->>'payment_method', v_key)
  returning id, public_token into v_order_id, v_token;

  for v_line in select value from jsonb_array_elements(v_q->'lines') loop
    v_qty := (v_line->>'quantity')::int;
    -- Atomic decrement: fails if another order took the stock first.
    if v_line->>'variant_id' is not null then
      update product_variants set stock = stock - v_qty where id = (v_line->>'variant_id')::uuid and stock >= v_qty;
    else
      update products set stock = stock - v_qty where id = (v_line->>'product_id')::uuid and stock >= v_qty;
    end if;
    get diagnostics v_rows = row_count;
    if v_rows = 0 then raise exception 'OUT_OF_STOCK'; end if;

    insert into order_items (order_id, product_id, variant_id, product_name, variant_name, sku, unit_price, quantity, line_total)
    values (v_order_id, (v_line->>'product_id')::uuid, (v_line->>'variant_id')::uuid, v_line->>'name',
      v_line->>'variant_name', v_line->>'sku', (v_line->>'unit_price')::numeric, v_qty, (v_line->>'line_total')::numeric);

    insert into inventory_logs (product_id, variant_id, change, reason, order_id)
    values ((v_line->>'product_id')::uuid, (v_line->>'variant_id')::uuid, -v_qty, 'order', v_order_id);
  end loop;

  if v_q->>'coupon_id' is not null then
    update coupons set used_count = used_count + 1
     where id = (v_q->>'coupon_id')::uuid and (usage_limit is null or used_count < usage_limit);
    get diagnostics v_rows = row_count;
    if v_rows = 0 then raise exception 'INVALID_COUPON'; end if;
    insert into coupon_usages (coupon_id, order_id, phone) values ((v_q->>'coupon_id')::uuid, v_order_id, v_phone);
  end if;

  insert into payments (order_id, method, amount, status) values (v_order_id, p->>'payment_method', (v_q->>'total')::numeric, 'pending');
  insert into order_status_history (order_id, status) values (v_order_id, 'pending');

  return jsonb_build_object('order_number', v_number, 'token', v_token, 'duplicate', false);
end $$;

-- Public tracking: requires order number AND phone; returns no address or personal data.
create or replace function public.track_order(p_order_number text, p_phone text) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'order_number', o.order_number, 'status', o.status, 'created_at', o.created_at, 'total', o.total,
    'payment_method', o.payment_method,
    'items', (select coalesce(jsonb_agg(jsonb_build_object('name', i.product_name, 'variant', i.variant_name, 'quantity', i.quantity) order by i.created_at), '[]'::jsonb)
              from order_items i where i.order_id = o.id),
    'history', (select coalesce(jsonb_agg(jsonb_build_object('status', h.status, 'at', h.created_at) order by h.created_at), '[]'::jsonb)
                from order_status_history h where h.order_id = o.id))
  from orders o
  where o.order_number = upper(trim(p_order_number)) and o.phone = p_phone
  limit 1;
$$;

-- Status changes: log history, restore stock on cancel/return, block reopening.
create or replace function public.on_order_status_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = old.status then return new; end if;
  if old.status in ('cancelled','returned') then
    raise exception 'ORDER_CLOSED';
  end if;
  if new.status in ('cancelled','returned') then
    update products p set stock = p.stock + s.q
      from (select product_id, sum(quantity)::int q from order_items where order_id = new.id and variant_id is null and product_id is not null group by product_id) s
     where p.id = s.product_id;
    update product_variants v set stock = v.stock + s.q
      from (select variant_id, sum(quantity)::int q from order_items where order_id = new.id and variant_id is not null group by variant_id) s
     where v.id = s.variant_id;
    insert into inventory_logs (product_id, variant_id, change, reason, order_id, created_by)
      select product_id, variant_id, quantity, new.status, new.id, auth.uid() from order_items where order_id = new.id;
  end if;
  insert into order_status_history (order_id, status, changed_by) values (new.id, new.status, auth.uid());
  return new;
end $$;
create trigger orders_status_change before update of status on public.orders
  for each row execute function public.on_order_status_change();

-- Fixed-window rate limiter. Stores only hashed keys.
create or replace function public.check_rate_limit(p_key text, p_max int, p_window int) returns boolean
language plpgsql volatile security definer set search_path = public as $$
declare v_start timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window) * p_window); v_count int;
begin
  insert into rate_limits (key, window_start, count) values (p_key, v_start, 1)
  on conflict (key, window_start) do update set count = rate_limits.count + 1
  returning count into v_count;
  if random() < 0.01 then delete from rate_limits where window_start < now() - interval '1 day'; end if;
  return v_count <= p_max;
end $$;

-- These functions run with elevated rights, so only the server (service role) may call them.
revoke all on function public.quote_order(jsonb) from public, anon, authenticated;
revoke all on function public.create_order(jsonb) from public, anon, authenticated;
revoke all on function public.track_order(text, text) from public, anon, authenticated;
revoke all on function public.check_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function public.quote_order(jsonb) to service_role;
grant execute on function public.create_order(jsonb) to service_role;
grant execute on function public.track_order(text, text) to service_role;
grant execute on function public.check_rate_limit(text, int, int) to service_role;
