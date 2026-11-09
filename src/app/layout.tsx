import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Hind_Siliguri, Inter, Noto_Serif_Bengali } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/components/store/store-provider';
import { AnnouncementBar } from '@/components/announcement-bar';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { getSettings } from '@/lib/data';

// Self-hosted by next/font: identical Bangla rendering on Windows, Android and iPhone.
const hind = Hind_Siliguri({ subsets: ['bengali', 'latin'], weight: ['300', '400', '500', '600', '700'], variable: '--font-hind', display: 'swap' });
const notoSerif = Noto_Serif_Bengali({ subsets: ['bengali'], weight: ['400', '500', '600'], variable: '--font-bn-serif', display: 'swap' });
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600'], style: ['normal', 'italic'], variable: '--font-display', display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vaasora.com';

export const revalidate = 60;

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: 'VAASORA — প্রিমিয়াম সিরামিক ফুলদানি ও হোম ডেকোর', template: '%s | VAASORA' },
  description: 'ঘর ও কর্মক্ষেত্রের জন্য VAASORA-এর নান্দনিক সিরামিক ফুলদানি, প্ল্যান্টার ও অফিস ডেকোর। ক্যাশ অন ডেলিভারিতে অর্ডার করুন।',
  openGraph: { type: 'website', locale: 'bn_BD', siteName: 'VAASORA', url: SITE },
  alternates: { canonical: '/' },
  icons: { icon: '/icon.svg' },
};

export const viewport: Viewport = { themeColor: '#F8F6F1', width: 'device-width', initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const orgLd = {
    '@context': 'https://schema.org', '@type': 'Store', name: 'VAASORA', url: SITE, telephone: `+88${settings.contact_phone}`,
    slogan: 'Elevate Your Space.',
    address: { '@type': 'PostalAddress', streetAddress: 'Ekota Nir, Ground Floor, Upashahar Main Road', addressLocality: 'Bogura', postalCode: '5800', addressCountry: 'BD' },
  };
  return (
    <html lang="bn" className={`${hind.variable} ${notoSerif.variable} ${cormorant.variable} ${inter.variable}`}>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-ivory">মূল কনটেন্টে যান</a>
        <StoreProvider>
          <AnnouncementBar text={settings.announcement_text} />
          <Header />
          <main id="main">{children}</main>
          <Footer settings={settings} />
        </StoreProvider>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
      </body>
    </html>
  );
}
