// pages/index.tsx
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useEmpresa } from '../contexts/EmpresaContext';

// Componente de carregamento com animação
const LoadingComponent = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p className="text-gray-600 text-lg font-medium">Carregando...</p>
    </div>
  </div>
);

const Home: React.FC = () => {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { empresas, status: empresaStatus, recarregarEmpresas } = useEmpresa();

  // Garantir que as empresas sejam carregadas quando a página iniciar
  useEffect(() => {
    if (user && empresaStatus === 'idle') {
      recarregarEmpresas();
    }
  }, [user, empresaStatus, recarregarEmpresas]);

  // Lógica de redirecionamento
  useEffect(() => {
    // Evitar redirecionamento se ainda está carregando
    if (authLoading || empresaStatus === 'loading' || empresaStatus === 'idle') {
      return;
    }

    // Redirecionamento baseado no estado atual
    const redirectToAppropriateRoute = async () => {
      try {
        // Logging para depuração
        console.log('=== Redirecionamento de Página Inicial ===');
        console.log('Estado da autenticação:', { user, authLoading });
        console.log('Estado das empresas:', { empresas, status: empresaStatus });

        if (!user) {
          // Usuário não está autenticado
          console.log('Redirecionando para login (usuário não autenticado)');
          await router.push('/auth/login');
        } else {
          if (!empresas || empresas.length === 0) {
            // Sem empresas - redireciona para criar nova
            console.log('Redirecionando para criar empresa (nenhuma empresa)');
            await router.push('/empresas/nova');
          } else if (empresas.length === 1) {
            // Uma única empresa - dashboard
            console.log('Redirecionando para dashboard (uma empresa)');
            await router.push('/dashboard');
          } else {
            // Múltiplas empresas - seleção
            console.log('Redirecionando para seleção de empresas (múltiplas empresas)');
            await router.push('/empresas/selecionar');
          }
        }
      } catch (error) {
        console.error('Erro durante redirecionamento:', error);
      }
    };

    redirectToAppropriateRoute();
  }, [user, empresas, authLoading, empresaStatus, router]);
  
  return <LoadingComponent />;
};

export default Home;