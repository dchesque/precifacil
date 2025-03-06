// components/produtos/InsumosProduto.tsx
import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { 
  InsumoProduto, 
  adicionarInsumoProduto, 
  atualizarInsumoProduto,
  removerInsumoProduto, 
  listarInsumosProduto 
} from '../../services/produtos';
import { Insumo, listarInsumos } from '../../services/insumos';
import { converterUnidade, formatarUnidade } from '../../utils/conversao';

type InsumosProdutoProps = {
  produtoId: string;
  onCustoAtualizado?: (custoTotal: number) => void;
};

export default function InsumosProduto({ produtoId, onCustoAtualizado }: InsumosProdutoProps) {
  const [insumosProduto, setInsumosProduto] = useState<InsumoProduto[]>([]);
  const [insumosDisponiveis, setInsumosDisponiveis] = useState<Insumo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [custoTotal, setCustoTotal] = useState(0);
  
  // Estado para o formulário de adição de insumo
  const [novoInsumo, setNovoInsumo] = useState<string>('');
  const [quantidade, setQuantidade] = useState<number>(0);
  const [isAdicionando, setIsAdicionando] = useState(false);
  
  useEffect(() => {
    if (produtoId) {
      carregarDados();
    }
  }, [produtoId]);
  
  const carregarDados = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Carregar insumos do produto
      const insumosProduto = await listarInsumosProduto(produtoId);
      setInsumosProduto(insumosProduto);
      
      // Calcular custo total
      const total = insumosProduto.reduce((sum, item) => sum + item.custo, 0);
      setCustoTotal(total);
      
      if (onCustoAtualizado) {
        onCustoAtualizado(total);
      }
      
      // Carregar insumos disponíveis para adicionar
      const insumosDisponiveis = await listarInsumos(produtoId.split('-')[0]); // Assumindo que empresaId é o primeiro segmento do UUID
      setInsumosDisponiveis(insumosDisponiveis);
    } catch (err: any) {
      setError('Erro ao carregar insumos: ' + err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAdicionarInsumo = async () => {
    if (!novoInsumo || quantidade <= 0) {
      setError('Selecione um insumo e informe a quantidade.');
      return;
    }
    
    try {
      setIsAdicionando(true);
      setError(null);
      
      // Encontrar o insumo selecionado
      const insumoSelecionado = insumosDisponiveis.find(i => i.id === novoInsumo);
      
      if (!insumoSelecionado) {
        throw new Error('Insumo não encontrado');
      }
      
      // Calcular o custo do insumo
      const precoInsumo = insumoSelecionado.precoComDesconto || insumoSelecionado.preco;
      const custo = (precoInsumo / 1000) * quantidade; // Assumindo que o preço é por kg e a quantidade em gramas
      
      // Adicionar o insumo ao produto
      await adicionarInsumoProduto({
        produtoId,
        insumoId: insumoSelecionado.id,
        quantidade,
        unidadeMedida: insumoSelecionado.unidadeMedida,
        custo
      });
      
      // Limpar o formulário
      setNovoInsumo('');
      setQuantidade(0);
      
      // Recarregar os dados
      await carregarDados();
    } catch (err: any) {
      setError('Erro ao adicionar insumo: ' + err.message);
      console.error(err);
    } finally {
      setIsAdicionando(false);
    }
  };
  
  const handleAtualizarQuantidade = async (insumo: InsumoProduto, novaQuantidade: number) => {
    try {
      // Encontrar o insumo original para obter o preço
      const insumoOriginal = insumosDisponiveis.find(i => i.id === insumo.insumoId);
      
      if (!insumoOriginal) {
        throw new Error('Dados do insumo não encontrados');
      }
      
      // Calcular o novo custo
      const precoInsumo = insumoOriginal.precoComDesconto || insumoOriginal.preco;
      const novoCusto = (precoInsumo / 1000) * novaQuantidade; // Assumindo que o preço é por kg e a quantidade em gramas
      
      // Atualizar o insumo
      await atualizarInsumoProduto({
        ...insumo,
        quantidade: novaQuantidade,
        custo: novoCusto
      });
      
      // Recarregar os dados
      await carregarDados();
    } catch (err: any) {
      setError('Erro ao atualizar quantidade: ' + err.message);
      console.error(err);
    }
  };
  
  const handleRemoverInsumo = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este insumo do produto?')) {
      try {
        await removerInsumoProduto(id, produtoId);
        
        // Recarregar os dados
        await carregarDados();
      } catch (err: any) {
        setError('Erro ao remover insumo: ' + err.message);
        console.error(err);
      }
    }
  };
  
  if (isLoading) {
    return <div className="text-center py-4">Carregando insumos...</div>;
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Insumos do Produto</h3>
      
      {error && (
        <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          {error}
        </div>
      )}
      
      {/* Lista de insumos já adicionados */}
      <div className="mb-6">
        {insumosProduto.length === 0 ? (
          <p className="text-gray-500 text-sm mb-4">Nenhum insumo adicionado a este produto.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Insumo
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Custo
                  </th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {insumosProduto.map((insumo) => (
                  <tr key={insumo.id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {insumo.insumo?.nome || 'Insumo não encontrado'}
                      </div>
                      {insumo.insumo?.categoria && (
                        <div className="text-xs text-gray-500">
                          {insumo.insumo.categoria.nome}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <input 
                          type="number"
                          min="0"
                          value={insumo.quantidade}
                          onChange={(e) => handleAtualizarQuantidade(insumo, Number(e.target.value))}
                          className="w-20 text-sm border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-500">
                          {formatarUnidade(1, insumo.unidadeMedida)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      R$ {insumo.custo.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleRemoverInsumo(insumo.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td colSpan={2} className="px-4 py-3 text-right font-medium">
                    Custo Total:
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    R$ {custoTotal.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Formulário para adicionar novo insumo */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Adicionar Novo Insumo</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="insumo" className="block text-xs font-medium text-gray-500 mb-1">
              Insumo
            </label>
            <select
              id="insumo"
              value={novoInsumo}
              onChange={(e) => setNovoInsumo(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
            >
              <option value="">Selecione um insumo</option>
              {insumosDisponiveis.map((insumo) => (
                <option key={insumo.id} value={insumo.id}>
                  {insumo.nome} - {formatarUnidade(1, insumo.unidadeMedida)} - R$ {(insumo.precoComDesconto || insumo.preco).toFixed(2)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="quantidade" className="block text-xs font-medium text-gray-500 mb-1">
              Quantidade
            </label>
            <div className="flex items-center">
              <input
                id="quantidade"
                type="number"
                min="0"
                step="0.1"
                value={quantidade}
                onChange={(e) => setQuantidade(Number(e.target.value))}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
              />
              <span className="ml-2 text-sm text-gray-500">
                {novoInsumo && insumosDisponiveis.find(i => i.id === novoInsumo)?.unidadeMedida}
              </span>
            </div>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleAdicionarInsumo}
              disabled={isAdicionando || !novoInsumo || quantidade <= 0}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 text-sm disabled:opacity-50 flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              {isAdicionando ? 'Adicionando...' : 'Adicionar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}