import type { Metadata } from 'next';
import { TrackForm } from './track-form';

export const metadata: Metadata = { title: 'অর্ডার ট্র্যাক করুন', alternates: { canonical: '/track-order' } };

export default function TrackOrderPage() {
  return (
    <div className="container-x max-w-2xl py-14 lg:py-20">
      <h1 className="heading-lg">অর্ডার ট্র্যাক করুন</h1>
      <p className="lead mt-3">অর্ডার নম্বর এবং যে মোবাইল নম্বর দিয়ে অর্ডার করেছেন, সেটি দিন।</p>
      <TrackForm />
    </div>
  );
}
