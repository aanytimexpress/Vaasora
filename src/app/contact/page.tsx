import type { Metadata } from 'next';
import { getSettings } from '@/lib/data';
import { ContactForm } from './contact-form';

export const metadata: Metadata = { title: 'যোগাযোগ', alternates: { canonical: '/contact' } };

export default async function ContactPage() {
  const s = await getSettings();
  return (
    <div className="container-x py-14 lg:py-20">
      <h1 className="heading-lg">যোগাযোগ</h1>
      <div className="mt-12 grid gap-14 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-8 text-[16px]">
          <div><p className="text-sm text-stone">ফোন</p><a href={`tel:${s.contact_phone}`} className="mt-1 block font-ui text-2xl tracking-wide hover:text-bronze">{s.contact_phone}</a></div>
          {s.whatsapp_number && <div><p className="text-sm text-stone">WhatsApp</p><a href={`https://wa.me/${s.whatsapp_number}`} target="_blank" rel="noopener noreferrer" className="mt-1 block font-ui hover:text-bronze">+{s.whatsapp_number}</a></div>}
          {s.contact_email && <div><p className="text-sm text-stone">ইমেইল</p><a href={`mailto:${s.contact_email}`} className="mt-1 block hover:text-bronze">{s.contact_email}</a></div>}
          <div><p className="text-sm text-stone">ঠিকানা</p><address className="mt-1 not-italic leading-8">VAASORA<br />{s.address}</address></div>
          <p className="border-t border-line pt-8 leading-8 text-stone">কর্পোরেট বা বাল্ক অর্ডারের জন্য সরাসরি কল করলে দ্রুত উত্তর পাবেন।</p>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
