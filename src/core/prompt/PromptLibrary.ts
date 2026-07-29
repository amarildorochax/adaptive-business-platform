/**
 * Contrato de biblioteca de prompts futura (Tarefa 11 — não
 * implementado nesta Sprint).
 *
 * Responsabilidade reservada: agrupar PromptRecord já registrados em
 * coleções nomeadas e compartilháveis (ex.: "Biblioteca de Marketing
 * Q1"). Nenhum componente desta Sprint cria, armazena, ou consulta uma
 * PromptLibrary — `PromptRegistry` permanece uma lista plana.
 */
export interface PromptLibrary {
  id: string;
  name: string;
  description?: string;
  promptRecordIds: string[];
}
