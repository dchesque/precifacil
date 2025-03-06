// components/auth/ProtectedRoute.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { useEmpresa } from '../../contexts/EmpresaContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isLoadingAuth } = useAuth();
  const { empresaAtual, isLoading: isLoadingEmpresa } = useEmpresa();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingAuth && !user) {
      // Usuário não autenticado, redireciona para login
      router.push('/auth/login');
    } else if (!isLoadingAuth && !isLoadingEmpresa && user && !empresaAtual) {
      // Usuário autenticado mas sem empresa, redireciona para criar empresa
      router.push('/empresas/nova');
    }
  }, [user, empresaAtual, isLoadingAuth, isLoadingEmpresa, router]);

  // Mostra loading enquanto verifica autenticação
  if (isLoadingAuth || isLoadingEmpresa || !user || !empresaAtual) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  // Usuário autenticado e com empresa selecionada
  return <>{children}</>;
}