"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  role: 'admin' | 'artist';
  [key: string]: any;
}

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        // Redirect based on user role
        switch ((user as User).role) {
          case 'admin':
            router.push('/admin/music');
            break;
          case 'artist':
            router.push('/artist/music');
            break;
          default:
            router.push('/');
        }
      }
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }

  return null;
} 