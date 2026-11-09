import type { PaymentProvider } from './types';

export const codProvider: PaymentProvider = {
  code: 'cod',
  async initiate() {
    return { kind: 'none' };
  },
};
