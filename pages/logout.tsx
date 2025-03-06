// pages/logout.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../services/supabase';

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    const doLogout = async () => {
      await supabase.auth.signOut();
      router.push('/auth/login');
    };

    doLogout();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-xl font-semibold mb-4">Fazendo logout...</h1>
        <p>Você será redirecionado em instantes.</p>
      </div>
    </div>
  );
}