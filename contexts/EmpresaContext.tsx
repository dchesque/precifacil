import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../services/supabase';

type Empresa = {
  id: string;
  nome: string;
  cnpj?: string;
};

type EmpresaContextType = {
  empresas: Empresa[];
  empresaAtual: Empresa | null;
  isLoading: boolean;
  criarEmpresa: (nome: string, cnpj?: string) => Promise<{ error: any }>;
  setEmpresaAtual: (empresa: Empresa) => void;
};

const EmpresaContext = createContext<EmpresaContextType | undefined>(undefined);

export const EmpresaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaAtual, setEmpresaAtualState] = useState<Empresa | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const carregarEmpresas = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('usuario_empresa')
          .select('empresas(id, nome, cnpj)')
          .eq('usuario_id', user.id);

        if (error) throw error;

        const empresasDoUsuario = data.map((item: any) => item.empresas).filter(Boolean);
        setEmpresas(empresasDoUsuario);

        // Recuperar empresa atual do localStorage
        const empresaAtualId = localStorage.getItem('empresaAtualId');
        if (empresaAtualId) {
          const empresa = empresasDoUsuario.find((e: Empresa) => e.id === empresaAtualId);
          if (empresa) setEmpresaAtualState(empresa);
        } else if (empresasDoUsuario.length > 0) {
          setEmpresaAtualState(empresasDoUsuario[0]);
          localStorage.setItem('empresaAtualId', empresasDoUsuario[0].id);
        }
      } catch (error) {
        console.error('Erro ao carregar empresas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    carregarEmpresas();
  }, [user]);

  const criarEmpresa = async (nome: string, cnpj?: string) => {
    try {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
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
      const novaEmpresa = {
        id: empresaData.id,
        nome: empresaData.nome,
        cnpj: empresaData.cnpj,
      };
      
      setEmpresas(prev => [...prev, novaEmpresa]);
      setEmpresaAtualState(novaEmpresa);
      localStorage.setItem('empresaAtualId', novaEmpresa.id);

      return { error: null };
    } catch (error) {
      console.error('Erro ao criar empresa:', error);
      return { error };
    }
  };

  const setEmpresaAtual = (empresa: Empresa) => {
    setEmpresaAtualState(empresa);
    localStorage.setItem('empresaAtualId', empresa.id);
  };

  const value = {
    empresas,
    empresaAtual,
    isLoading,
    criarEmpresa,
    setEmpresaAtual,
  };

  return (
    <EmpresaContext.Provider value={value}>
      {children}
    </EmpresaContext.Provider>
  );
};

export const useEmpresa = () => {
  const context = useContext(EmpresaContext);
  if (context === undefined) {
    throw new Error('useEmpresa must be used within an EmpresaProvider');
  }
  return context;
};