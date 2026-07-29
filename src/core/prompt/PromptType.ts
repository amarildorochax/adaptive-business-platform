/**
 * Categorias mínimas de conteúdo de prompt já previstas pelo Prompt
 * Manager (Tarefa 04) — classifica cada PromptRecord, e cada seção
 * assemblada por PromptBuilder.
 *
 * Nota: CONTEXT e MEMORY existem como classificação — o conteúdo real
 * dessas duas seções nunca é buscado por PromptBuilder/PromptManager,
 * apenas por ContextBuilder/BusinessMemory (inalterados nesta Sprint,
 * ver PromptManager.ts).
 */
export enum PromptType {
  SYSTEM = "system",
  USER = "user",
  ASSISTANT = "assistant",
  CONTEXT = "context",
  MEMORY = "memory",
}
