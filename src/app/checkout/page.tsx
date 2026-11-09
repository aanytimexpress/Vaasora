import type { Metadata } from 'next';
import { getEnabledPaymentMethods, getSettings } from '@/lib/data';
import { implementedCodes } from '@/lib/payments/registry';
import { CheckoutForm } from './checkout-form';

export const metadata: Metadata = { title: 'চেকআউট', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const [methods, settings] = await Promise.all([getEnabledPaymentMethods(), getSettings()]);
  // Only offer methods that are enabled in the DB AND have a real adapter in code.
  const implemented = new Set(implementedCodes());
  const paymentMethods = methods.filter((m) => implemented.has(m.code));
  return (
    <div className="container-x py-10 lg:py-16">
      <h1 className="heading-lg mb-10">চেকআউট</h1>
      <CheckoutForm paymentMethods={paymentMethods} phone={settings.contact_phone} />
    </div>
  );
}
