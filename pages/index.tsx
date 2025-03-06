import React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/auth/login');
      }
    }
  }, [user, isLoading, router]);
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <p className="text-gray-500">Carregando...</p>
    </div>
  );
};

export default Home;