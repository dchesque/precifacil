// pages/empresas/nova.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useEmpresa } from '../../contexts/EmpresaContext';

export default function NovaEmpresa() {
  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { criarEmpresa } = useEmpresa();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await criarEmpresa(nome, cnpj || undefined);
      
      if (!error) {
        router.push('/dashboard');
      } else {
        setError('Não foi possível criar a empresa. Por favor, tente novamente.');
      }
    } catch (err) {
      setError('Ocorreu um erro. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

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

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isLoading ? 'Cadastrando...' : 'Cadastrar empresa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}