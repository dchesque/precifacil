// pages/insumos/[id].tsx
import { useRouter } from 'next/router';
import Layout from '../../components/layout/Layout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import DetalhesInsumo from '../../components/insumos/DetalhesInsumo';

export default function DetalheInsumo() {
  const router = useRouter();
  const { id } = router.query;
  
  return (
    <ProtectedRoute>
      <Layout title="Detalhes do Insumo">
        {id ? <DetalhesInsumo insumoId={id as string} /> : <div>Carregando...</div>}
      </Layout>
    </ProtectedRoute>
  );
}