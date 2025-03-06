// utils/conversao.ts
import convert from 'convert-units';

export const unidadesMedida = [
  { valor: 'g', nome: 'Gramas' },
  { valor: 'kg', nome: 'Quilogramas' },
  { valor: 'mg', nome: 'Miligramas' },
  { valor: 'oz', nome: 'Onças' },
  { valor: 'lb', nome: 'Libras' },
  { valor: 'ml', nome: 'Mililitros' },
  { valor: 'l', nome: 'Litros' },
  { valor: 'unidade', nome: 'Unidade' },
  { valor: 'pacote', nome: 'Pacote' },
  { valor: 'caixa', nome: 'Caixa' },
];

export const converterUnidade = (
  valor: number,
  unidadeOrigem: string,
  unidadeDestino: string
): number => {
  // Se as unidades forem iguais, retorna o valor original
  if (unidadeOrigem === unidadeDestino) {
    return valor;
  }

  // Se for unidade customizada (não suportada pelo convert-units)
  if (
    ['unidade', 'pacote', 'caixa'].includes(unidadeOrigem) ||
    ['unidade', 'pacote', 'caixa'].includes(unidadeDestino)
  ) {
    throw new Error(
      'Não é possível converter entre unidades customizadas e unidades de medida padrão'
    );
  }

  try {
    return convert(valor).from(unidadeOrigem as any).to(unidadeDestino as any);
  } catch (error) {
    throw new Error(
      `Não foi possível converter de ${unidadeOrigem} para ${unidadeDestino}`
    );
  }
};

export const formatarUnidade = (valor: number, unidade: string): string => {
  if (unidade === 'g' && valor >= 1000) {
    return `${(valor / 1000).toFixed(2)} kg`;
  }
  if (unidade === 'mg' && valor >= 1000) {
    return `${(valor / 1000).toFixed(2)} g`;
  }
  if (unidade === 'ml' && valor >= 1000) {
    return `${(valor / 1000).toFixed(2)} l`;
  }
  
  return `${valor} ${unidade}`;
};