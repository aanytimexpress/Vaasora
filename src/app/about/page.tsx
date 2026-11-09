import type { Metadata } from 'next';
import Link from 'next/link';
import { VaseMark } from '@/components/vase-mark';

export const metadata: Metadata = { title: 'আমাদের সম্পর্কে', alternates: { canonical: '/about' } };

export default function AboutPage() {
  return (
    <div className="container-x py-14 lg:py-24">
      <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
        <div>
          <p className="font-display text-xl italic text-bronze">Elevate Your Space.</p>
          <h1 className="heading-xl mt-3">আমাদের সম্পর্কে</h1>
          <div className="mt-8 max-w-xl space-y-5 text-[17px] leading-[1.95] text-[#3d3a34]">
            <p>VAASORA বগুড়ার একটি সিরামিক ডেকোর ব্র্যান্ড। আমাদের কাজ সহজ — ঘর আর কর্মক্ষেত্রকে আরও সুন্দর, শান্ত আর রুচিশীল করে তুলতে মানানসই সিরামিক ফুলদানি ও ডেকোর পৌঁছে দেওয়া।</p>
            <p>আমরা বিশ্বাস করি, ভালো ডিজাইনের জন্য জায়গা ভরিয়ে ফেলার দরকার নেই। একটি ঠিকঠাক ফুলদানি, ঠিক জায়গায় — সেটাই একটা ঘরের চরিত্র বদলে দেয়। তাই আমাদের কালেকশনে পরিমিত আকার, সংযত রং আর যত্নের ছাপ।</p>
            <p>ব্যক্তিগত ক্রেতা থেকে শুরু করে অফিস, রিসেপশন, হোটেল ও ইন্টেরিয়র ডিজাইনার — সবার জন্যই আমরা কাজ করি।</p>
          </div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/shop" className="btn-primary">কালেকশন দেখুন</Link>
            <Link href="/contact" className="btn-outline">যোগাযোগ করুন</Link>
          </div>
        </div>
        <div className="alcove mx-auto flex aspect-[3/4] w-[70%] max-w-sm items-end justify-center bg-sand pb-[12%] text-bronze lg:w-full">
          <VaseMark className="h-[55%]" />
        </div>
      </div>
    </div>
  );
}
