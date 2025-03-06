// pages/produtos/[id].tsx
import { useRouter } from 'next/router';
import Layout from '../../components/layout/Layout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import DetalhesProduto from '../../components/produtos/DetalhesProduto';

export default function DetalheProduto() {
  const router = useRouter();
  const { id } = router.query;
  
  return (
    <ProtectedRoute>
      <Layout title="Detalhes do Produto">
        {id ? <DetalhesProduto produtoId={id as string} /> : <div>Carregando...</div>}
      </Layout>
    </ProtectedRoute>
  );
}