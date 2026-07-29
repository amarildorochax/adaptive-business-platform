/**
 * Categorias de Agent já previstas pela plataforma.
 *
 * Nota de auditoria (Sprint 0A): nenhum Agent além de "blog-agent"
 * (AgentType.BLOG) está registrado hoje — ver registerAgents.ts. Os
 * demais valores são reserva para os próximos Agents.
 */
export enum AgentType {
  BLOG = "blog",
  SEO = "seo",
  PINTEREST = "pinterest",
  INSTAGRAM = "instagram",
  FACEBOOK = "facebook",
  YOUTUBE = "youtube",
  CRM = "crm",
  DESIGN = "design",
  ANALYTICS = "analytics",
  AUTOMATION = "automation",
}
