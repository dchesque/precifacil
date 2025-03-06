// components/insumos/ListaInsumos.tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PencilIcon, TrashIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { Insumo, listarInsumos, excluirInsumo } from '../../services/insumos';
import { useEmpresa } from '../../contexts/EmpresaContext';
import { formatarUnidade } from '../../utils/conversao';

export default function ListaInsumos() {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { empresaAtual } = useEmpresa();
  
  useEffect(() => {
    if (empresaAtual) {
      carregarInsumos();
    }
  }, [empresaAtual]);
  
  const carregarInsumos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await listarInsumos(empresaAtual!.id);
      setInsumos(data);
    } catch (err: any) {
      setError('Erro ao carregar insumos: ' + err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExcluir = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este insumo?')) {
      try {
        await excluirInsumo(id);
        setInsumos(insumos.filter(insumo => insumo.id !== id));
      } catch (err: any) {
        setError('Erro ao excluir insumo: ' + err.message);
        console.error(err);
      }
    }
  };
  
  if (isLoading) {
    return <div className="text-center py-10">Carregando insumos...</div>;
  }
  
  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        {error}
        <button 
          onClick={carregarInsumos}
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
        <h1 className="text-xl font-semibold text-gray-800">Lista de Insumos</h1>
        <Link 
          href="/insumos/novo"
          className="flex items-center gap-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
        >
          <PlusCircleIcon className="h-5 w-5" />
          Novo Insumo
        </Link>
      </div>
      
      {insumos.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">Nenhum insumo cadastrado.</p>
          <Link 
            href="/insumos/novo"
            className="inline-block mt-4 text-primary-600 hover:underline"
          >
            Cadastre seu primeiro insumo
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
                  Unidade
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preço
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {insumos.map((insumo) => (
                <tr key={insumo.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      href={`/insumos/${insumo.id}`}
                      className="text-primary-600 hover:underline"
                    >
                      {insumo.nome}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {insumo.categoria?.nome || 'Sem categoria'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatarUnidade(1, insumo.unidadeMedida)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {insumo.precoComDesconto ? (
                      <div>
                        <span className="line-through text-gray-400">
                          R$ {insumo.preco.toFixed(2)}
                        </span>
                        <span className="ml-2 text-green-600">
                          R$ {insumo.precoComDesconto.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span>R$ {insumo.preco.toFixed(2)}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2">
                      <Link 
                        href={`/insumos/editar/${insumo.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleExcluir(insumo.id)}
                        className="text-red-600 hover:text-red-800"
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