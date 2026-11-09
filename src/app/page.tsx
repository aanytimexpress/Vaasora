import Link from 'next/link';
import Image from 'next/image';
import { Phone } from 'lucide-react';
import { getApprovedReviews, getBanner, getCategories, getProducts, getSettings } from '@/lib/data';
import { toSummary } from '@/lib/product';
import { ProductCard } from '@/components/product-card';
import { SectionHeading } from '@/components/section-heading';
import { EmptyState } from '@/components/empty-state';
import { VaseMark } from '@/components/vase-mark';
import { SubscribeForm } from '@/components/subscribe-form';
import { WhatsAppIcon } from '@/components/whatsapp-icon';

export default async function HomePage() {
  const [settings, hero, categories, featured, reviews] = await Promise.all([
    getSettings(), getBanner('hero'), getCategories(), getProducts({ featured: true, limit: 8 }), getApprovedReviews(undefined, 3),
  ]);
  const products = featured.map(toSummary);
  const wa = settings.whatsapp_number
    ? `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent('আসসালামু আলাইকুম, VAASORA থেকে কর্পোরেট অর্ডার সম্পর্কে জানতে চাই।')}`
    : null;

  return (
    <>
      {/* HERO — the alcove */}
      <section className="overflow-hidden border-b border-line">
        <div className="container-x grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-24">
          <div className="hero-reveal order-2 lg:order-1">
            <p className="font-display text-xl italic text-bronze sm:text-2xl">Elevate Your Space.</p>
            <h1 className="heading-xl mt-4 max-w-xl">{hero?.title || 'সৌন্দর্য ছড়িয়ে পড়ুক প্রতিটি কোণে'}</h1>
            <p className="lead mt-6 max-w-lg">
              {hero?.subtitle || 'আপনার ঘর ও কর্মক্ষেত্রের সৌন্দর্য বাড়াতে বেছে নিন VAASORA-এর নান্দনিক সিরামিক কালেকশন।'}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href={hero?.cta_href || '/shop'} className="btn-primary">{hero?.cta_label || 'কালেকশন দেখুন'}</Link>
              <Link href="/about" className="btn-outline">আমাদের সম্পর্কে জানুন</Link>
            </div>
          </div>

          <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
            <div className="hero-alcove alcove relative aspect-[3/4] w-[78%] max-w-[460px] bg-sand sm:w-[60%] lg:w-full">
              {hero?.image_url ? (
                <Image src={hero.image_url} alt={hero.title || 'VAASORA সিরামিক কালেকশন'} fill priority sizes="(min-width:1024px) 460px, 78vw" className="object-cover" />
              ) : (
                <div className="flex h-full items-end justify-center pb-[12%] text-bronze">
                  <VaseMark className="h-[58%]" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      {categories.length > 0 && (
        <section className="container-x py-20 lg:py-28">
          <SectionHeading title="ক্যাটাগরি অনুযায়ী দেখুন" link={{ href: '/categories', label: 'সব ক্যাটাগরি' }} />
          <div className="-mx-5 flex snap-x gap-5 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-5">
            {categories.map((c) => (
              <Link key={c.id} href={`/category/${c.slug}`} className="group w-[62%] shrink-0 snap-start sm:w-auto">
                <div className="alcove relative aspect-[3/4] bg-sand">
                  {c.image_url ? (
                    <Image src={c.image_url} alt={c.name_bn} fill sizes="(min-width:1024px) 20vw, 60vw" className="object-cover transition-transform duration-[900ms] group-hover:scale-[1.04]" />
                  ) : (
                    <div className="flex h-full items-end justify-center pb-8 text-bronze/50"><VaseMark className="h-1/2" /></div>
                  )}
                </div>
                <p className="mt-4 text-center font-bn-serif text-lg transition-colors group-hover:text-bronze">{c.name_bn}</p>
                {c.name_en && <p className="text-center font-display text-[15px] italic text-stone">{c.name_en}</p>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FEATURED */}
      <section className="border-t border-line bg-sand/60 py-20 lg:py-28">
        <div className="container-x">
          <SectionHeading title="বাছাই করা পণ্য" intro="ঘর, রিসেপশন কিংবা এক্সিকিউটিভ কেবিন — প্রতিটি জায়গার জন্য মানানসই।" link={{ href: '/shop', label: 'সকল পণ্য দেখুন' }} />
          {products.length ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4">
              {products.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 2} />)}
            </div>
          ) : (
            <EmptyState title="নতুন কালেকশন শীঘ্রই আসছে" body="আমাদের প্রথম কালেকশন সাজানো হচ্ছে। জানতে চাইলে নিচে ইমেইল দিয়ে রাখুন বা কল করুন।" />
          )}
        </div>
      </section>

      {/* BRAND STORY */}
      <section className="container-x grid gap-10 py-20 lg:grid-cols-[1fr_1.1fr] lg:gap-20 lg:py-32">
        <h2 className="heading-lg max-w-md lg:text-[2.6rem] lg:leading-[1.35]">শুধু সাজসজ্জা নয়, প্রতিটি পণ্যে নান্দনিকতার ছোঁয়া।</h2>
        <div className="space-y-5 text-[17px] leading-[1.95] text-[#3d3a34]">
          <p>একটি সুন্দর ফুলদানি একটা ঘরের মেজাজ বদলে দিতে পারে। VAASORA শুরু হয়েছে এই বিশ্বাস থেকে — যে ঘর আর কর্মক্ষেত্র দুটোই হতে পারে শান্ত, রুচিশীল আর মনের মতো।</p>
          <p>আমরা এমন সিরামিক পণ্য বাছাই করি যার আকার পরিমিত, রং সংযত, আর যা আধুনিক অন্দরসজ্জার সাথে সহজে মিশে যায়। বগুড়া থেকে আমরা সেগুলো যত্ন করে পৌঁছে দিই আপনার দরজায়।</p>
          <Link href="/about" className="link-quiet inline-block pt-2 text-[15px]">VAASORA-এর গল্প পড়ুন</Link>
        </div>
      </section>

      {/* CORPORATE */}
      <section className="bg-ink text-ivory">
        <div className="container-x grid items-center gap-10 py-20 lg:grid-cols-[1.2fr_1fr] lg:py-28">
          <div>
            <p className="font-display text-xl italic text-[#D9C7AE]">For workplaces</p>
            <h2 className="heading-lg mt-3 text-ivory">আপনার কর্মক্ষেত্র হোক আরও নান্দনিক</h2>
            <p className="mt-5 max-w-xl text-[17px] leading-[1.9] text-ivory/70">
              অফিস রিসেপশন, এক্সিকিউটিভ কেবিন, মিটিং রুম কিংবা কর্পোরেট স্পেসের জন্য বেছে নিন মানানসই সিরামিক ডেকোর।
            </p>
          </div>
          <div className="flex flex-col gap-3 lg:items-end">
            <a href={`tel:${settings.contact_phone}`} className="btn-light w-full lg:w-auto"><Phone size={17} strokeWidth={1.5} />কর্পোরেট অর্ডারের জন্য যোগাযোগ করুন</a>
            {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn w-full bg-ivory text-ink hover:bg-[#D9C7AE] lg:w-auto"><WhatsAppIcon />WhatsApp-এ লিখুন</a>}
            <p className="font-ui text-sm tracking-wide text-ivory/55">{settings.contact_phone}</p>
          </div>
        </div>
      </section>

      {/* WHY VAASORA */}
      <section className="container-x py-20 lg:py-28">
        <h2 className="heading-lg mb-12 text-center">কেন VAASORA</h2>
        <div className="grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['নান্দনিক ডিজাইন', 'সমসাময়িক অন্দরসজ্জার সাথে মানিয়ে যায় এমন পরিমিত, রুচিশীল ডিজাইন।'],
            ['মানসম্মত পণ্য', 'পাঠানোর আগে প্রতিটি পণ্য আমরা নিজেরা দেখে যাচাই করি।'],
            ['যত্নসহকারে প্যাকেজিং', 'ভঙ্গুর সিরামিকের কথা মাথায় রেখে প্রতিটি পণ্য সুরক্ষিতভাবে প্যাক করা হয়।'],
            ['নির্ভরযোগ্য ডেলিভারি', 'বগুড়াসহ সারা দেশে ক্যাশ অন ডেলিভারিতে পণ্য পৌঁছে দেওয়া হয়।'],
          ].map(([t, d]) => (
            <div key={t} className="border-b border-r border-line px-7 py-10">
              <h3 className="font-bn-serif text-xl">{t}</h3>
              <p className="mt-3 leading-8 text-stone">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* REVIEWS — only real, approved reviews; the section is hidden when there are none */}
      {reviews.length > 0 && (
        <section className="border-t border-line py-20 lg:py-28">
          <div className="container-x">
            <h2 className="heading-lg mb-12">গ্রাহকদের কথা</h2>
            <div className="grid gap-10 md:grid-cols-3">
              {reviews.map((r) => (
                <figure key={r.id} className="border-t border-ink pt-6">
                  <p className="font-ui text-sm text-bronze" aria-label={`৫-এর মধ্যে ${r.rating}`}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</p>
                  <blockquote className="mt-4 font-bn-serif text-lg leading-9">{r.comment}</blockquote>
                  <figcaption className="mt-5 text-sm text-stone">{r.customer_name}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* NEWSLETTER */}
      <section className="border-t border-line bg-sand/60">
        <div className="container-x flex flex-col items-start gap-8 py-16 lg:flex-row lg:items-center lg:justify-between lg:py-20">
          <div className="max-w-md">
            <h2 className="heading-md">VAASORA-এর নতুন কালেকশন সম্পর্কে জানুন</h2>
            <p className="mt-2 text-stone">নতুন পণ্য এলে শুধু তখনই ইমেইল পাঠানো হবে।</p>
          </div>
          <SubscribeForm />
        </div>
      </section>
    </>
  );
}
