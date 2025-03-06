// components/produtos/ListaProdutos.tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PencilIcon, TrashIcon, PlusCircleIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useEmpresa } from '../../contexts/EmpresaContext';
import * as produtosService from '../../services/produtos';

export default function ListaProdutos() {
  const [produtos, setProdutos] = useState<produtosService.Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { empresaAtual } = useEmpresa();
  
  useEffect(() => {
    if (empresaAtual) {
      carregarProdutos();
    }
  }, [empresaAtual]);
  
  const carregarProdutos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await produtosService.listarProdutos(empresaAtual!.id);
      setProdutos(data);
    } catch (err: any) {
      setError('Erro ao carregar produtos: ' + err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExcluir = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await produtosService.excluirProduto(id);
        setProdutos(produtos.filter(produto => produto.id !== id));
      } catch (err: any) {
        setError('Erro ao excluir produto: ' + err.message);
        console.error(err);
      }
    }
  };
  
  if (isLoading) {
    return <div className="text-center py-10">Carregando produtos...</div>;
  }
  
  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        {error}
        <button 
          onClick={carregarProdutos}
          className="block mx-auto mt-4 text-blue-500 underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Lista de Produtos</h1>
        <Link 
          href="/produtos/novo"
          className="flex items-center gap-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
        >
          <PlusCircleIcon className="h-5 w-5" />
          Novo Produto
        </Link>
      </div>
      
      {produtos.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">Nenhum produto cadastrado.</p>
          <Link 
            href="/produtos/novo"
            className="inline-block mt-4 text-primary-600 hover:underline"
          >
            Cadastre seu primeiro produto
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preço
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Custo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Margem
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {produtos.map((produto) => (
                <tr key={produto.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      href={`/produtos/${produto.id}`}
                      className="text-primary-600 hover:underline"
                    >
                      {produto.nome}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {produto.categoria?.nome || 'Sem categoria'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {produto.precoPromocional ? (
                      <div>
                        <span className="line-through text-gray-400">
                          R$ {produto.precoVenda.toFixed(2)}
                        </span>
                        <span className="ml-2 text-green-600">
                          R$ {produto.precoPromocional.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span>R$ {produto.precoVenda.toFixed(2)}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span>R$ {produto.custoTotal.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={produto.margemLucro < 30 ? 'text-red-600' : 'text-green-600'}>
                      {produto.margemLucro.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2">
                      <Link 
                        href={`/produtos/${produto.id}`}
                        className="text-blue-600 hover:text-blue-800"
                        title="Ver detalhes"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                      <Link 
                        href={`/produtos/editar/${produto.id}`}
                        className="text-blue-600 hover:text-blue-800"
                        title="Editar produto"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleExcluir(produto.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Excluir produto"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}