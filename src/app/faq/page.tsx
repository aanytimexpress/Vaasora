import type { Metadata } from 'next';
import { FAQ } from '@/content/policies';

export const metadata: Metadata = { title: 'সাধারণ জিজ্ঞাসা', alternates: { canonical: '/faq' } };

export default function FaqPage() {
  const ld = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) };
  return (
    <div className="container-x max-w-3xl py-14 lg:py-20">
      <h1 className="heading-lg mb-10">সাধারণ জিজ্ঞাসা</h1>
      <div className="border-t border-line">
        {FAQ.map((f) => (
          <details key={f.q} className="group border-b border-line py-5">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-6 font-bn-serif text-lg">
              {f.q}<span className="text-stone transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 leading-8 text-[#3d3a34]">{f.a}</p>
          </details>
        ))}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </div>
  );
}
