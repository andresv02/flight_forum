'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './auth/AuthModal';
import UserProfile from './auth/UserProfile';
import Navigation from './Navigation';

export default function Header() {
  const { user, loading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="bg-card shadow border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-2xl font-bold text-accent flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path>
              </svg>
              Flight Forum
            </Link>
            <Navigation />
          </div>
          
          <div className="flex items-center">
            {!loading && (
              <>
                {user ? (
                  <div className="relative">
                    <div className="flex items-center space-x-2">
                      <Link 
                        href="/profile"
                        className="text-foreground/80 hover:text-accent transition"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center space-x-2 bg-accent/5 hover:bg-accent/10 px-4 py-2 rounded-lg transition"
                      >
                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground">
                          {user.email.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-foreground/80">
                          {user.email.split('@')[0]}
                        </span>
                      </button>
                    </div>
                    
                    {isProfileOpen && (
                      <div className="absolute right-0 mt-2 w-80 z-10">
                        <UserProfile />
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition"
                  >
                    Sign In
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </header>
  );
}
