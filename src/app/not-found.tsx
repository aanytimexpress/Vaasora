import Link from 'next/link';
import { VaseMark } from '@/components/vase-mark';

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <VaseMark className="h-24 text-bronze/70" />
      <h1 className="heading-lg mt-8">পেজটি পাওয়া যায়নি</h1>
      <p className="lead mt-3">লিংকটি পুরনো হতে পারে বা পেজটি সরানো হয়েছে।</p>
      <Link href="/shop" className="btn-primary mt-8">সকল পণ্য দেখুন</Link>
    </div>
  );
}
