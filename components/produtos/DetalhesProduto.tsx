// components/produtos/DetalhesProduto.tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  PencilIcon, 
  ArrowLeftIcon, 
  ClipboardDocumentListIcon 
} from '@heroicons/react/24/outline';
import { 
  Produto, 
  InsumoProduto, 
  HistoricoPreco, 
  obterProduto, 
  listarInsumosProduto,
  obterHistoricoPrecosProduto 
} from '../../services/produtos';
import { formatarUnidade } from '../../utils/conversao';

type DetalhesProdutoProps = {
  produtoId: string;
};

export default function DetalhesProduto({ produtoId }: DetalhesProdutoProps) {
  const [produto, setProduto] = useState<Produto | null>(null);
  const [insumos, setInsumos] = useState<InsumoProduto[]>([]);
  const [historicoPrecos, setHistoricoPrecos] = useState<HistoricoPreco[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (produtoId) {
      carregarDados();
    }
  }, [produtoId]);
  
  const carregarDados = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Carregar dados do produto
      const produtoData = await obterProduto(produtoId);
      setProduto(produtoData);
      
      // Carregar insumos do produto
      const insumosData = await listarInsumosProduto(produtoId);
      setInsumos(insumosData);
      
      // Carregar histórico de preços
      const historicoData = await obterHistoricoPrecosProduto(produtoId);
      setHistoricoPrecos(historicoData);
    } catch (err: any) {
      setError('Erro ao carregar dados do produto: ' + err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return <div className="text-center py-10">Carregando...</div>;
  }
  
  if (error || !produto) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error || 'Produto não encontrado'}</p>
        <Link 
          href="/produtos"
          className="inline-block mt-4 text-primary-600 hover:underline"
        >
          Voltar para lista de produtos
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Link 
          href="/produtos"
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Voltar para lista
        </Link>
        
        <div className="flex space-x-2">
          <Link 
            href={`/precificacao/${produto.id}`}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ClipboardDocumentListIcon className="h-4 w-4 mr-1" />
            Precificação
          </Link>
          
          <Link 
            href={`/produtos/editar/${produto.id}`}
            className="flex items-center text-primary-600 hover:text-primary-800"
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            Editar
          </Link>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">{produto.nome}</h2>
          {produto.categoria && (
            <p className="text-sm text-gray-500 mt-1">
              Categoria: {produto.categoria.nome}
            </p>
          )}
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Detalhes do Produto</h3>
            
            {produto.descricao && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500">Descrição</h4>
                <p className="mt-1 text-gray-800">{produto.descricao}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Preço de Venda</h4>
                <div className="mt-1">
                  {produto.precoPromocional ? (
                    <div>
                      <p className="line-through text-gray-400">
                        R$ {produto.precoVenda.toFixed(2)}
                      </p>
                      <p className="text-green-600 font-medium">
                        R$ {produto.precoPromocional.toFixed(2)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-800 font-medium">R$ {produto.precoVenda.toFixed(2)}</p>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Custo Total</h4>
                <p className="mt-1 text-gray-800">R$ {produto.custoTotal.toFixed(2)}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Margem de Lucro</h4>
                <p className={`mt-1 ${produto.margemLucro < 30 ? 'text-red-600' : 'text-green-600'} font-medium`}>
                  {produto.margemLucro.toFixed(2)}%
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                <p className={`mt-1 ${produto.ativo ? 'text-green-600' : 'text-red-600'} font-medium`}>
                  {produto.ativo ? 'Ativo' : 'Inativo'}
                </p>
              </div>
            </div>
            
            <h4 className="text-sm font-medium text-gray-500 mb-2">Insumos</h4>
            {insumos.length === 0 ? (
              <p className="text-gray-500 text-sm italic">Nenhum insumo cadastrado para este produto.</p>
            ) : (
              <div className="overflow-hidden border border-gray-200 rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Insumo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Quantidade
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Custo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {insumos.map((insumo) => (
                      <tr key={insumo.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {insumo.insumo?.nome || 'Insumo não encontrado'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {insumo.quantidade} {formatarUnidade(1, insumo.unidadeMedida)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right">
                          R$ {insumo.custo.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50">
                      <td colSpan={2} className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700 text-right">
                        Total:
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700 text-right">
                        R$ {produto.custoTotal.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
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
            
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Informações Adicionais</h4>
              <div className="bg-gray-50 rounded-md p-4 text-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Data de Criação:</span>
                  <span className="text-gray-700">{new Date(produto.dataCriacao).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Última Atualização:</span>
                  <span className="text-gray-700">{new Date(produto.dataAtualizacao).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}