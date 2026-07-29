# Feature: Notifications

Ponto de extensão reservado para a UI do Notification Hub de negócio.

Quando implementada, deverá consumir exclusivamente a fachada pública
`notifications` de `@/core/notifications` (excluído do barrel de topo
`@/core` por colisão de nome — importar sempre via caminho profundo).

**Não confundir** com `@/app/providers/NotificationProvider` (Sprint 27)
— aquele é estado de UI puramente efêmero/local (toasts e feed in-app),
sem qualquer relação com o domínio de negócio do Notification Hub.
Nenhum componente visual deve ser criado aqui — apenas composição de
telas a partir de `@/design-system` + `@/core/notifications`.

Intencionalmente vazio até a Sprint que conectar esta feature.
