// components/insumos/DetalhesInsumo.tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PencilIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Insumo, HistoricoPreco, obterInsumo, obterHistoricoPrecos } from '../../services/insumos';
import { formatarUnidade } from '../../utils/conversao';

type DetalhesInsumoProps = {
  insumoId: string;
};

export default function DetalhesInsumo({ insumoId }: DetalhesInsumoProps) {
  const [insumo, setInsumo] = useState<Insumo | null>(null);
  const [historicoPrecos, setHistoricoPrecos] = useState<HistoricoPreco[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (insumoId) {
      carregarInsumo();
    }
  }, [insumoId]);
  
  const carregarInsumo = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const insumoData = await obterInsumo(insumoId);
      setInsumo(insumoData);
      
      const historicoData = await obterHistoricoPrecos(insumoId);
      setHistoricoPrecos(historicoData);
    } catch (err: any) {
      setError('Erro ao carregar dados do insumo: ' + err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return <div className="text-center py-10">Carregando...</div>;
  }
  
  if (error || !insumo) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error || 'Insumo não encontrado'}</p>
        <Link 
          href="/insumos"
          className="inline-block mt-4 text-primary-600 hover:underline"
        >
          Voltar para lista de insumos
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Link 
          href="/insumos"
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Voltar para lista
        </Link>
        
        <Link 
          href={`/insumos/editar/${insumo.id}`}
          className="flex items-center text-primary-600 hover:text-primary-800"
        >
          <PencilIcon className="h-4 w-4 mr-1" />
          Editar
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">{insumo.nome}</h2>
          {insumo.categoria && (
            <p className="text-sm text-gray-500 mt-1">
              Categoria: {insumo.categoria.nome}
            </p>
          )}
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Detalhes do Insumo</h3>
            
            {insumo.descricao && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500">Descrição</h4>
                <p className="mt-1 text-gray-800">{insumo.descricao}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Unidade de Medida</h4>
                <p className="mt-1 text-gray-800">{formatarUnidade(1, insumo.unidadeMedida)}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Preço Atual</h4>
                <div className="mt-1">
                  {insumo.precoComDesconto ? (
                    <div>
                      <p className="line-through text-gray-400">
                        R$ {insumo.preco.toFixed(2)}
                      </p>
                      <p className="text-green-600 font-medium">
                        R$ {insumo.precoComDesconto.toFixed(2)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-800">R$ {insumo.preco.toFixed(2)}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Histórico de Preços</h3>
            
            {historicoPrecos.length === 0 ? (
              <p className="text-gray-500">Nenhuma alteração de preço registrada.</p>
            ) : (
              <div className="overflow-hidden border border-gray-200 rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Data
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Preço Anterior
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Novo Preço
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {historicoPrecos.map((historico) => (
                      <tr key={historico.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {new Date(historico.dataMudanca).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          R$ {historico.precoAntigo.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          R$ {historico.precoNovo.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}