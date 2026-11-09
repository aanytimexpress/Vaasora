export const STATUS_BN: Record<string, string> = {
  pending: 'অর্ডার গ্রহণ করা হয়েছে',
  confirmed: 'অর্ডার নিশ্চিত হয়েছে',
  processing: 'প্রস্তুত করা হচ্ছে',
  shipped: 'কুরিয়ারে পাঠানো হয়েছে',
  out_for_delivery: 'ডেলিভারির পথে',
  delivered: 'ডেলিভারি সম্পন্ন',
  cancelled: 'বাতিল করা হয়েছে',
  returned: 'ফেরত এসেছে',
};
export const STATUS_FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
