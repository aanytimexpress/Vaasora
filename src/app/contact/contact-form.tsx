'use client';

import { useState, useTransition } from 'react';
import { sendContactMessage } from '../actions';

const EMPTY = { name: '', phone: '', email: '', subject: '', message: '', website: '' };

export function ContactForm() {
  const [f, setF] = useState(EMPTY);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, start] = useTransition();
  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  return (
    <form className="grid gap-5 border border-line bg-card p-6 sm:grid-cols-2 sm:p-8"
      onSubmit={(e) => { e.preventDefault(); start(async () => { const r = await sendContactMessage(f); setResult(r); if (r.ok) setF(EMPTY); }); }}>
      <div className="sm:col-span-2"><label className="label" htmlFor="c-name">নাম *</label><input id="c-name" className="field" required value={f.name} onChange={set('name')} autoComplete="name" /></div>
      <div><label className="label" htmlFor="c-phone">মোবাইল নম্বর</label><input id="c-phone" className="field" type="tel" inputMode="tel" value={f.phone} onChange={set('phone')} placeholder="01XXXXXXXXX" /></div>
      <div><label className="label" htmlFor="c-email">ইমেইল</label><input id="c-email" className="field" type="email" value={f.email} onChange={set('email')} /></div>
      <div className="sm:col-span-2"><label className="label" htmlFor="c-subject">বিষয়</label><input id="c-subject" className="field" value={f.subject} onChange={set('subject')} placeholder="যেমন: কর্পোরেট অর্ডার" /></div>
      <div className="sm:col-span-2"><label className="label" htmlFor="c-message">বার্তা *</label><textarea id="c-message" className="field" rows={5} required value={f.message} onChange={set('message')} /></div>
      <input tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={f.website} onChange={set('website')} />
      <div className="sm:col-span-2">
        <button className="btn-primary w-full sm:w-auto" disabled={pending}>{pending ? 'পাঠানো হচ্ছে…' : 'বার্তা পাঠান'}</button>
        {result && <p role="status" className={`mt-4 ${result.ok ? 'text-ink' : 'text-[#A24A3A]'}`}>{result.message}</p>}
      </div>
    </form>
  );
}
