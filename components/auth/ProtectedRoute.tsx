// components/auth/ProtectedRoute.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { useEmpresa } from '../../contexts/EmpresaContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isLoadingAuth } = useAuth();
  const { empresaAtual, empresas, isLoading: isLoadingEmpresa } = useEmpresa();
  const router = useRouter();

  useEffect(() => {
    // Verifica o caminho atual
    const path = router.pathname;
    const isSelecionarPage = path === '/empresas/selecionar';
    const isNovaEmpresaPage = path === '/empresas/nova';

    if (!isLoadingAuth && !user) {
      // Usuário não autenticado, redireciona para login
      router.push('/auth/login');
    } else if (!isLoadingAuth && !isLoadingEmpresa && user) {
      if (!empresas || empresas.length === 0) {
        // Sem empresas, deve ir para criação
        if (!isNovaEmpresaPage) {
          router.push('/empresas/nova');
        }
      } else if (empresas.length > 1 && !empresaAtual && !isSelecionarPage && !isNovaEmpresaPage) {
        // Múltiplas empresas, mas nenhuma selecionada
        router.push('/empresas/selecionar');
      } else if (!empresaAtual && !isSelecionarPage && !isNovaEmpresaPage) {
        // Sem empresa selecionada
        router.push('/empresas/selecionar');
      }
    }
  }, [user, empresaAtual, empresas, isLoadingAuth, isLoadingEmpresa, router]);

  // Mostra loading enquanto verifica autenticação
  if (isLoadingAuth || isLoadingEmpresa || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  // Usuário autenticado
  if (router.pathname === '/empresas/selecionar' || router.pathname === '/empresas/nova') {
    // Nestas páginas não precisamos verificar se tem empresa selecionada
    return <>{children}</>;
  }

  // Para outras páginas protegidas, verificamos se tem empresa selecionada
  if (!empresaAtual) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Selecione uma empresa para continuar...</div>
      </div>
    );
  }

  // Usuário autenticado e com empresa selecionada
  return <>{children}</>;
}