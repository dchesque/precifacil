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
  const [error, setError] = useState(null);
  
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
    } catch (err) {
      setError('Erro ao carregar insumo');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <ProtectedRoute>
      <Layout title="Editar Insumo">
        {isLoading ? (
          <div className="text-center py-10">Carregando...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : (
          <FormInsumo insumoInicial={insumo} modoEdicao={true} />
        )}
      </Layout>
    </ProtectedRoute>
  );
}