import { formatTaka } from '@/lib/format';

export function Price({ regular, sale, size = 'md' }: { regular: number; sale: number | null; size?: 'md' | 'lg' }) {
  const main = size === 'lg' ? 'text-2xl' : 'text-[15px]';
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2.5 font-ui">
      <span className={`${main} font-medium text-ink`}>{formatTaka(sale ?? regular)}</span>
      {sale !== null && sale < regular && (
        <span className="text-sm text-stone line-through" aria-label={`আগের দাম ${formatTaka(regular)}`}>{formatTaka(regular)}</span>
      )}
    </span>
  );
}
