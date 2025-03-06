// services/produtos.ts
import { supabase } from './supabase';
import { Insumo } from './insumos';

export type Produto = {
  id: string;
  nome: string;
  descricao?: string;
  categoriaId?: string;
  empresaId: string;
  precoVenda: number;
  precoPromocional?: number;
  custoTotal: number;
  margemLucro: number;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
  categoria?: {
    id: string;
    nome: string;
  };
};

export type InsumoProduto = {
  id: string;
  produtoId: string;
  insumoId: string;
  quantidade: number;
  unidadeMedida: string;
  custo: number;
  insumo?: Insumo;
};

export type HistoricoPreco = {
  id: string;
  produtoId: string;
  precoAntigo: number;
  precoNovo: number;
  dataMudanca: string;
};

export type CategoriaProduto = {
  id: string;
  nome: string;
  descricao?: string;
  empresaId: string;
};

// Funções para gerenciar categorias
export async function listarCategoriasProduto(empresaId: string) {
  const { data, error } = await supabase
    .from('categorias_produto')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('nome');

  if (error) throw error;
  
  return data.map((cat: any) => ({
    id: cat.id,
    nome: cat.nome,
    descricao: cat.descricao,
    empresaId: cat.empresa_id,
  })) as CategoriaProduto[];
}

export async function criarCategoriaProduto(categoria: Omit<CategoriaProduto, 'id'>) {
  const { data, error } = await supabase
    .from('categorias_produto')
    .insert([
      {
        nome: categoria.nome,
        descricao: categoria.descricao,
        empresa_id: categoria.empresaId,
      },
    ])
    .select();

  if (error) throw error;
  
  return {
    id: data[0].id,
    nome: data[0].nome,
    descricao: data[0].descricao,
    empresaId: data[0].empresa_id,
  } as CategoriaProduto;
}

export async function atualizarCategoriaProduto(categoria: CategoriaProduto) {
  const { data, error } = await supabase
    .from('categorias_produto')
    .update({
      nome: categoria.nome,
      descricao: categoria.descricao,
    })
    .eq('id', categoria.id)
    .select();

  if (error) throw error;
  
  return {
    id: data[0].id,
    nome: data[0].nome,
    descricao: data[0].descricao,
    empresaId: data[0].empresa_id,
  } as CategoriaProduto;
}

export async function excluirCategoriaProduto(id: string) {
  const { error } = await supabase
    .from('categorias_produto')
    .delete()
    .eq('id', id);

  if (error) throw error;
  
  return true;
}

// Funções para gerenciar produtos
export async function listarProdutos(empresaId: string) {
  const { data, error } = await supabase
    .from('produtos')
    .select(`
      *,
      categoria:categoria_id (
        id,
        nome
      )
    `)
    .eq('empresa_id', empresaId)
    .eq('ativo', true)
    .order('nome');

  if (error) throw error;
  
  return data.map((prod: any) => ({
    id: prod.id,
    nome: prod.nome,
    descricao: prod.descricao,
    categoriaId: prod.categoria_id,
    empresaId: prod.empresa_id,
    precoVenda: prod.preco_venda,
    precoPromocional: prod.preco_promocional,
    custoTotal: prod.custo_total,
    margemLucro: prod.margem_lucro,
    ativo: prod.ativo,
    dataCriacao: prod.data_criacao,
    dataAtualizacao: prod.data_atualizacao,
    categoria: prod.categoria,
  })) as Produto[];
}

