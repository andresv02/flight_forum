'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  
  const isActive = (path) => {
    return pathname === path ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100';
  };

  return (
    <nav className="flex space-x-1">
      <Link 
        href="/" 
        className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/')}`}
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
