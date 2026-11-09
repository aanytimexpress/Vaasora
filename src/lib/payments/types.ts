/**
 * Payment provider architecture.
 * Each provider is an adapter. A provider is offered at checkout only when BOTH:
 *   1. its adapter is registered in ./registry.ts (code exists and is tested), and
 *   2. payment_methods.is_available AND is_enabled are true in the database.
 */
export type PaymentInit =
  | { kind: 'none' }                       // e.g. COD: nothing to do online
  | { kind: 'redirect'; url: string };     // gateways: send the customer to the provider

export interface PaymentProvider {
  code: string;
  /** Called after the order row exists. Must never mark an order paid by itself. */
  initiate(order: { orderNumber: string; amount: number }): Promise<PaymentInit>;
  /** Gateways verify callbacks/IPN server-to-server here. Not needed for COD. */
  verify?(payload: unknown): Promise<{ ok: boolean; providerRef?: string }>;
}
