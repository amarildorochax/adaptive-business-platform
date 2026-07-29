/**
 * Estado de um DashboardWidget no momento em que foi construído — nunca
 * uma avaliação de saúde do subsistema em si (isso já existe, quando
 * aplicável, em cada subsistema — ex.: `AgentHealth`,
 * `@/core/catalog`). `OK` significa apenas "os dados foram obtidos com
 * sucesso via API pública", `EMPTY` que a consulta teve sucesso mas não
 * retornou nada, e `UNAVAILABLE` que a fonte ainda não emitiu nenhum
 * dado observável (ex.: RuntimeWidget antes de qualquer evento de boot
 * ter sido observado).
 */
export enum DashboardWidgetStatus {
  OK = "ok",
  EMPTY = "empty",
  UNAVAILABLE = "unavailable",
}
