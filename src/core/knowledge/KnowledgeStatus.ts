/**
 * Estado de publicação de um KnowledgeDocument — distinto de
 * `MemoryRecord`, que não possui este conceito (Business Memory é
 * sempre "ativa" por definição, memória operacional não é
 * "publicada"). Apenas documentos `PUBLISHED` devem ser considerados
 * por KnowledgeSearch/KnowledgeProvider em integrações futuras —
 * nenhum componente desta Sprint ainda filtra por isso (ver
 * "Problemas Encontrados" / "Melhorias Aplicadas" no Relatório Final).
 */
export enum KnowledgeStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}
