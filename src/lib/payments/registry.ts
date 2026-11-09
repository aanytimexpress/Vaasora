import { codProvider } from './cod';
import type { PaymentProvider } from './types';

// Add bKash / Nagad / Rocket / Upay / SSLCommerz adapters here only once they are
// implemented against the real sandbox, tested end to end, and verified with live credentials.
const providers: Record<string, PaymentProvider> = {
  [codProvider.code]: codProvider,
};

export const getProvider = (code: string) => providers[code] ?? null;
export const implementedCodes = () => Object.keys(providers);
