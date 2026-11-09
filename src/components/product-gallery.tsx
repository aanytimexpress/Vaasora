'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { ProductImage } from './product-image';

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [full, setFull] = useState(false);
  const count = images.length;
  const go = useCallback((d: number) => setIndex((i) => (i + d + count) % count), [count]);

  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFull(false);
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [full, go]);

  if (count === 0) {
    return <div className="relative aspect-[4/5] bg-sand"><ProductImage src={null} alt={alt} sizes="50vw" /></div>;
  }

  return (
    <div className="flex flex-col-reverse gap-3 lg:flex-row">
      {count > 1 && (
        <div className="flex gap-3 overflow-x-auto lg:w-20 lg:flex-col" role="tablist" aria-label="পণ্যের ছবি">
          {images.map((src, i) => (
            <button key={src} role="tab" aria-selected={i === index} aria-label={`ছবি ${i + 1}`} onClick={() => setIndex(i)}
              className={`relative aspect-square w-16 shrink-0 overflow-hidden bg-sand lg:w-20 ${i === index ? 'outline outline-1 outline-offset-2 outline-ink' : 'opacity-70 hover:opacity-100'}`}>
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="relative aspect-[4/5] flex-1 cursor-zoom-in overflow-hidden bg-sand"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
        onMouseLeave={() => setZoom(null)}
        onClick={() => setFull(true)}>
        <Image src={images[index]} alt={alt} fill priority sizes="(min-width:1024px) 50vw, 100vw"
          className="object-cover transition-transform duration-200"
          style={zoom ? { transform: 'scale(1.8)', transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined} />
        <span className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center bg-ivory/90" aria-hidden>
          <Expand size={16} strokeWidth={1.5} />
        </span>
      </div>

      {full && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95" role="dialog" aria-modal="true" aria-label={alt}>
          <button onClick={() => setFull(false)} aria-label="বন্ধ করুন" className="absolute right-3 top-3 z-10 flex h-12 w-12 items-center justify-center text-ivory">
            <X size={24} strokeWidth={1.4} />
          </button>
          <div className="relative h-[85vh] w-[92vw]">
            <Image src={images[index]} alt={alt} fill sizes="92vw" className="object-contain" />
          </div>
          {count > 1 && (
            <>
              <button onClick={() => go(-1)} aria-label="আগের ছবি" className="absolute left-2 flex h-12 w-12 items-center justify-center text-ivory"><ChevronLeft size={28} strokeWidth={1.2} /></button>
              <button onClick={() => go(1)} aria-label="পরের ছবি" className="absolute right-2 flex h-12 w-12 items-center justify-center text-ivory"><ChevronRight size={28} strokeWidth={1.2} /></button>
              <p className="absolute bottom-5 font-ui text-sm text-ivory/70">{index + 1} / {count}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
