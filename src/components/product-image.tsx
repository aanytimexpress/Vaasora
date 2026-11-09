import Image from 'next/image';
import { VaseMark } from './vase-mark';

export function ProductImage({ src, alt, sizes, priority = false, className = '' }: {
  src: string | null; alt: string; sizes: string; priority?: boolean; className?: string;
}) {
  if (!src) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-sand text-bronze/60 ${className}`} role="img" aria-label={alt}>
        <VaseMark className="h-1/2 max-h-48" />
      </div>
    );
  }
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={`object-cover ${className}`} />;
}
