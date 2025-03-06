// components/produtos/FormProduto.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Produto, 
  CategoriaProduto, 
  criarProduto, 
  atualizarProduto, 
  listarCategoriasProduto, 
  criarCategoriaProduto,
  calcularMargemLucro
} from '../../services/produtos';
import { useEmpresa } from '../../contexts/EmpresaContext';
import InsumosProduto from './InsumosProduto';

type FormProdutoProps = {
  produtoInicial?: Omit<Produto, 'dataCriacao' | 'dataAtualizacao' | 'categoria'>;
  modoEdicao?: boolean;
};

export default function FormProduto({ produtoInicial, modoEdicao = false }: FormProdutoProps) {
  const router = useRouter();
  const { empresaAtual } = useEmpresa();
  const [categorias, setCategorias] = useState<CategoriaProduto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [custoTotal, setCustoTotal] = useState(0);
  const [novaCategoriaMode, setNovaCategoriaMode] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState('');
  
  // Estado do formulário
  const [formData, setFormData] = useState<Omit<Produto, 'id' | 'dataCriacao' | 'dataAtualizacao' | 'categoria'>>({
    nome: '',
    descricao: '',
    categoriaId: undefined,
    empresaId: empresaAtual?.id || '',
    precoVenda: 0,
    precoPromocional: undefined,
    custoTotal: 0,
    margemLucro: 0,
    ativo: true,
  });
  
  useEffect(() => {
    if (empresaAtual) {
      carregarCategorias();
      
      if (produtoInicial) {
        setFormData({
          ...produtoInicial,
          empresaId: empresaAtual.id,
        });
        setCustoTotal(produtoInicial.custoTotal);
      } else {
        setFormData(prev => ({
          ...prev,
          empresaId: empresaAtual.id,
        }));
      }
    }
  }, [empresaAtual, produtoInicial]);
  
  const carregarCategorias = async () => {
    try {
      if (!empresaAtual) return;
      
      const data = await listarCategoriasProduto(empresaAtual.id);
      setCategorias(data);
    } catch (err: any) {
      console.error('Erro ao carregar categorias:', err);
    }
  };
  
  // Atualiza a margem de lucro quando o preço ou custo mudam
  useEffect(() => {
    const margem = calcularMargemLucro(formData.precoVenda, custoTotal);
    setFormData(prev => ({
      ...prev,
      margemLucro: margem,
      custoTotal
    }));
  }, [formData.precoVenda, custoTotal]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  
  const handleCustoAtualizado = (novoCusto: number) => {
    setCustoTotal(novoCusto);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      if (!empresaAtual) {
        throw new Error('Nenhuma empresa selecionada');
      }
      
      // Criar nova categoria, se necessário
      if (novaCategoriaMode && novaCategoria.trim()) {
        const novaCat = await criarCategoriaProduto({
          nome: novaCategoria.trim(),
          empresaId: empresaAtual.id,
        });
        
        setFormData({
          ...formData,
          categoriaId: novaCat.id,
        });
        
        // Atualizar lista de categorias
        setCategorias([...categorias, novaCat]);
        setNovaCategoriaMode(false);
        setNovaCategoria('');
      }
      
      if (modoEdicao && produtoInicial) {
        await atualizarProduto({
          ...formData,
          id: produtoInicial.id,
        });
      } else {
        await criarProduto(formData);
      }
      
      // Redirecionar para a lista de produtos
      router.push('/produtos');
    } catch (err: any) {
      setError('Erro ao salvar produto: ' + err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        {modoEdicao ? 'Editar Produto' : 'Novo Produto'}
      </h2>
      
      {error && (
        <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
                Nome do Produto *
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                required
                value={formData.nome}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div className="col-span-2">
              <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">
                Descrição
              </label>
              <textarea
                id="descricao"
                name="descricao"
                rows={3}
                value={formData.descricao || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            {!novaCategoriaMode ? (
              <div>
                <label htmlFor="categoriaId" className="block text-sm font-medium text-gray-700">
                  Categoria
                </label>
                <div className="flex items-center mt-1">
                  <select
                    id="categoriaId"
                    name="categoriaId"
                    value={formData.categoriaId || ''}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nome}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setNovaCategoriaMode(true)}
                    className="ml-2 px-3 py-2 text-sm text-primary-600 hover:text-primary-700"
                  >
                    + Nova
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="novaCategoria" className="block text-sm font-medium text-gray-700">
                  Nova Categoria
                </label>
                <div className="flex items-center mt-1">
                  <input
                    type="text"
                    id="novaCategoria"
                    value={novaCategoria}
                    onChange={(e) => setNovaCategoria(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Nome da nova categoria"
                  />
                  <button
                    type="button"
                    onClick={() => setNovaCategoriaMode(false)}
                    className="ml-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-700"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="precoVenda" className="block text-sm font-medium text-gray-700">
                Preço de Venda (R$) *
              </label>
              <input
                type="number"
                id="precoVenda"
                name="precoVenda"
                required
                step="0.01"
                min="0"
                value={formData.precoVenda}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label htmlFor="precoPromocional" className="block text-sm font-medium text-gray-700">
                Preço Promocional (R$)
              </label>
              <input
                type="number"
                id="precoPromocional"
                name="precoPromocional"
                step="0.01"
                min="0"
                value={formData.precoPromocional || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Custo Total (R$)
              </label>
              <p className="mt-1 px-3 py-2 border border-gray-200 bg-gray-50 rounded-md text-gray-700">
                {custoTotal.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Calculado com base nos insumos adicionados abaixo
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Margem de Lucro (%)
              </label>
              <p className={`mt-1 px-3 py-2 border border-gray-200 rounded-md ${
                formData.margemLucro < 30 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
              }`}>
                {formData.margemLucro.toFixed(2)}%
              </p>
            </div>
          </div>
          
          {/* Seção de insumos só aparece quando estamos editando ou após criação inicial */}
          {modoEdicao && produtoInicial && (
            <div className="mt-4">
              <InsumosProduto 
                produtoId={produtoInicial.id} 
                onCustoAtualizado={handleCustoAtualizado}
              />
            </div>
          )}
          
          <div className="flex justify-end pt-5">
            <button
              type="button"
              onClick={() => router.push('/produtos')}
              className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}