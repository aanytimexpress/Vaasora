import Link from 'next/link';

export function SectionHeading({ title, intro, link }: { title: string; intro?: string; link?: { href: string; label: string } }) {
  return (
    <div className="mb-10 flex flex-col gap-4 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <h2 className="heading-lg">{title}</h2>
        {intro && <p className="lead mt-3">{intro}</p>}
      </div>
      {link && <Link href={link.href} className="link-quiet shrink-0 text-[15px]">{link.label}</Link>}
    </div>
  );
}
