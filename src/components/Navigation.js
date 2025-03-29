'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  
  const isActive = (path) => {
    return pathname === path
      ? 'border-2 border-accent font-semibold text-accent rounded-md'
      : 'border-2 border-transparent text-foreground/80 hover:bg-accent/10 hover:text-accent transition-colors';
  };

  return (
    <nav className="flex space-x-1">
      <Link 
        href="/" 
        className={`px-3 py-2 text-sm font-medium ${isActive('/')}`}
      >
        Home
      </Link>
      <Link 
        href="/search" 
        className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/search')}`}
      >
        Advanced Search
      </Link>
    </nav>
  );
}
