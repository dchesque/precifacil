// pages/insumos/novo.tsx
import Layout from '../../components/layout/Layout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import FormInsumo from '../../components/insumos/FormInsumo';

export default function NovoInsumo() {
  return (
    <ProtectedRoute>
      <Layout title="Novo Insumo">
        <FormInsumo />
      </Layout>
    </ProtectedRoute>
  );
}