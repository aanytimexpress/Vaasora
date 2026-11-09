'use client';

import { useState, useTransition } from 'react';
import { trackOrder, type TrackResult } from '../actions';
import { formatDateTime, formatTaka } from '@/lib/format';
import { STATUS_BN, STATUS_FLOW } from '@/lib/order-status';

export function TrackForm() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<TrackResult | null>(null);
  const [pending, start] = useTransition();
  const order = result?.ok ? result.order : null;
  const stepIndex = order ? STATUS_FLOW.indexOf(order.status) : -1;

  return (
    <>
      <form className="mt-10 grid gap-5 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); start(async () => setResult(await trackOrder({ orderNumber, phone }))); }}>
        <div>
          <label className="label" htmlFor="t-order">অর্ডার নম্বর</label>
          <input id="t-order" className="field font-ui uppercase" placeholder="VAA-202611-0001" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} required />
        </div>
        <div>
          <label className="label" htmlFor="t-phone">মোবাইল নম্বর</label>
          <input id="t-phone" className="field" type="tel" inputMode="tel" placeholder="01XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
        <button className="btn-primary sm:col-span-2" disabled={pending}>{pending ? 'খোঁজা হচ্ছে…' : 'অবস্থা দেখুন'}</button>
      </form>

      {result && !result.ok && <p role="alert" className="mt-6 text-[#A24A3A]">{result.error}</p>}

      {order && (
        <section className="mt-12 border border-line bg-card p-6" aria-live="polite">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-ui text-lg font-medium">{order.order_number}</p>
            <p className="text-sm text-stone font-ui">{formatDateTime(order.created_at)}</p>
          </div>
          <p className="mt-4 font-bn-serif text-xl">{STATUS_BN[order.status] ?? order.status}</p>

          {stepIndex >= 0 && (
            <ol className="mt-6 space-y-3">
              {STATUS_FLOW.map((s, i) => (
                <li key={s} className={`flex items-center gap-3 text-[15px] ${i <= stepIndex ? 'text-ink' : 'text-stone/60'}`}>
                  <span className={`h-2.5 w-2.5 rounded-full ${i <= stepIndex ? 'bg-bronze' : 'border border-line'}`} />
                  {STATUS_BN[s]}
                </li>
              ))}
            </ol>
          )}

          <ul className="mt-6 space-y-1 border-t border-line pt-5 text-[15px]">
            {order.items.map((i, idx) => <li key={idx}>{i.name}{i.variant ? ` — ${i.variant}` : ''} <span className="font-ui text-stone">× {i.quantity}</span></li>)}
          </ul>
          <p className="mt-4 font-ui font-medium">{formatTaka(order.total)}</p>
        </section>
      )}
    </>
  );
}
