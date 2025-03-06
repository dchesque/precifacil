// pages/produtos/novo.tsx
import Layout from '../../components/layout/Layout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import FormProduto from '../../components/produtos/FormProduto';

export default function NovoProduto() {
  return (
    <ProtectedRoute>
      <Layout title="Novo Produto">
        <FormProduto />
      </Layout>
    </ProtectedRoute>
  );
}