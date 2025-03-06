// pages/diagnose-empresa.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export default function DiagnoseEmpresa() {
  const [nome, setNome] = useState('JC PLUS SIZE');
  const [cnpj, setCnpj] = useState('');
  const [userId, setUserId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<any>(null);

  useEffect(() => {
    // Verificar a sessão atual ao carregar
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      setCurrentSession(data.session);
      if (data.session?.user) {
        setUserId(data.session.user.id);
      }
    };
    
    checkSession();
  }, []);

  const testarCriarEmpresa = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      // 1. Inserir a empresa
      const { data: empresaData, error: empresaError } = await supabase
        .from('empresas')
        .insert([
          { 
            nome,
            cnpj: cnpj || null
          }
        ])
        .select()
        .single();
      
      if (empresaError) {
        throw {
          step: 'Criar Empresa',
          error: empresaError
        };
      }
      
      // 2. Associar usuário à empresa
      const { error: associacaoError } = await supabase
        .from('usuario_empresa')
        .insert([
          {
            usuario_id: userId,
            empresa_id: empresaData.id,
            role: 'ADMIN'
          }
        ]);
      
      if (associacaoError) {
        throw {
          step: 'Associar Usuário',
          error: associacaoError
        };
      }
      
      setResult({
        success: true,
        empresa: empresaData,
        message: 'Empresa criada com sucesso'
      });
    } catch (err) {
      console.error('Erro ao criar empresa:', err);
      setResult({
        success: false,
        error: err
      });
    } finally {
      setLoading(false);
    }
  };

  const associarUsuarioEmpresa = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      // Obter empresas existentes
      const { data: empresas, error: empresasError } = await supabase
        .from('empresas')
        .select('*');
      
      if (empresasError) throw empresasError;
      
      if (!empresas || empresas.length === 0) {
        throw new Error('Nenhuma empresa encontrada');
      }
      
      // Verificar associações existentes
      const { data: associacoes, error: associacoesError } = await supabase
        .from('usuario_empresa')
        .select('*')
        .eq('usuario_id', userId);
      
      if (associacoesError) throw associacoesError;
      
      // Se já existe associação, apenas mostre
      if (associacoes && associacoes.length > 0) {
        setResult({
          success: true,
          associacoes,
          message: 'Usuário já está associado a empresas'
        });
        return;
      }
      
      // Associar usuário à primeira empresa encontrada
      const { data: novaAssociacao, error: associacaoError } = await supabase
        .from('usuario_empresa')
        .insert([
          {
            usuario_id: userId,
            empresa_id: empresas[0].id,
            role: 'ADMIN'
          }
        ])
        .select();
      
      if (associacaoError) throw associacaoError;
      
      setResult({
        success: true,
        associacao: novaAssociacao,
        message: 'Usuário associado à empresa com sucesso'
      });
    } catch (err) {
      console.error('Erro:', err);
      setResult({
        success: false,
        error: err
      });
    } finally {
      setLoading(false);
    }
  };

  const verificarUsuario = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      // Verificar se o usuário existe na tabela usuarios
      const { data: usuarioData, error: usuarioError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (usuarioError) {
        // Se o usuário não existe, tentar criá-lo
        if (usuarioError.code === 'PGRST116') { // código para "no rows returned"
          // Obter dados do usuário da sessão
          const user = currentSession?.user;
          
          if (!user) {
            throw new Error('Usuário não está autenticado');
          }
          
          // Inserir na tabela usuarios
          const { data: newUser, error: insertError } = await supabase
            .from('usuarios')
            .insert([
              {
                id: user.id,
                email: user.email,
                nome: user.user_metadata?.nome || 'Usuário',
                role: 'USER',
                ativo: true
              }
            ])
            .select();
          
          if (insertError) throw insertError;
          
          setResult({
            success: true,
            usuario: newUser,
            message: 'Usuário criado com sucesso na tabela usuarios'
          });
        } else {
          throw usuarioError;
        }
      } else {
        setResult({
          success: true,
          usuario: usuarioData,
          message: 'Usuário já existe na tabela usuarios'
        });
      }
    } catch (err) {
      console.error('Erro:', err);
      setResult({
        success: false,
        error: err
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Diagnóstico de Criação de Empresa</h1>
        
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Sessão Atual:</h2>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
            {JSON.stringify(currentSession?.user || 'Sem sessão', null, 2)}
          </pre>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            ID do Usuário
          </label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            readOnly={!!currentSession}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Nome da Empresa
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            CNPJ (opcional)
          </label>
          <input
            type="text"
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          />
        </div>

        <div className="flex flex-col space-y-3">
          <button
            onClick={testarCriarEmpresa}
            disabled={loading || !userId}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {loading ? 'Processando...' : 'Testar Criação de Empresa'}
          </button>
          
          <button
            onClick={associarUsuarioEmpresa}
            disabled={loading || !userId}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            Associar Usuário à Empresa Existente
          </button>
          
          <button
            onClick={verificarUsuario}
            disabled={loading || !userId}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            Verificar/Criar Usuário na Tabela
          </button>
        </div>
        
        {result && (
          <div className={`mt-6 p-4 rounded-md ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
            <h2 className="text-lg font-semibold mb-2">
              {result.success ? '✅ Sucesso' : '❌ Erro'}
            </h2>
            <p className="mb-2">{result.message}</p>
            <pre className="bg-white p-3 rounded text-xs overflow-auto max-h-60">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}