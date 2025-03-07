// pages/insumos/editar/[id].tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/layout/Layout';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import FormInsumo from '../../../components/insumos/FormInsumo';
import { obterInsumo } from '../../../services/insumos';

export default function EditarInsumo() {
  const router = useRouter();
  const { id } = router.query;
  const [insumo, setInsumo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (id) {
      carregarInsumo();
    }
  }, [id]);
  
  const carregarInsumo = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await obterInsumo(id as string);
      setInsumo(data);
    } catch (err: any) {
      setError(`Erro ao carregar insumo: ${err.message || 'Erro desconhecido'}`);
      console.error('Erro completo:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <ProtectedRoute>
      <Layout title="Editar Insumo">
        {isLoading ? (
          <div className="text-center py-10">Carregando informações do insumo...</div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <button 
                  onClick={() => router.push('/insumos')} 
                  className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
                >
                  Voltar para lista de insumos
                </button>
              </div>
            </div>
          </div>
        ) : (
          <FormInsumo insumoInicial={insumo} modoEdicao={true} />
        )}
      </Layout>
    </ProtectedRoute>
  );
}