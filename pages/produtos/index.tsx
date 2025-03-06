// pages/produtos/index.tsx
import Layout from '../../components/layout/Layout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import ListaProdutos from '../../components/produtos/ListaProdutos';

export default function Produtos() {
  return (
    <ProtectedRoute>
      <Layout title="Produtos">
        <ListaProdutos />
      </Layout>
    </ProtectedRoute>
  );
}