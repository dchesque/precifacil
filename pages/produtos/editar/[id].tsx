// pages/produtos/editar/[id].tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/layout/Layout';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import FormProduto from '../../../components/produtos/FormProduto';
import { obterProduto } from '../../../services/produtos';

export default function EditarProduto() {
  const router = useRouter();
  const { id } = router.query;
  const [produto, setProduto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (id) {
      carregarProduto();
    }
  }, [id]);
  
  const carregarProduto = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await obterProduto(id as string);
      setProduto(data);
    } catch (err) {
      setError('Erro ao carregar produto');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <ProtectedRoute>
      <Layout title="Editar Produto">
        {isLoading ? (
          <div className="text-center py-10">Carregando...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : (
          <FormProduto produtoInicial={produto} modoEdicao={true} />
        )}
      </Layout>
    </ProtectedRoute>
  );
}