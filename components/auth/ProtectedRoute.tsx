// components/auth/ProtectedRoute.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { useEmpresa } from '../../contexts/EmpresaContext';

// Componente de carregamento
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p className="text-gray-600 text-lg">Carregando...</p>
    </div>
  </div>
);

// Componente de seleção de empresa necessária
const EmpresaRequiredScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full bg-white shadow rounded-lg p-8 text-center">
      <svg className="h-12 w-12 text-yellow-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h2 className="text-xl font-semibold mb-2">Selecione uma empresa</h2>
      <p className="text-gray-600 mb-6">Você precisa selecionar uma empresa para acessar esta página.</p>
      <a
        href="/empresas/selecionar"
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
      >
        Selecionar Empresa
      </a>
    </div>
  </div>
);

type ProtectedRouteProps = {
  children: React.ReactNode;
  requireEmpresa?: boolean;
};

const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/registro',
  '/auth/recuperar-senha',
  '/auth/nova-senha',
];

const EMPRESA_ROUTES = [
  '/empresas/selecionar',
  '/empresas/nova',
];

export default function ProtectedRoute({ 
  children, 
  requireEmpresa = true 
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { empresas, empresaAtual, status: empresaStatus } = useEmpresa();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    // Evitar processamento desnecessário se já decidiu redirecionar
    if (shouldRedirect) return;

    // Não faz redirecionamentos se ainda estiver carregando os dados
    if (authLoading || empresaStatus === 'loading' || empresaStatus === 'idle') {
      return;
    }

    // Obtém o caminho atual
    const currentPath = router.pathname;
    
    // Logging para depuração
    console.log('=== Verificação de ProtectedRoute ===');
    console.log('Caminho atual:', currentPath);
    console.log('Estado de autenticação:', { user, authLoading });
    console.log('Estado de empresas:', { empresas, empresaAtual, status: empresaStatus });
    
    // Verifica se o usuário precisa estar autenticado para a rota atual
    const isPublicRoute = PUBLIC_ROUTES.includes(currentPath);
    
    // Verifica se é uma rota de empresa (não requer empresa já selecionada)
    const isEmpresaRoute = EMPRESA_ROUTES.includes(currentPath);
    
    // Se não está logado e não é rota pública, redireciona para login
    if (!user && !isPublicRoute) {
      console.log('Redirecionando para login (usuário não autenticado)');
      setRedirectPath('/auth/login');
      setShouldRedirect(true);
      return;
    }
    
    // Se está logado mas não tem empresas, redireciona para criação
    if (user && empresaStatus === 'loaded' && (!empresas || empresas.length === 0) && !isEmpresaRoute) {
      console.log('Redirecionando para criar empresa (sem empresas)');
      setRedirectPath('/empresas/nova');
      setShouldRedirect(true);
      return;
    }
    
    // Se está logado, tem empresas, mas não tem empresa selecionada
    if (user && 
        empresaStatus === 'loaded' && 
        empresas && 
        empresas.length > 0 && 
        !empresaAtual && 
        !isEmpresaRoute && 
        requireEmpresa) {
      console.log('Redirecionando para selecionar empresa (múltiplas empresas, nenhuma selecionada)');
      setRedirectPath('/empresas/selecionar');
      setShouldRedirect(true);
      return;
    }
  }, [
    user, 
    empresas, 
    empresaAtual, 
    authLoading, 
    empresaStatus, 
    router, 
    requireEmpresa, 
    shouldRedirect
  ]);

  // Efetua o redirecionamento se necessário
  useEffect(() => {
    if (shouldRedirect && redirectPath) {
      router.push(redirectPath);
    }
  }, [shouldRedirect, redirectPath, router]);

  // Mostra loading enquanto está carregando dados
  if (authLoading || empresaStatus === 'loading' || empresaStatus === 'idle') {
    return <LoadingScreen />;
  }

  // Verifica se está em uma rota que requer uma empresa selecionada
  const currentPath = router.pathname;
  const isEmpresaRoute = EMPRESA_ROUTES.includes(currentPath);
  
  // Se a rota requer empresa, mas não há empresa selecionada e não é uma rota de empresa
  if (requireEmpresa && !empresaAtual && !isEmpresaRoute && user) {
    return <EmpresaRequiredScreen />;
  }

  // Renderiza os filhos normalmente se todas as condições forem atendidas
  return <>{children}</>;
}