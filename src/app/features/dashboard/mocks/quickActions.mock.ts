// quickActions.mock.ts
//
// Responsabilidade:
// Dado simulado do widget "Quick Actions". `onTrigger` é apenas um
// rótulo textual nesta Sprint — nenhuma ação real é executada (nenhuma
// chamada ao Core).

export interface QuickAction {
  id: string;
  label: string;
  description: string;
}

export function generateQuickActions(): QuickAction[] {
  return [
    { id: 'qa1', label: 'Novo negócio', description: 'Registrar um novo negócio no CRM' },
    { id: 'qa2', label: 'Nova campanha', description: 'Criar uma campanha de marketing' },
    { id: 'qa3', label: 'Convidar membro', description: 'Adicionar alguém ao workspace' },
  ];
}
