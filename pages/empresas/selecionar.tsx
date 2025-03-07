// pages/empresas/selecionar.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useEmpresa, Empresa } from '../../contexts/EmpresaContext';

// Componente de carregamento
const LoadingComponent = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p className="text-gray-600 text-lg">Carregando informações...</p>
    </div>
  </div>
);

// Componente de erro
const ErrorComponent = ({ message }: { message: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full bg-white shadow rounded-lg p-8 text-center">
      <svg className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <h2 className="text-xl font-semibold mb-2">Erro</h2>
      <p className="text-gray-600 mb-6">{message}</p>
      <button 
        onClick={() => window.location.reload()}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
      >
        Tentar novamente
      </button>
    </div>
  </div>
);

// Componente de sem empresas
const NoCompaniesComponent = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full bg-white shadow rounded-lg p-8 text-center">
      <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      <h2 className="text-xl font-semibold mb-2">Nenhuma empresa encontrada</h2>
      <p className="text-gray-600 mb-6">Você ainda não possui empresas cadastradas.</p>
      <Link
        href="/empresas/nova"
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
      >
        Criar nova empresa
      </Link>
    </div>
  </div>
);

export default function SelecionarEmpresaPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { empresas, status, error, setEmpresaAtual, recarregarEmpresas } = useEmpresa();
  const [selectedCompany, setSelectedCompany] = useState<Empresa | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Efeito para recarregar dados quando necessário
  useEffect(() => {
    if (user && status !== 'loading' && status !== 'loaded') {
      console.log('[SelecionarEmpresa] Recarregando dados de empresas');
      recarregarEmpresas();
    }
  }, [user, status, recarregarEmpresas]);

  // Efeito para verificação de autenticação
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('[SelecionarEmpresa] Usuário não autenticado, redirecionando para login');
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // Efeito para redirecionamento automático em casos específicos
  useEffect(() => {
    // Não faz nada se estiver carregando ou já redirecionando
    if (status !== 'loaded' || authLoading || isRedirecting) {
      return;
    }

    // Verificar número de empresas
    const hasEmpresas = Array.isArray(empresas) && empresas.length > 0;
    console.log(`[SelecionarEmpresa] Verificando empresas: ${hasEmpresas ? empresas.length : 0} encontradas`);

    // Caso 1: Sem empresas - redirecionar para criar nova
    if (!hasEmpresas) {
      console.log('[SelecionarEmpresa] Sem empresas, redirecionando para nova empresa');
      setIsRedirecting(true);
      router.push('/empresas/nova');
      return;
    }

    // Caso 2: Exatamente uma empresa - selecionar automaticamente
    if (empresas.length === 1) {
      console.log('[SelecionarEmpresa] Apenas uma empresa, selecionando automaticamente', empresas[0]);
      setIsRedirecting(true);
      setEmpresaAtual(empresas[0]);
      router.push('/dashboard');
      return;
    }

    // Caso 3: Múltiplas empresas - manter na página de seleção (nenhuma ação)
    console.log('[SelecionarEmpresa] Múltiplas empresas, aguardando seleção do usuário');
  }, [empresas, status, authLoading, router, setEmpresaAtual, isRedirecting]);

  // Função para selecionar empresa
  const handleSelecionarEmpresa = async (empresa: Empresa) => {
    try {
      setSelectedCompany(empresa);
      setActionError(null);
      
      console.log('[SelecionarEmpresa] Empresa selecionada manualmente:', empresa);
      setEmpresaAtual(empresa);
      
      await router.push('/dashboard');
    } catch (err: any) {
      console.error('[SelecionarEmpresa] Erro ao selecionar empresa:', err);
      setActionError(`Não foi possível selecionar a empresa: ${err.message || 'Erro desconhecido'}`);
      setSelectedCompany(null);
    }
  };

  // Renderização condicional com base no estado
  if (authLoading || status === 'loading' || status === 'idle') {
    return <LoadingComponent />;
  }

  if (status === 'error') {
    return <ErrorComponent message={error || 'Erro ao carregar empresas'} />;
  }

  if (!empresas || empresas.length === 0) {
    return <NoCompaniesComponent />;
  }

  if (isRedirecting) {
    return <LoadingComponent />;
  }

  // Renderizar página de seleção para múltiplas empresas
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-extrabold text-primary-600">
            PreçoSmart
          </h1>
          <h2 className="mt-6 text-center text-xl font-bold text-gray-900">
            Selecione uma empresa
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Escolha a empresa que deseja acessar
          </p>
        </div>

        {actionError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{actionError}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden rounded-md">
          <ul className="divide-y divide-gray-200">
            {empresas.map((empresa) => (
              <li key={empresa.id}>
                <button
                  onClick={() => handleSelecionarEmpresa(empresa)}
                  disabled={selectedCompany?.id === empresa.id}
                  className={`w-full px-6 py-4 flex items-center focus:outline-none transition duration-150 ease-in-out
                    ${selectedCompany?.id === empresa.id 
                      ? 'bg-primary-50 cursor-wait' 
                      : 'hover:bg-gray-50 focus:bg-gray-50'}`}
                >
                  <div className="min-w-0 flex-1 flex flex-col text-left">
                    <span className="text-base font-medium text-gray-900 truncate">
                      {empresa.nome}
                    </span>
                    {empresa.cnpj && (
                      <span className="text-sm text-gray-500">
                        CNPJ: {empresa.cnpj}
                      </span>
                    )}
                  </div>
                  <div className="ml-3 flex-shrink-0">
                    {selectedCompany?.id === empresa.id ? (
                      <svg className="animate-spin h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-center">
          <Link
            href="/empresas/nova"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Criar nova empresa
          </Link>
        </div>
      </div>
    </div>
  );
}