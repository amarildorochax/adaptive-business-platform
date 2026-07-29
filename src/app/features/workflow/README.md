# Feature: Workflow

Ponto de extensão reservado para a UI do Workflow Engine.

Quando implementada, deverá consumir exclusivamente a fachada pública
`workflowEngine` de `@/core/workflow` (módulo excluído do barrel de
topo `@/core` por colisão de nome — ver nota em `core/index.ts`;
importar sempre via caminho profundo `@/core/workflow`). Nenhum
componente visual deve ser criado aqui — apenas composição de telas a
partir de `@/design-system` + `@/core/workflow`.

Intencionalmente vazio até a Sprint que conectar esta feature.
