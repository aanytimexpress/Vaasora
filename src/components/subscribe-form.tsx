'use client';

import { useState, useTransition } from 'react';
import { subscribeNewsletter } from '@/app/actions';

export function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, start] = useTransition();

  return (
    <form className="w-full max-w-lg" onSubmit={(e) => {
      e.preventDefault();
      start(async () => {
        const r = await subscribeNewsletter({ email, website });
        setResult(r);
        if (r.ok) setEmail('');
      });
    }}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="nl-email">ইমেইল</label>
        <input id="nl-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="আপনার ইমেইল ঠিকানা" className="field flex-1" autoComplete="email" />
        <input tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={website} onChange={(e) => setWebsite(e.target.value)} />
        <button className="btn-primary" disabled={pending}>{pending ? 'পাঠানো হচ্ছে…' : 'সাবস্ক্রাইব করুন'}</button>
      </div>
      {result && <p role="status" className={`mt-3 text-sm ${result.ok ? 'text-ink' : 'text-[#A24A3A]'}`}>{result.message}</p>}
    </form>
  );
}