export async function obterProduto(id: string) {
  const { data, error } = await supabase
    .from('produtos')
    .select(`
      *,
      categoria:categoria_id (
        id,
        nome
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  
  return {
    id: data.id,
    nome: data.nome,
    descricao: data.descricao,
    categoriaId: data.categoria_id,
    empresaId: data.empresa_id,
    precoVenda: data.preco_venda,
    precoPromocional: data.preco_promocional,
    custoTotal: data.custo_total,
    margemLucro: data.margem_lucro,
    ativo: data.ativo,
    dataCriacao: data.data_criacao,
    dataAtualizacao: data.data_atualizacao,
    categoria: data.categoria,
  } as Produto;
}

export async function criarProduto(produto: Omit<Produto, 'id' | 'dataCriacao' | 'dataAtualizacao' | 'categoria'>) {
  const { data, error } = await supabase
    .from('produtos')
    .insert([
      {
        nome: produto.nome,
        descricao: produto.descricao,
        categoria_id: produto.categoriaId,
        empresa_id: produto.empresaId,
        preco_venda: produto.precoVenda,
        preco_promocional: produto.precoPromocional,
        custo_total: produto.custoTotal,
        margem_lucro: produto.margemLucro,
        ativo: produto.ativo,
      },
    ])
    .select();

  if (error) throw error;
  
  return {
    id: data[0].id,
    nome: data[0].nome,
    descricao: data[0].descricao,
    categoriaId: data[0].categoria_id,
    empresaId: data[0].empresa_id,
    precoVenda: data[0].preco_venda,
    precoPromocional: data[0].preco_promocional,
    custoTotal: data[0].custo_total,
    margemLucro: data[0].margem_lucro,
    ativo: data[0].ativo,
    dataCriacao: data[0].data_criacao,
    dataAtualizacao: data[0].data_atualizacao,
  } as Produto;
}

export async function atualizarProduto(produto: Omit<Produto, 'dataCriacao' | 'dataAtualizacao' | 'categoria'>) {
  // Verificar se o preço mudou para registrar no histórico
  if (produto.id) {
    const produtoAtual = await obterProduto(produto.id);
    
    if (produtoAtual.precoVenda !== produto.precoVenda) {
      // Registrar no histórico de preços
      await registrarHistoricoPreco({
        produtoId: produto.id,
        precoAntigo: produtoAtual.precoVenda,
        precoNovo: produto.precoVenda
      });
    }
  }
  
  const { data, error } = await supabase
    .from('produtos')
    .update({
      nome: produto.nome,
      descricao: produto.descricao,
      categoria_id: produto.categoriaId,
      preco_venda: produto.precoVenda,
      preco_promocional: produto.precoPromocional,
      custo_total: produto.custoTotal,
      margem_lucro: produto.margemLucro,
      ativo: produto.ativo,
    })
    .eq('id', produto.id)
    .select();

  if (error) throw error;
  
  return {
    id: data[0].id,
    nome: data[0].nome,
    descricao: data[0].descricao,
    categoriaId: data[0].categoria_id,
    empresaId: data[0].empresa_id,
    precoVenda: data[0].preco_venda,
    precoPromocional: data[0].preco_promocional,
    custoTotal: data[0].custo_total,
    margemLucro: data[0].margem_lucro,
    ativo: data[0].ativo,
    dataCriacao: data[0].data_criacao,
    dataAtualizacao: data[0].data_atualizacao,
  } as Produto;
}

export async function excluirProduto(id: string) {
  // Exclusão lógica (recomendado)
  const { error } = await supabase
    .from('produtos')
    .update({ ativo: false })
    .eq('id', id);

  if (error) throw error;
  
  return true;
}

// Gerenciar histórico de preços
export async function obterHistoricoPrecosProduto(produtoId: string) {
  const { data, error } = await supabase
    .from('historico_preco_produto')
    .select('*')
    .eq('produto_id', produtoId)
    .order('data_mudanca', { ascending: false });

  if (error) throw error;
  
  return data.map((hist: any) => ({
    id: hist.id,
    produtoId: hist.produto_id,
    precoAntigo: hist.preco_antigo,
    precoNovo: hist.preco_novo,
    dataMudanca: hist.data_mudanca,
  })) as HistoricoPreco[];
}

export async function registrarHistoricoPreco(historicoPreco: Omit<HistoricoPreco, 'id' | 'dataMudanca'>) {
  const { data, error } = await supabase
    .from('historico_preco_produto')
    .insert([
      {
        produto_id: historicoPreco.produtoId,
        preco_antigo: historicoPreco.precoAntigo,
        preco_novo: historicoPreco.precoNovo,
      },
    ])
    .select();

  if (error) throw error;
  
  return {
    id: data[0].id,
    produtoId: data[0].produto_id,
    precoAntigo: data[0].preco_antigo,
    precoNovo: data[0].preco_novo,
    dataMudanca: data[0].data_mudanca,
  } as HistoricoPreco;
}

// Gerenciar insumos do produto
export async function listarInsumosProduto(produtoId: string) {
  const { data, error } = await supabase
    .from('insumo_produto')
    .select(`
      *,
      insumo:insumo_id (
        id,
        nome,
        preco,
        preco_com_desconto,
        unidade_medida,
        categoria:categoria_id (
          id,
          nome
        )
      )
    `)
    .eq('produto_id', produtoId);

  if (error) throw error;
  
  return data.map((item: any) => ({
    id: item.id,
    produtoId: item.produto_id,
    insumoId: item.insumo_id,
    quantidade: item.quantidade,
    unidadeMedida: item.unidade_medida,
    custo: item.custo,
    insumo: item.insumo ? {
      id: item.insumo.id,
      nome: item.insumo.nome,
      preco: item.insumo.preco,
      precoComDesconto: item.insumo.preco_com_desconto,
      unidadeMedida: item.insumo.unidade_medida,
      categoria: item.insumo.categoria
    } : undefined,
  })) as InsumoProduto[];
}

export async function adicionarInsumoProduto(insumoProduto: Omit<InsumoProduto, 'id' | 'insumo'>) {
  const { data, error } = await supabase
    .from('insumo_produto')
    .insert([
      {
        produto_id: insumoProduto.produtoId,
        insumo_id: insumoProduto.insumoId,
        quantidade: insumoProduto.quantidade,
        unidade_medida: insumoProduto.unidadeMedida,
        custo: insumoProduto.custo,
      },
    ])
    .select();

  if (error) throw error;

  // Após adicionar um insumo, atualizar o custo total do produto
  await atualizarCustoTotalProduto(insumoProduto.produtoId);
  
  return {
    id: data[0].id,
    produtoId: data[0].produto_id,
    insumoId: data[0].insumo_id,
    quantidade: data[0].quantidade,
    unidadeMedida: data[0].unidade_medida,
    custo: data[0].custo,
  } as InsumoProduto;
}

export async function atualizarInsumoProduto(insumoProduto: Omit<InsumoProduto, 'insumo'>) {
  const { data, error } = await supabase
    .from('insumo_produto')
    .update({
      quantidade: insumoProduto.quantidade,
      unidade_medida: insumoProduto.unidadeMedida,
      custo: insumoProduto.custo,
    })
    .eq('id', insumoProduto.id)
    .select();

  if (error) throw error;

  // Após atualizar um insumo, atualizar o custo total do produto
  await atualizarCustoTotalProduto(insumoProduto.produtoId);
  
  return {
    id: data[0].id,
    produtoId: data[0].produto_id,
    insumoId: data[0].insumo_id,
    quantidade: data[0].quantidade,
    unidadeMedida: data[0].unidade_medida,
    custo: data[0].custo,
  } as InsumoProduto;
}

export async function removerInsumoProduto(id: string, produtoId: string) {
  const { error } = await supabase
    .from('insumo_produto')
    .delete()
    .eq('id', id);

  if (error) throw error;

  // Após remover um insumo, atualizar o custo total do produto
  await atualizarCustoTotalProduto(produtoId);
  
  return true;
}

// Função para calcular e atualizar o custo total do produto
async function atualizarCustoTotalProduto(produtoId: string) {
  try {
    // 1. Obter todos os insumos do produto
    const insumos = await listarInsumosProduto(produtoId);
    
    // 2. Calcular o custo total
    const custoTotal = insumos.reduce((total, item) => total + item.custo, 0);
    
    // 3. Obter o produto atual para calcular a margem
    const produto = await obterProduto(produtoId);
    
    // 4. Calcular a nova margem de lucro
    let margemLucro = 0;
    if (custoTotal > 0 && produto.precoVenda > 0) {
      margemLucro = ((produto.precoVenda - custoTotal) / produto.precoVenda) * 100;
    }
    
    // 5. Atualizar o produto com o novo custo total e margem
    const { error } = await supabase
      .from('produtos')
      .update({
        custo_total: custoTotal,
        margem_lucro: margemLucro
      })
      .eq('id', produtoId);
    
    if (error) throw error;
    
    return { custoTotal, margemLucro };
  } catch (error) {
    console.error('Erro ao atualizar custo total:', error);
    throw error;
  }
}

// Função para calcular margens em tempo real (sem persistir)
export function calcularMargemLucro(precoVenda: number, custoTotal: number): number {
  if (precoVenda <= 0 || custoTotal <= 0) return 0;
  return ((precoVenda - custoTotal) / precoVenda) * 100;
}