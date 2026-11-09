/** Original line-art vase used where no photograph has been uploaded yet. */
export function VaseMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 200" fill="none" aria-hidden className={className}>
      <path
        d="M47 18h26M50 18c0 14-4 22-12 32-11 14-18 30-18 54 0 40 18 70 40 78 22-8 40-38 40-78 0-24-7-40-18-54-8-10-12-18-12-32"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"
      />
      <path d="M28 120c20 6 44 6 64 0" stroke="currentColor" strokeWidth="0.8" opacity=".5" />
    </svg>
  );
}
