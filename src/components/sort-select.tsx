'use client';

import { useRouter } from 'next/navigation';

export function SortSelect({ value, basePath, q }: { value: string; basePath: string; q?: string }) {
  const router = useRouter();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-stone">সাজান:</span>
      <select value={value} className="border border-line bg-card px-3 py-2 text-[15px] focus:border-bronze focus:outline-none"
        onChange={(e) => {
          const p = new URLSearchParams();
          if (q) p.set('q', q);
          if (e.target.value) p.set('sort', e.target.value);
          const s = p.toString();
          router.push(`${basePath}${s ? `?${s}` : ''}`);
        }}>
        <option value="">নতুন আগে</option>
        <option value="price_asc">দাম: কম থেকে বেশি</option>
        <option value="price_desc">দাম: বেশি থেকে কম</option>
      </select>
    </label>
  );
}
