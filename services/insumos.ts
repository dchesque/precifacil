// services/insumos.ts
import { supabase } from './supabase';

export type Insumo = {
  id: string;
  nome: string;
  descricao?: string;
  categoriaId?: string;
  empresaId: string;
  unidadeMedida: string;
  preco: number;
  precoComDesconto?: number;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
  categoria?: {
    id: string;
    nome: string;
  };
};

export type HistoricoPreco = {
  id: string;
  insumoId: string;
  precoAntigo: number;
  precoNovo: number;
  dataMudanca: string;
};

export type CategoriaInsumo = {
  id: string;
  nome: string;
  descricao?: string;
  empresaId: string;
};

// Funções para gerenciar categorias
export async function listarCategorias(empresaId: string) {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('nome');

  if (error) throw error;
  
  return data.map((cat: any) => ({
    id: cat.id,
    nome: cat.nome,
    descricao: cat.descricao,
    empresaId: cat.empresa_id,
  })) as CategoriaInsumo[];
}

export async function criarCategoria(categoria: Omit<CategoriaInsumo, 'id'>) {
  const { data, error } = await supabase
    .from('categorias')
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
  } as CategoriaInsumo;
}

export async function atualizarCategoria(categoria: CategoriaInsumo) {
  const { data, error } = await supabase
    .from('categorias')
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
  } as CategoriaInsumo;
}

export async function excluirCategoria(id: string) {
  const { error } = await supabase
    .from('categorias')
    .delete()
    .eq('id', id);

  if (error) throw error;
  
  return true;
}

// Funções para gerenciar insumos
export async function listarInsumos(empresaId: string) {
  const { data, error } = await supabase
    .from('insumos')
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
  
  return data.map((ins: any) => ({
    id: ins.id,
    nome: ins.nome,
    descricao: ins.descricao,
    categoriaId: ins.categoria_id,
    empresaId: ins.empresa_id,
    unidadeMedida: ins.unidade_medida,
    preco: ins.preco,
    precoComDesconto: ins.preco_com_desconto,
    ativo: ins.ativo,
    dataCriacao: ins.data_criacao,
    dataAtualizacao: ins.data_atualizacao,
    categoria: ins.categoria,
  })) as Insumo[];
}

export async function obterInsumo(id: string) {
  const { data, error } = await supabase
    .from('insumos')
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
    unidadeMedida: data.unidade_medida,
    preco: data.preco,
    precoComDesconto: data.preco_com_desconto,
    ativo: data.ativo,
    dataCriacao: data.data_criacao,
    dataAtualizacao: data.data_atualizacao,
    categoria: data.categoria,
  } as Insumo;
}

export async function criarInsumo(insumo: Omit<Insumo, 'id' | 'dataCriacao' | 'dataAtualizacao' | 'categoria'>) {
  const { data, error } = await supabase
    .from('insumos')
    .insert([
      {
        nome: insumo.nome,
        descricao: insumo.descricao,
        categoria_id: insumo.categoriaId,
        empresa_id: insumo.empresaId,
        unidade_medida: insumo.unidadeMedida,
        preco: insumo.preco,
        preco_com_desconto: insumo.precoComDesconto,
        ativo: insumo.ativo,
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
    unidadeMedida: data[0].unidade_medida,
    preco: data[0].preco,
    precoComDesconto: data[0].preco_com_desconto,
    ativo: data[0].ativo,
    dataCriacao: data[0].data_criacao,
    dataAtualizacao: data[0].data_atualizacao,
  } as Insumo;
}

export async function atualizarInsumo(insumo: Omit<Insumo, 'dataCriacao' | 'dataAtualizacao' | 'categoria'>) {
  const { data, error } = await supabase
    .from('insumos')
    .update({
      nome: insumo.nome,
      descricao: insumo.descricao,
      categoria_id: insumo.categoriaId,
      unidade_medida: insumo.unidadeMedida,
      preco: insumo.preco,
      preco_com_desconto: insumo.precoComDesconto,
      ativo: insumo.ativo,
    })
    .eq('id', insumo.id)
    .select();

  if (error) throw error;
  
  return {
    id: data[0].id,
    nome: data[0].nome,
    descricao: data[0].descricao,
    categoriaId: data[0].categoria_id,
    empresaId: data[0].empresa_id,
    unidadeMedida: data[0].unidade_medida,
    preco: data[0].preco,
    precoComDesconto: data[0].preco_com_desconto,
    ativo: data[0].ativo,
    dataCriacao: data[0].data_criacao,
    dataAtualizacao: data[0].data_atualizacao,
  } as Insumo;
}

export async function excluirInsumo(id: string) {
  // Exclusão lógica (recomendado)
  const { error } = await supabase
    .from('insumos')
    .update({ ativo: false })
    .eq('id', id);

  if (error) throw error;
  
  return true;
}

export async function obterHistoricoPrecos(insumoId: string) {
  const { data, error } = await supabase
    .from('historico_preco_insumo')
    .select('*')
    .eq('insumo_id', insumoId)
    .order('data_mudanca', { ascending: false });

  if (error) throw error;
  
  return data.map((hist: any) => ({
    id: hist.id,
    insumoId: hist.insumo_id,
    precoAntigo: hist.preco_antigo,
    precoNovo: hist.preco_novo,
    dataMudanca: hist.data_mudanca,
  })) as HistoricoPreco[];
}