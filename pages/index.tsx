// pages/index.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/dashboard');
  }, [router]);
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <p className="text-gray-500">Redirecionando...</p>
    </div>
  );
}