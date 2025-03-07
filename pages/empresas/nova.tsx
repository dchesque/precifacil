// pages/empresas/nova.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useEmpresa } from '../../contexts/EmpresaContext';

export default function NovaEmpresa() {
  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { criarEmpresa, empresas, status: empresaStatus } = useEmpresa();

  // Verificar se o usuário está autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('Usuário não autenticado, redirecionando para login');
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);
  
  // Verificar se o usuário já tem uma empresa
  useEffect(() => {
    // Evitar redirecionamentos duplicados
    if (isRedirecting) return;
    
    // Se as empresas já estiverem carregadas e houver pelo menos uma
    if (!authLoading && empresaStatus !== 'loading' && empresas.length > 0) {
      console.log('Usuário já tem empresas, redirecionando para seleção');
      setIsRedirecting(true);
      router.push('/empresas/selecionar');
    }
  }, [empresas, authLoading, empresaStatus, router, isRedirecting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!nome.trim()) {
        throw new Error('O nome da empresa é obrigatório');
      }

      console.log('Criando empresa:', { nome, cnpj });
      const { error } = await criarEmpresa(nome, cnpj || undefined);
      
      if (error) {
        throw error;
      }
      
      console.log('Empresa criada com sucesso, redirecionando para dashboard');
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Erro ao criar empresa:', err);
      setError(`Não foi possível criar a empresa: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar carregamento enquanto verificações iniciais
  if (authLoading || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-extrabold text-primary-600">
            PreçoSmart
          </h1>
          <h2 className="mt-6 text-center text-xl font-bold text-gray-900">
            Cadastre sua empresa
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Para começar, precisamos de algumas informações sobre sua empresa.
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="nome" className="sr-only">
                Nome da empresa
              </label>
              <input
                id="nome"
                name="nome"
                type="text"
                required
                className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Nome da empresa"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="cnpj" className="sr-only">
                CNPJ (opcional)
              </label>
              <input
                id="cnpj"
                name="cnpj"
                type="text"
                className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="CNPJ (opcional)"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              {empresas.length > 0 && (
                <Link href="/empresas/selecionar" className="font-medium text-primary-600 hover:text-primary-500">
                  Voltar para seleção de empresas
                </Link>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                  Cadastrando...
                </>
              ) : (
                'Cadastrar empresa'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}