# VAASORA — vaasora.com

Premium ceramic decor store. Next.js 15 (App Router) · TypeScript · Tailwind · Supabase · Vercel.

## What is in this release (Phases 1–4)

| Area | Status |
|---|---|
| Design system (palette, Bangla/English type, alcove motif, components) | Done |
| Homepage (announcement, hero, categories, featured, story, corporate, why VAASORA, reviews, newsletter, footer) | Done |
| Shop, search, category filter, price sort, product details (gallery, zoom, fullscreen, variants, care info) | Done |
| Cart + wishlist (saved in the browser), guest checkout, COD | Done |
| Server-side pricing, stock, delivery zones, free-delivery threshold, coupons, idempotent orders | Done, tested |
| Order confirmation (secret link), order tracking (order no. + phone) | Done |
| About, Contact (saves messages), FAQ, 4 policy pages, sitemap, robots, structured data | Done |
| Database schema for every module, RLS, storage bucket | Done, tested |
| **Admin dashboard (`/admin`)** | **Next phase** — schema, RLS and `is_admin()` are already in place |

## 1. Supabase setup

1. Create a project at supabase.com (region: Singapore is closest to Bangladesh).
2. SQL Editor → run, in order:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_seed_settings.sql`
   - optional: `supabase/demo/demo_products.sql` (three products named "ডেমো — …")
3. **Set real delivery charges and open checkout.** Zones are created inactive so no order can go through at ৳0:
   ```sql
   update delivery_zones set charge = 80,  is_active = true where code = 'inside_bogura';   -- your real amount
   update delivery_zones set charge = 150, is_active = true where code = 'outside_bogura';  -- your real amount
   -- optional free delivery above an amount:
   update site_settings set value = '5000' where key = 'free_delivery_threshold';
   ```
4. Project Settings → API: copy the URL, `anon` key and `service_role` key.

## 2. Run locally

```bash
cp .env.example .env.local   # fill in the values
npm install
npm run dev                  # http://localhost:3000
```

## 3. Deploy to Vercel

1. Push this folder to a GitHub repo and import it in Vercel.
2. Add the four variables from `.env.example` under Settings → Environment Variables. `SUPABASE_SERVICE_ROLE_KEY` must **not** have a `NEXT_PUBLIC_` prefix.
3. Settings → Domains → add `vaasora.com` and `www.vaasora.com`, then set the DNS records Vercel shows at your registrar.

## 4. Admin account (ready now, used by the next phase)

1. Supabase → Authentication → Users → Add user (email + strong password).
2. SQL Editor:
   ```sql
   insert into admin_users (user_id, role)
   select id, 'owner' from auth.users where email = 'owner@example.com';
   ```
Until the dashboard ships, add products in Table Editor (`products`, `product_images`, `product_variants`) and upload photos to the `product-images` storage bucket; paste each file's public URL into `thumbnail_url` / `product_images.url`.

## 5. Information VAASORA needs to confirm

- Real delivery charges per zone, and whether there is a free-delivery threshold.
- Whether 01411420001 is on WhatsApp → `update site_settings set value = '"8801411420001"' where key = 'whatsapp_number';`
- Email and social links (`contact_email`, `social_links` in `site_settings`).
- Policy wording in `src/content/policies.ts` (drafts avoid specific day counts or fees on purpose).
- The four "কেন VAASORA" claims on the homepage — keep only what you can always deliver.
- Hero photo: insert a row in `banners` with `placement = 'hero'` and an `image_url`. Until then an original line-art vase is shown.

## How security works

- The browser sends only product IDs, variant IDs and quantities. `quote_order()` in Postgres reads real prices, stock, zone charges and coupons; `create_order()` re-runs that, decrements stock atomically (`stock >= qty`), and fails the whole order if anything changed.
- Duplicate submissions: each checkout has an idempotency key; an advisory lock plus a unique constraint make a double tap return the same order.
- Order numbers: `VAA-YYYYMM-NNNN`, per-month counter (Asia/Dhaka), unique constraint.
- `create_order`, `quote_order`, `track_order`, `check_rate_limit` are callable only by the service role (server actions), never by the browser.
- RLS: anonymous users can read only active categories/products/variants, approved reviews, active banners/zones and settings. Orders, customers, addresses, coupons and messages have no public access.
- Confirmation page needs a random token in the link; tracking needs order number **and** phone and returns no address.
- Rate limits (hashed IP): orders 8 / 10 min, tracking 15 / 10 min, contact & newsletter 5 / hour. Honeypot field on all public forms.
- Cancelling or returning an order restores stock and logs it; closed orders cannot be reopened.

## Payment architecture

`src/lib/payments/` — each provider is an adapter. A method appears at checkout only if its adapter is registered in `registry.ts` **and** `payment_methods.is_available` and `is_enabled` are true. bKash, Nagad, Rocket, Upay and SSLCommerz rows exist but are unavailable; the database constraint prevents enabling a method that is not available.

## Testing checklist

Verified while building (Postgres 16 + production `next build`):
- [x] Migrations apply cleanly; demo data loads
- [x] Checkout is closed while delivery zones are inactive
- [x] Bogura vs other-district charges; browser-supplied prices ignored
- [x] Variant pricing; stock decrements for products and variants
- [x] Duplicate submit returns the same order; numbers increment (0001, 0002, 0003)
- [x] Out of stock, invalid phone, unavailable payment method rejected
- [x] Coupon percent discount, minimum order, usage limit; free-delivery threshold
- [x] Tracking works with the right phone, returns nothing with the wrong one
- [x] Cancel restores stock; reopening blocked; status history logged
- [x] Anonymous role cannot read orders/customers/coupons or call order functions; hidden products and their variants disappear

Check on your deployment:
- [ ] Place a COD order on a real Android phone at 360px width; confirm the row in `orders`
- [ ] Bangla renders correctly on Windows Chrome, Android Chrome, iPhone Safari
- [ ] Product photos load from Supabase Storage
- [ ] Contact form and newsletter rows appear in Supabase
- [ ] Lighthouse on the homepage and a product page
