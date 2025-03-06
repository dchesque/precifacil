// Versão corrigida para contexts/EmpresaContext.tsx
const criarEmpresa = async (nome: string, cnpj?: string) => {
  try {
    console.log("Iniciando criação de empresa:", { nome, cnpj, userId: user?.id });
    
    // Verificar se usuário está autenticado
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    
    // 1. Inserir nova empresa
    console.log("Inserindo empresa no banco de dados");
    const { data: empresaData, error: empresaError } = await supabase
      .from('empresas')
      .insert([{ 
        nome, 
        cnpj: cnpj || null,
        ativo: true 
      }])
      .select()
      .single();

    if (empresaError) {
      console.error("Erro ao criar empresa:", empresaError);
      throw empresaError;
    }
    
    console.log("Empresa criada:", empresaData);

    // 2. Associar usuário à empresa
    console.log("Associando usuário à empresa");
    const { error: associacaoError } = await supabase
      .from('usuario_empresa')
      .insert([{
        usuario_id: user.id,
        empresa_id: empresaData.id,
        role: 'ADMIN'
      }]);

    if (associacaoError) {
      console.error("Erro ao associar usuário à empresa:", associacaoError);
      throw associacaoError;
    }

    // 3. Atualizar estado
    console.log("Atualizando estado");
    const novaEmpresa = {
      id: empresaData.id,
      nome: empresaData.nome,
      cnpj: empresaData.cnpj,
    };
    
    setEmpresas([...empresas, novaEmpresa]);
    setEmpresaAtual(novaEmpresa);
    localStorage.setItem('empresaAtualId', novaEmpresa.id);
    console.log("Processo concluído com sucesso");

    return { error: null };
  } catch (error) {
    console.error('Erro ao criar empresa:', error);
    return { error };
  }
};