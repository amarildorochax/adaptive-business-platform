// index.ts
//
// Responsabilidade:
// Ponto único de exportação dos Contexts de estado visual do Shell —
// Sidebar, Workspace, Navigation e Layout. Nenhum destes Contexts
// armazena regra de negócio ou dado vindo do Core.
//
// Nota (Theme): o Context de tema NÃO é duplicado aqui — reutiliza-se
// `ThemeContext`/`useTheme` já definidos em
// `@/design-system/foundations` (Sprint 26), evitando o mesmo tipo de
// duplicação que o Core já documentou em colisões anteriores.
//
// Nota (nome do hook de navegação): exportado como `useNavigationState`,
// não `useNavigation` — `react-router-dom` já exporta um hook nativo
// `useNavigation()` (estado de transição de dados de rota), com
// significado totalmente diferente. Usar nomes distintos evita qualquer
// ambiguidade de import nos consumidores futuros.

export * from './SidebarContext';
export * from './WorkspaceContext';
export * from './NavigationContext';
export * from './LayoutContext';
