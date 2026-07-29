// emptyStatePresets.ts
//
// Responsabilidade:
// Padrões oficiais de Empty State (Sprint 29) — título/descrição/ícone
// prontos para os 6 cenários exigidos pelo ESCOPO, consumidos pelo
// componente `EmptyState` (Sprint 26): `<EmptyState {...emptyStatePresets.noData} />`.
// Nenhum destes presets contém dado real — são apenas texto e ícone
// padrão por cenário.

import type { IconName } from '../icons';

export interface EmptyStatePreset {
  title: string;
  description: string;
  icon: IconName;
}

export const emptyStatePresets: Record<
  'noData' | 'error' | 'offline' | 'permissionDenied' | 'noSearchResults' | 'firstAccess',
  EmptyStatePreset
> = {
  noData: {
    title: 'Nada por aqui ainda',
    description: 'Quando houver dados, eles aparecerão nesta área.',
    icon: 'info',
  },
  error: {
    title: 'Algo deu errado',
    description: 'Não foi possível carregar este conteúdo. Tente novamente.',
    icon: 'error',
  },
  offline: {
    title: 'Sem conexão',
    description: 'Verifique sua internet e tente novamente.',
    icon: 'warning',
  },
  permissionDenied: {
    title: 'Acesso restrito',
    description: 'Você não tem permissão para visualizar este conteúdo.',
    icon: 'lock',
  },
  noSearchResults: {
    title: 'Nenhum resultado encontrado',
    description: 'Tente ajustar os termos da busca.',
    icon: 'search',
  },
  firstAccess: {
    title: 'Bem-vindo(a)!',
    description: 'Este é o seu primeiro acesso — comece explorando a plataforma.',
    icon: 'success',
  },
};
