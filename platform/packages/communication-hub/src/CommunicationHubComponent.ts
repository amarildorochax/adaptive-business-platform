/**
 * Communication Hub Component — os componentes internos do Communication Hub, organizados em cinco
 * categorias funcionais, mesmo padrão de categorização já usado em `CRM_HUB.md`.
 * Estrutura definida em `COMMUNICATION_HUB.md`, Capítulo 7.
 *
 * Nota de reconciliação: `COMMUNICATION_HUB.md`, Capítulo 7, afirma "trinta e três componentes", mas
 * enumera trinta e quatro subseções nomeadas individualmente, e seu próprio quadro-resumo de
 * categorias lista apenas trinta e dois (omitindo Inbox Manager e Outbox Manager da categoria Gestão
 * de Entidade). Os trinta e quatro componentes explicitamente descritos, um a um, no corpo do
 * capítulo são usados aqui como catálogo — mesmo critério de resolução já aplicado em
 * `COMPONENT_18_AGENT_FRAMEWORK_DESIGN.md` (sete vs. nove) durante a Sprint 4: a enumeração explícita
 * prevalece sobre a contagem agregada em prosa.
 */
export type CommunicationHubComponent =
  // Orquestração
  | "Communication Manager"
  // Gestão de Entidade
  | "Conversation Manager"
  | "Message Manager"
  | "Thread Manager"
  | "Channel Manager"
  | "Channel Account Manager"
  | "Inbox Manager"
  | "Conversation Assignment Manager"
  | "Conversation Status Manager"
  | "Participant Manager"
  | "Preference Manager"
  // Entrega
  | "Outbox Manager"
  | "Delivery Manager"
  | "Delivery Tracking Manager"
  | "Retry Manager"
  | "Queue Manager"
  | "Broadcast Manager"
  | "Notification Manager"
  // Conteúdo e Sinal
  | "Template Manager"
  | "Attachment Manager"
  | "Webhook Manager"
  | "Typing Indicator Manager"
  | "Read Receipt Manager"
  | "Reaction Manager"
  // Suporte Transversal
  | "Policy Manager"
  | "Conversation Search Manager"
  | "Communication Analytics"
  | "History Manager"
  | "Audit Manager"
  | "Lifecycle Manager"
  | "Configuration Manager"
  | "Notification Publisher"
  | "Event Publisher"
  | "Reporting Adapter";
