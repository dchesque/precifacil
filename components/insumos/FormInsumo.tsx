// components/insumos/FormInsumo.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Insumo, 
  CategoriaInsumo, 
  criarInsumo, 
  atualizarInsumo, 
  listarCategorias, 
  criarCategoria 
} from '../../services/insumos';
import { useEmpresa } from '../../contexts/EmpresaContext';
import { unidadesMedida } from '../../utils/conversao';

type FormInsumoProps = {
  insumoInicial?: Omit<Insumo, 'dataCriacao' | 'dataAtualizacao' | 'categoria'>;
  modoEdicao?: boolean;
};

export default function FormInsumo({ insumoInicial, modoEdicao = false }: FormInsumoProps) {
  const router = useRouter();
  const { empresaAtual } = useEmpresa();
  const [categorias, setCategorias] = useState<CategoriaInsumo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [novaCategoriaMode, setNovaCategoriaMode] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState('');
  
  // Estado do formulário
  const [formData, setFormData] = useState<Omit<Insumo, 'id' | 'dataCriacao' | 'dataAtualizacao' | 'categoria'>>({
    nome: '',
    descricao: '',
    categoriaId: undefined,
    empresaId: empresaAtual?.id || '',
    unidadeMedida: 'g',
    preco: 0,
    precoComDesconto: undefined,
    ativo: true,
  });
  
  useEffect(() => {
    if (empresaAtual) {
      carregarCategorias();
      
      if (insumoInicial) {
        setFormData({
          ...insumoInicial,
          empresaId: empresaAtual.id,
        });
      } else {
        setFormData(prev => ({
          ...prev,
          empresaId: empresaAtual.id,
        }));
      }
    }
  }, [empresaAtual, insumoInicial]);
  
  const carregarCategorias = async () => {
    try {
      if (!empresaAtual) return;
      
      const data = await listarCategorias(empresaAtual.id);
      setCategorias(data);
    } catch (err: any) {
      console.error('Erro ao carregar categorias:', err);
      setError(`Erro ao carregar categorias: ${err.message || 'Erro desconhecido'}`);
    }
  };
  
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      if (!empresaAtual) {
        throw new Error('Nenhuma empresa selecionada');
      }
      
      // Validações básicas
      if (formData.preco <= 0) {
        throw new Error('O preço deve ser maior que zero');
      }
      
      if (formData.precoComDesconto !== undefined && formData.precoComDesconto <= 0) {
        throw new Error('O preço com desconto deve ser maior que zero');
      }
      
      if (formData.precoComDesconto !== undefined && formData.precoComDesconto >= formData.preco) {
        throw new Error('O preço com desconto deve ser menor que o preço original');
      }
      
      // Criar nova categoria, se necessário
      if (novaCategoriaMode && novaCategoria.trim()) {
        const novaCat = await criarCategoria({
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
      
      if (modoEdicao && insumoInicial) {
        await atualizarInsumo({
          ...formData,
          id: insumoInicial.id,
        });
      } else {
        await criarInsumo(formData);
      }
      
      // Redirecionar para a lista de insumos
      router.push('/insumos');
    } catch (err: any) {
      setError('Erro ao salvar insumo: ' + err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        {modoEdicao ? 'Editar Insumo' : 'Novo Insumo'}
      </h2>
      
      {error && (
        <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
              Nome do Insumo *
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
            <label htmlFor="unidadeMedida" className="block text-sm font-medium text-gray-700">
              Unidade de Medida *
            </label>
            <select
              id="unidadeMedida"
              name="unidadeMedida"
              required
              value={formData.unidadeMedida}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              {unidadesMedida.map((unidade) => (
                <option key={unidade.valor} value={unidade.valor}>
                  {unidade.nome}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="preco" className="block text-sm font-medium text-gray-700">
              Preço (R$) *
            </label>
            <input
              type="number"
              id="preco"
              name="preco"
              required
              step="0.01"
              min="0.01"
              value={formData.preco}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label htmlFor="precoComDesconto" className="block text-sm font-medium text-gray-700">
              Preço com Desconto (R$)
            </label>
            <input
              type="number"
              id="precoComDesconto"
              name="precoComDesconto"
              step="0.01"
              min="0"
              value={formData.precoComDesconto || ''}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => router.push('/insumos')}
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
      </form>
    </div>
  );
}