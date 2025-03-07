// contexts/EmpresaContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../services/supabase';

// Definições de tipos
export type Empresa = {
  id: string;
  nome: string;
  cnpj?: string;
};

// Status para controle de carregamento
type LoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';

type EmpresaContextType = {
  empresas: Empresa[];
  empresaAtual: Empresa | null;
  status: LoadingStatus;
  error: string | null;
  criarEmpresa: (nome: string, cnpj?: string) => Promise<{ error: any }>;
  setEmpresaAtual: (empresa: Empresa) => void;
  recarregarEmpresas: () => Promise<void>;
};

// Valor inicial do contexto
const initialContext: EmpresaContextType = {
  empresas: [],
  empresaAtual: null,
  status: 'idle',
  error: null,
  criarEmpresa: async () => ({ error: new Error('Context not initialized') }),
  setEmpresaAtual: () => {},
  recarregarEmpresas: async () => {},
};

const EmpresaContext = createContext<EmpresaContextType>(initialContext);

// Chaves para armazenamento no localStorage
const STORAGE_KEYS = {
  EMPRESAS: 'pricefood_empresas',
  EMPRESA_ATUAL: 'pricefood_empresa_atual',
};

export const EmpresaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estados
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaAtual, setEmpresaAtualState] = useState<Empresa | null>(null);
  const [status, setStatus] = useState<LoadingStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();

  // Recuperar dados do localStorage
  const recuperarDadosArmazenados = useCallback(() => {
    try {
      // Só tenta recuperar do storage se estivermos em um navegador
      if (typeof window !== 'undefined') {
        const empresasArmazenadas = localStorage.getItem(STORAGE_KEYS.EMPRESAS);
        if (empresasArmazenadas) {
          const parsedEmpresas = JSON.parse(empresasArmazenadas) as Empresa[];
          if (Array.isArray(parsedEmpresas) && parsedEmpresas.length > 0) {
            console.log('Empresas recuperadas do localStorage:', parsedEmpresas);
            setEmpresas(parsedEmpresas);
            
            // Recuperar empresa atual
            const empresaAtualId = localStorage.getItem(STORAGE_KEYS.EMPRESA_ATUAL);
            if (empresaAtualId) {
              const empresaEncontrada = parsedEmpresas.find(e => e.id === empresaAtualId);
              if (empresaEncontrada) {
                console.log('Empresa atual recuperada do localStorage:', empresaEncontrada);
                setEmpresaAtualState(empresaEncontrada);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Erro ao recuperar dados do localStorage:', err);
    }
  }, []);

  // Salvar dados no localStorage
  const salvarDadosStorage = useCallback((novasEmpresas?: Empresa[], novaEmpresaAtual?: Empresa | null) => {
    try {
      if (typeof window !== 'undefined') {
        const empresasParaSalvar = novasEmpresas || empresas;
        localStorage.setItem(STORAGE_KEYS.EMPRESAS, JSON.stringify(empresasParaSalvar));
        
        const empresaAtualParaSalvar = novaEmpresaAtual !== undefined ? novaEmpresaAtual : empresaAtual;
        if (empresaAtualParaSalvar) {
          localStorage.setItem(STORAGE_KEYS.EMPRESA_ATUAL, empresaAtualParaSalvar.id);
        } else {
          localStorage.removeItem(STORAGE_KEYS.EMPRESA_ATUAL);
        }
      }
    } catch (err) {
      console.error('Erro ao salvar dados no localStorage:', err);
    }
  }, [empresas, empresaAtual]);

  // Função para carregar empresas do Supabase
  const carregarEmpresasDoSupabase = useCallback(async () => {
    if (!user) {
      setEmpresas([]);
      setEmpresaAtualState(null);
      setStatus('loaded');
      salvarDadosStorage([], null);
      return;
    }

    try {
      setStatus('loading');
      setError(null);

      console.log('Carregando empresas do usuário:', user.id);
      const { data, error } = await supabase
        .from('usuario_empresa')
        .select('empresas(id, nome, cnpj)')
        .eq('usuario_id', user.id);

      if (error) {
        console.error('Erro ao buscar empresas:', error);
        setError(`Erro ao carregar empresas: ${error.message}`);
        setStatus('error');
        return;
      }

      // Processar dados recebidos
      console.log('Dados recebidos do Supabase:', data);
      
      // Verificar se data é válido
      if (!Array.isArray(data)) {
        console.error('Dados recebidos não são um array:', data);
        setError('Formato de dados inválido');
        setStatus('error');
        return;
      }

      // Extrair empresas do formato retornado
      const empresasProcessadas = data
        .map((item: any) => item.empresas)
        .filter((empresa): empresa is Empresa => !!empresa && typeof empresa === 'object');
      
      console.log('Empresas processadas:', empresasProcessadas);
      
      if (empresasProcessadas.length === 0) {
        console.log('Nenhuma empresa encontrada para o usuário');
      }

      // Atualizar estado
      setEmpresas(empresasProcessadas);
      
      // Verificar empresa atual
      const empresaAtualId = localStorage.getItem(STORAGE_KEYS.EMPRESA_ATUAL);
      if (empresaAtualId) {
        const empresaEncontrada = empresasProcessadas.find(e => e.id === empresaAtualId);
        if (empresaEncontrada) {
          setEmpresaAtualState(empresaEncontrada);
        } else if (empresasProcessadas.length === 1) {
          // Se não encontrou a empresa atual mas só tem uma, seleciona ela
          setEmpresaAtualState(empresasProcessadas[0]);
        } else {
          // Se não encontrou e tem várias ou nenhuma, limpa a seleção
          setEmpresaAtualState(null);
        }
      } else if (empresasProcessadas.length === 1) {
        // Se não tinha empresa selecionada e só tem uma, seleciona ela
        setEmpresaAtualState(empresasProcessadas[0]);
      } else {
        // Se não tinha seleção e tem várias ou nenhuma, mantém sem seleção
        setEmpresaAtualState(null);
      }

      // Salvar no localStorage
      salvarDadosStorage(empresasProcessadas);
      
      setStatus('loaded');
    } catch (err: any) {
      console.error('Erro ao carregar empresas:', err);
      setError(`Erro inesperado: ${err.message || 'Desconhecido'}`);
      setStatus('error');
    }
  }, [user, salvarDadosStorage]);

  // Expor função de recarregamento
  const recarregarEmpresas = useCallback(async () => {
    await carregarEmpresasDoSupabase();
  }, [carregarEmpresasDoSupabase]);

  // Efeito para inicialização
  useEffect(() => {
    // Primeiro tenta recuperar do localStorage para ter dados rápidos
    recuperarDadosArmazenados();
    
    // Depois carrega dados atualizados do Supabase
    carregarEmpresasDoSupabase();
  }, [recuperarDadosArmazenados, carregarEmpresasDoSupabase]);
  
  // Função para criar empresa
  const criarEmpresa = async (nome: string, cnpj?: string) => {
    try {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      console.log('Criando empresa:', nome, cnpj);
      setStatus('loading');
      
      // 1. Inserir nova empresa
      const { data: empresaData, error: empresaError } = await supabase
        .from('empresas')
        .insert([{ 
          nome, 
          cnpj: cnpj || null,
          ativo: true 
        }])
        .select()
        .single();

      if (empresaError) throw empresaError;

      // 2. Associar usuário à empresa
      const { error: associacaoError } = await supabase
        .from('usuario_empresa')
        .insert([{
          usuario_id: user.id,
          empresa_id: empresaData.id,
          role: 'ADMIN'
        }]);

      if (associacaoError) throw associacaoError;

      // 3. Atualizar estado
      const novaEmpresa: Empresa = {
        id: empresaData.id,
        nome: empresaData.nome,
        cnpj: empresaData.cnpj,
      };
      
      const novasEmpresas = [...empresas, novaEmpresa];
      
      console.log('Empresa criada com sucesso:', novaEmpresa);
      setEmpresas(novasEmpresas);
      setEmpresaAtualState(novaEmpresa);
      
      // Salvar no localStorage
      salvarDadosStorage(novasEmpresas, novaEmpresa);
      
      setStatus('loaded');
      return { error: null };
    } catch (error: any) {
      console.error('Erro ao criar empresa:', error);
      setStatus('error');
      setError(`Erro ao criar empresa: ${error.message || 'Desconhecido'}`);
      return { error };
    }
  };

  // Função para definir empresa atual
  const setEmpresaAtual = (empresa: Empresa) => {
    console.log('Alterando empresa atual para:', empresa);
    setEmpresaAtualState(empresa);
    salvarDadosStorage(undefined, empresa);
  };

  // Valor do contexto
  const contextValue: EmpresaContextType = {
    empresas,
    empresaAtual,
    status,
    error,
    criarEmpresa,
    setEmpresaAtual,
    recarregarEmpresas,
  };

  return (
    <EmpresaContext.Provider value={contextValue}>
      {children}
    </EmpresaContext.Provider>
  );
};

// Hook para usar o contexto
export const useEmpresa = () => {
  const context = useContext(EmpresaContext);
  
  if (!context) {
    throw new Error('useEmpresa must be used within an EmpresaProvider');
  }
  
  return context;
};