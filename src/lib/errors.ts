const MESSAGES: Record<string, string> = {
  EMPTY_CART: 'আপনার কার্ট খালি।',
  TOO_MANY_ITEMS: 'একসাথে এত পণ্য অর্ডার করা যাচ্ছে না। বাল্ক অর্ডারের জন্য সরাসরি কল করুন।',
  INVALID_QUANTITY: 'পণ্যের পরিমাণ সঠিক নয়।',
  PRODUCT_UNAVAILABLE: 'কার্টের একটি পণ্য এখন আর পাওয়া যাচ্ছে না। কার্ট থেকে সেটি সরিয়ে আবার চেষ্টা করুন।',
  OUT_OF_STOCK: 'কার্টের একটি পণ্যের পর্যাপ্ত স্টক নেই। পরিমাণ কমিয়ে আবার চেষ্টা করুন।',
  INVALID_COUPON: 'কুপন কোডটি সঠিক নয় অথবা এর মেয়াদ শেষ।',
  COUPON_MIN_ORDER: 'এই কুপন ব্যবহারের জন্য ন্যূনতম অর্ডারের পরিমাণ পূরণ হয়নি।',
  NO_DELIVERY_ZONE: 'অনলাইন অর্ডার এই মুহূর্তে বন্ধ আছে। অর্ডার করতে আমাদের নম্বরে কল করুন।',
  PAYMENT_METHOD_UNAVAILABLE: 'নির্বাচিত পেমেন্ট পদ্ধতিটি এখন চালু নেই।',
  INVALID_PHONE: 'সঠিক মোবাইল নম্বর দিন (যেমন 01XXXXXXXXX)।',
  INVALID_NAME: 'আপনার নাম লিখুন।',
  INVALID_ADDRESS: 'ডেলিভারির ঠিকানা সম্পূর্ণ করুন।',
  INVALID_REQUEST: 'অনুরোধটি সম্পন্ন করা যায়নি। পেজটি রিফ্রেশ করে আবার চেষ্টা করুন।',
  RATE_LIMITED: 'অল্প সময়ে অনেকবার চেষ্টা করা হয়েছে। কয়েক মিনিট পর আবার চেষ্টা করুন।',
  NOT_CONFIGURED: 'অনলাইন অর্ডার এই মুহূর্তে বন্ধ আছে। অর্ডার করতে আমাদের নম্বরে কল করুন।',
};

export const GENERIC_ERROR = 'অর্ডারটি সম্পন্ন করা যায়নি। আবার চেষ্টা করুন অথবা 01411420001 নম্বরে কল করুন।';

/** Map a Postgres `raise exception 'CODE'` (surfaced via PostgREST) to a Bangla message. */
export function messageFor(err: unknown): string {
  const text = typeof err === 'string' ? err : (err as { message?: string })?.message ?? '';
  const code = Object.keys(MESSAGES).find((k) => text.includes(k));
  return code ? MESSAGES[code] : GENERIC_ERROR;
}
export const errorMessage = (code: keyof typeof MESSAGES) => MESSAGES[code];
