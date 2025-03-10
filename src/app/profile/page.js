'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header';
import UserProfile from '../../components/auth/UserProfile';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to home if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen p-8 max-w-4xl mx-auto pt-8">
          <div className="flex justify-center items-center h-64">
            <p className="text-lg">Loading...</p>
          </div>
        </main>
      </>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <>
      <Header />
      <main className="min-h-screen p-8 max-w-4xl mx-auto pt-8">
        <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
        <UserProfile />
        
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your Flight Activity</h2>
          <p className="text-gray-600">
            This section will show your recent flight searches and comments.
          </p>
          
          {/* This section can be expanded later to show user's flight activity */}
          <div className="bg-blue-50 p-4 rounded-lg mt-4">
            <p className="text-blue-800">
              Coming soon: Track your flight searches and discussions in one place!
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
