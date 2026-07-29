/**
 * Categorias de conhecimento institucional já previstas pelo Knowledge
 * Base (Tarefa 04/05). Distinto de `MemoryCategory`
 * (`@/core/memory/MemoryCategory.ts`, inalterada) — Knowledge Base
 * representa conhecimento **permanente** (produtos, serviços, FAQ,
 * manuais, processos, políticas, scripts, treinamentos); Business
 * Memory representa memória **operacional** (contexto de curto prazo
 * usado por ContextBuilder). As duas taxonomias são deliberadamente
 * paralelas, nunca compartilhadas — ver KnowledgeProvider.ts para o
 * único ponto de integração planejado entre as duas.
 */
export enum KnowledgeCategory {
  BUSINESS = "business",
  PRODUCT = "product",
  SERVICE = "service",
  CUSTOMER = "customer",
  MARKETING = "marketing",
  SALES = "sales",
  FINANCE = "finance",
  SEO = "seo",
  SUPPORT = "support",
  WORKFLOW = "workflow",
  SYSTEM = "system",
  GENERAL = "general",
}
