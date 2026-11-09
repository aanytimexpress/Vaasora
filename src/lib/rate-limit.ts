import 'server-only';
import { createHash } from 'node:crypto';
import { headers } from 'next/headers';
import { serviceClient } from './supabase/admin';

/** Returns true if the request may proceed. Only a salted hash of the IP is stored. */
export async function rateLimit(bucket: string, max: number, windowSeconds: number): Promise<boolean> {
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown';
  const key = `${bucket}:${createHash('sha256').update(ip + (process.env.RATE_LIMIT_SALT ?? '')).digest('hex').slice(0, 32)}`;
  const db = serviceClient();
  if (!db) return true;
  const { data, error } = await db.rpc('check_rate_limit', { p_key: key, p_max: max, p_window: windowSeconds });
  if (error) {
    console.error('[rate-limit]', error); // fail open so an outage in the limiter never blocks orders
    return true;
  }
  return data === true;
}
