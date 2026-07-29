# Feature: Execution

Ponto de extensão reservado para a UI de Execution Orchestration.

Quando implementada, deverá consumir exclusivamente as fachadas
públicas de `@/core/execution`, `@/core/execution-scheduling` e
`@/core/execution-engine` (todos excluídos do barrel de topo `@/core`
por colisão de nome — importar sempre via caminho profundo). Nenhum
componente visual deve ser criado aqui — apenas composição de telas a
partir de `@/design-system` + os módulos de execução do Core.

Intencionalmente vazio até a Sprint que conectar esta feature.
