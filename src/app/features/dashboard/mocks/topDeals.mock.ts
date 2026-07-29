// topDeals.mock.ts
//
// Responsabilidade:
// Dado simulado do widget "Tabela" — principais negócios em aberto.

export interface DealRow {
  id: string;
  name: string;
  owner: string;
  value: string;
  stage: string;
}

export function generateTopDeals(): DealRow[] {
  return [
    { id: 'd1', name: 'Contrato Fibra Corp', owner: 'Ana Souza', value: 'R$ 42.000', stage: 'Negociação' },
    { id: 'd2', name: 'Licença Grupo Alfa', owner: 'Bruno Lima', value: 'R$ 28.500', stage: 'Proposta' },
    { id: 'd3', name: 'Expansão Beta Ltda', owner: 'Carla Nunes', value: 'R$ 19.900', stage: 'Qualificação' },
    { id: 'd4', name: 'Renovação Delta SA', owner: 'Diego Alves', value: 'R$ 15.200', stage: 'Fechamento' },
  ];
}
