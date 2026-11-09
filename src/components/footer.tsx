import Link from 'next/link';
import type { SiteSettings } from '@/lib/types';

export function Footer({ settings }: { settings: SiteSettings }) {
  const social = Object.entries(settings.social_links ?? {}).filter(([, url]) => !!url);
  const labels: Record<string, string> = { facebook: 'Facebook', instagram: 'Instagram', youtube: 'YouTube' };
  const col = 'mb-4 font-bn-serif text-base text-ivory';
  const link = 'block py-1.5 text-[15px] text-ivory/65 transition-colors hover:text-ivory';

  return (
    <footer className="mt-24 bg-ink text-ivory">
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr] lg:py-20">
        <div>
          <p className="brand-mark text-[28px]">VAASORA</p>
          <p className="mt-1 font-display text-lg italic text-[#D9C7AE]">Elevate Your Space.</p>
          <p className="mt-5 max-w-xs text-[15px] leading-8 text-ivory/65">
            ঘর ও কর্মক্ষেত্রের জন্য বাছাই করা নান্দনিক সিরামিক ফুলদানি ও ডেকোর।
          </p>
        </div>
        <div>
          <p className={col}>দ্রুত লিংক</p>
          <Link className={link} href="/shop">সকল পণ্য</Link>
          <Link className={link} href="/categories">ক্যাটাগরি</Link>
          <Link className={link} href="/about">আমাদের সম্পর্কে</Link>
          <Link className={link} href="/contact">যোগাযোগ</Link>
        </div>
        <div>
          <p className={col}>গ্রাহক সহায়তা</p>
          <Link className={link} href="/track-order">অর্ডার ট্র্যাক করুন</Link>
          <Link className={link} href="/faq">সাধারণ জিজ্ঞাসা</Link>
          <Link className={link} href="/policy/delivery">ডেলিভারি নীতি</Link>
          <Link className={link} href="/policy/returns">রিটার্ন ও রিফান্ড নীতি</Link>
          <Link className={link} href="/policy/privacy">গোপনীয়তা নীতি</Link>
          <Link className={link} href="/policy/terms">শর্তাবলি</Link>
        </div>
        <div>
          <p className={col}>যোগাযোগ</p>
          <address className="not-italic text-[15px] leading-8 text-ivory/65">
            VAASORA<br />{settings.address}
          </address>
          <a href={`tel:${settings.contact_phone}`} className="mt-3 block font-ui text-lg tracking-wide text-ivory hover:text-[#D9C7AE]">
            {settings.contact_phone}
          </a>
          {settings.contact_email && (
            <a href={`mailto:${settings.contact_email}`} className="block text-[15px] text-ivory/65 hover:text-ivory">{settings.contact_email}</a>
          )}
          {social.length > 0 && (
            <div className="mt-5 flex gap-5">
              {social.map(([k, url]) => (
                <a key={k} href={url} target="_blank" rel="noopener noreferrer" className="font-ui text-sm text-ivory/65 hover:text-ivory">
                  {labels[k] ?? k}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-ivory/10">
        <p className="container-x py-6 font-ui text-[13px] text-ivory/45">© {new Date().getFullYear()} VAASORA. All rights reserved.</p>
      </div>
    </footer>
  );
}
