// pages/insumos/index.tsx
import Layout from '../../components/layout/Layout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import ListaInsumos from '../../components/insumos/ListaInsumos';

export default function Insumos() {
  return (
    <ProtectedRoute>
      <Layout title="Insumos">
        <ListaInsumos />
      </Layout>
    </ProtectedRoute>
  );
}