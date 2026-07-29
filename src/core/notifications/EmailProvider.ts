/**
 * Contrato futuro (Tarefa 12) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de um provedor real de envio de
 * e-mail — nenhum e-mail é enviado nesta Sprint.
 *
 * Nota de nomenclatura: mesmo nome de `@/core/marketing/EmailProvider`
 * (Sprint 10, também um contrato futuro nunca implementado) —
 * intencional, pedido assim pela Tarefa 12 desta Sprint. Isso colide no
 * barrel de topo (`core/index.ts`), resolvido excluindo `./notifications`
 * do `export *` de lá (ver nota em Notifications.ts) — dentro deste
 * módulo (`@/core/notifications`), o nome permanece correto e sem
 * ambiguidade.
 */
export interface EmailProvider {
  send(to: string, subject: string, body: string): Promise<void>;
}
