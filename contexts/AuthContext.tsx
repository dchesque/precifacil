import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: any;
    success: boolean;
    redirectTo?: string;
  }>;
  signUp: (email: string, password: string, name: string) => Promise<{
    error: any;
    success: boolean;
  }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{
    error: any;
    success: boolean;
  }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        setSession(data.session);
        setUser(data.session?.user ?? null);
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        setIsLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    
      // Verificação das empresas associadas ao usuário
      const { data: associacoes, error: associacoesError } = await supabase
        .from('usuario_empresa')
        .select('*')
        .eq('usuario_id', data.user?.id);

      console.log('Associações do usuário:', associacoes);
      
      if (associacoesError) {
        console.error('Erro ao buscar associações:', associacoesError);
        throw associacoesError;
      }

      // Lógica de redirecionamento
      let redirectTo = '/empresas/nova'; // Default: criar empresa

      if (associacoes && associacoes.length > 0) {
        // Tem pelo menos uma empresa
        if (associacoes.length === 1) {
          // Apenas uma empresa: vai direto para o dashboard
          redirectTo = '/dashboard';
        } else {
          // Múltiplas empresas: vai para a tela de seleção
          redirectTo = '/empresas/selecionar';
        }
      }
      
      return { 
        error: null, 
        success: true, 
        redirectTo 
      };
    } catch (error) {
      console.error('Erro no login:', error);
      return { error, success: false };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) throw error;

      // Criar entrada na tabela de usuários
      if (data.user) {
        const { error: profileError } = await supabase
          .from('usuarios')
          .insert([
            {
              id: data.user.id,
              email: email,
              nome: name,
              role: 'USER',
              ativo: true,
            },
          ]);

        if (profileError) throw profileError;
      }
      
      return { error: null, success: true };
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return { error, success: false };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== 'undefined' 
          ? `${window.location.origin}/auth/nova-senha`
          : undefined,
      });

      if (error) throw error;
      
      return { error: null, success: true };
    } catch (error) {
      console.error('Erro na recuperação de senha:', error);
      return { error, success: false };
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};