import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { POLICIES } from '@/content/policies';

type Params = Promise<{ slug: string }>;
export const generateStaticParams = () => POLICIES.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const p = POLICIES.find((x) => x.slug === slug);
  return p ? { title: p.title, alternates: { canonical: `/policy/${p.slug}` } } : {};
}

export default async function PolicyPage({ params }: { params: Params }) {
  const { slug } = await params;
  const policy = POLICIES.find((x) => x.slug === slug);
  if (!policy) notFound();
  return (
    <article className="container-x max-w-3xl py-14 lg:py-20">
      <h1 className="heading-lg mb-8">{policy.title}</h1>
      <div className="prose-bn">
        {policy.sections.map((s, i) => (
          <section key={i}>{s.heading && <h2>{s.heading}</h2>}{s.body.map((b) => <p key={b}>{b}</p>)}</section>
        ))}
      </div>
    </article>
  );
}
