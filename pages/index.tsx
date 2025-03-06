// pages/index.tsx
import React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useEmpresa } from '../contexts/EmpresaContext';

const Home: React.FC = () => {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { empresas, isLoading: empresaLoading } = useEmpresa();

  useEffect(() => {
    // Espera carregar dados de autenticação e empresas
    if (!authLoading && !empresaLoading) {
      if (!user) {
        // Usuário não está autenticado
        router.push('/auth/login');
      } else if (!empresas || empresas.length === 0) {
        // Usuário não tem empresas
        router.push('/empresas/nova');
      } else if (empresas.length === 1) {
        // Usuário tem apenas uma empresa
        router.push('/dashboard');
      } else {
        // Usuário tem múltiplas empresas
        router.push('/empresas/selecionar');
      }
    }
  }, [user, empresas, authLoading, empresaLoading, router]);
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <p className="text-gray-500">Carregando...</p>
    </div>
  );
};

export default Home;