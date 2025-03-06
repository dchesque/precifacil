// pages/dashboard.tsx
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { useEmpresa } from '../contexts/EmpresaContext';

export default function Dashboard() {
  const { empresaAtual } = useEmpresa();
  
  return (
    <ProtectedRoute>
      <Layout title="Dashboard">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Bem-vindo ao Dashboard
          </h2>
          <p className="text-gray-600 mb-6">
            Este é o painel principal do seu aplicativo de precificação.
            {empresaAtual && (
              <span className="font-medium"> Empresa atual: {empresaAtual.nome}</span>
            )}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-primary-50 p-4 rounded-lg border border-primary-200">
              <h3 className="text-lg font-medium text-primary-800">Insumos</h3>
              <p className="mt-2 text-sm text-primary-600">Gerencie os insumos e matérias-primas</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-medium text-blue-800">Produtos</h3>
              <p className="mt-2 text-sm text-blue-600">Cadastre e gerencie seus produtos</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="text-lg font-medium text-green-800">Precificação</h3>
              <p className="mt-2 text-sm text-green-600">Calcule preços e margens de lucro</p>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}