# Feature: Automation

Ponto de extensão reservado para a UI do Automation Center.

Quando implementada, deverá consumir exclusivamente a fachada pública
`automation` de `@/core/automations` (nome do módulo no plural — ver
nota histórica em `AutomationService.ts` sobre a coexistência com o
diretório legado `src/core/automation`, singular). Nenhum componente
visual deve ser criado aqui — apenas composição de telas a partir de
`@/design-system` + `@/core/automations`.

Intencionalmente vazio até a Sprint que conectar esta feature.
