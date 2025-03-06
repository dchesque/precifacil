// pages/empresas/selecionar.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useEmpresa } from '../../contexts/EmpresaContext';

export default function SelecionarEmpresaPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { empresas, isLoading, setEmpresaAtual } = useEmpresa();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Se não tem usuário logado, redireciona para login
    if (!user && !isLoading) {
      router.push('/auth/login');
      return;
    }

    // Se tem apenas uma empresa ou nenhuma, redireciona apropriadamente
    if (!isLoading && empresas) {
      if (empresas.length === 0) {
        router.push('/empresas/nova');
      } else if (empresas.length === 1) {
        setEmpresaAtual(empresas[0]);
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, empresas, router, setEmpresaAtual]);

  const handleSelecionarEmpresa = (empresa) => {
    try {
      setEmpresaAtual(empresa);
      router.push('/dashboard');
    } catch (err) {
      setError('Erro ao selecionar empresa. Tente novamente.');
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Carregando...</div>
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
            Selecione uma empresa
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Escolha a empresa que deseja acessar
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden rounded-md">
          <ul className="divide-y divide-gray-200">
            {empresas && empresas.length > 0 ? (
              empresas.map((empresa) => (
                <li key={empresa.id}>
                  <button
                    onClick={() => handleSelecionarEmpresa(empresa)}
                    className="w-full px-6 py-4 flex items-center hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition duration-150 ease-in-out"
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
                      <svg
                        className="h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </button>
                </li>
              ))
            ) : (
              <li className="px-6 py-4 text-center text-gray-500">
                Nenhuma empresa encontrada
              </li>
            )}
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