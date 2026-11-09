'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Heart, Menu, Search, ShoppingBag, X } from 'lucide-react';
import { useStore } from './store/store-provider';

const NAV = [
  { href: '/', label: 'হোম' },
  { href: '/shop', label: 'সকল পণ্য' },
  { href: '/categories', label: 'ক্যাটাগরি' },
  { href: '/about', label: 'আমাদের সম্পর্কে' },
  { href: '/contact', label: 'যোগাযোগ' },
];

export function Header() {
  const { cartCount, wishlist, ready } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMenuOpen(false); setSearchOpen(false); }, [pathname]);
  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));
  const iconBtn = 'relative flex h-11 w-11 items-center justify-center text-ink transition-colors hover:text-bronze';

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ivory/95 backdrop-blur-sm">
      <div className="container-x flex h-16 items-center justify-between lg:h-20">
        <button className={`${iconBtn} -ml-3 lg:hidden`} onClick={() => setMenuOpen(true)} aria-label="মেনু খুলুন">
          <Menu size={22} strokeWidth={1.4} />
        </button>

        <Link href="/" className="brand-mark text-[22px] lg:text-[26px]" aria-label="VAASORA হোম">VAASORA</Link>

        <nav className="hidden items-center gap-9 lg:flex" aria-label="প্রধান মেনু">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}
              className={`text-[15px] transition-colors hover:text-bronze ${isActive(n.href) ? 'text-bronze' : 'text-ink'}`}>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="-mr-3 flex items-center">
          <button className={iconBtn} onClick={() => setSearchOpen((s) => !s)} aria-label="পণ্য খুঁজুন" aria-expanded={searchOpen}>
            <Search size={20} strokeWidth={1.4} />
          </button>
          <Link href="/wishlist" className={`${iconBtn} hidden sm:flex`} aria-label="পছন্দের তালিকা">
            <Heart size={20} strokeWidth={1.4} />
            {ready && wishlist.length > 0 && <Badge n={wishlist.length} />}
          </Link>
          <Link href="/cart" className={iconBtn} aria-label={`কার্ট, ${cartCount}টি পণ্য`}>
            <ShoppingBag size={20} strokeWidth={1.4} />
            {ready && cartCount > 0 && <Badge n={cartCount} />}
          </Link>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-line bg-ivory">
          <form className="container-x flex items-center gap-3 py-4" role="search"
            onSubmit={(e) => { e.preventDefault(); if (q.trim()) router.push(`/shop?q=${encodeURIComponent(q.trim())}`); }}>
            <Search size={18} strokeWidth={1.4} className="shrink-0 text-stone" />
            <input ref={searchRef} value={q} onChange={(e) => setQ(e.target.value)} type="search"
              placeholder="ফুলদানি, প্ল্যান্টার, অফিস ডেকোর…" aria-label="পণ্য খুঁজুন"
              className="w-full bg-transparent py-2 text-lg placeholder:text-stone/60 focus:outline-none" />
            <button type="submit" className="shrink-0 text-sm text-bronze">খুঁজুন</button>
          </form>
        </div>
      )}

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-ivory lg:hidden" role="dialog" aria-modal="true" aria-label="মেনু">
          <div className="container-x flex h-16 items-center justify-between border-b border-line">
            <span className="brand-mark text-[22px]">VAASORA</span>
            <button className={`${iconBtn} -mr-3`} onClick={() => setMenuOpen(false)} aria-label="মেনু বন্ধ করুন">
              <X size={22} strokeWidth={1.4} />
            </button>
          </div>
          <nav className="container-x flex flex-1 flex-col pt-6">
            {[...NAV, { href: '/wishlist', label: 'পছন্দের তালিকা' }, { href: '/track-order', label: 'অর্ডার ট্র্যাক করুন' }].map((n) => (
              <Link key={n.href} href={n.href}
                className={`border-b border-line py-4 font-bn-serif text-xl ${isActive(n.href) ? 'text-bronze' : ''}`}>
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

function Badge({ n }: { n: number }) {
  return (
    <span className="absolute right-1 top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-bronze px-1 font-ui text-[10px] font-semibold text-white">
      {n > 99 ? '99+' : n}
    </span>
  );
}
