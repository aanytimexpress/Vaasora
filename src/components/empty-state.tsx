import Link from 'next/link';
import { VaseMark } from './vase-mark';

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: { href: string; label: string } }) {
  return (
    <div className="flex flex-col items-center border border-line bg-card px-6 py-16 text-center sm:py-20">
      <VaseMark className="h-20 text-bronze/70" />
      <h3 className="mt-6 heading-md">{title}</h3>
      {body && <p className="mt-3 max-w-md text-stone">{body}</p>}
      {action && <Link href={action.href} className="btn-outline mt-8">{action.label}</Link>}
    </div>
  );
}
