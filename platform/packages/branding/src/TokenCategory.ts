/**
 * Token Category — as sete categorias de Design Token já enumeradas na tabela do Capítulo 9
 * (`BRANDING_HUB.md`): "Cor", "Tipografia", "Espaçamento", "Borda", "Sombra", "Ícone", "Estado".
 * Deliberadamente uma união fechada — diferente de `Segment`/`Maturity` (`@abp/business-profile`,
 * IMP-018), o Blueprint aqui enumera explicitamente o conjunto completo em tabela, sem nenhuma
 * declaração equivalente a ADR-007 (Business Profile Engine) exigindo extensibilidade em tempo de
 * execução — mesmo critério de "fechado quando o próprio Blueprint já fecha" já aplicado a
 * `KnowledgeType` (IMP-015).
 */
export type TokenCategory = "Cor" | "Tipografia" | "Espaçamento" | "Borda" | "Sombra" | "Ícone" | "Estado";
