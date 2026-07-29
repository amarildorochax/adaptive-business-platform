/**
 * Skill Tool Association — o registro de que uma Skill, ao preparar sua execução, associou-se a uma ou
 * mais Ferramentas já registradas (Component 22), através de identificador opaco, sem redefinir
 * `SkillDefinition` (Component 21) nem `ToolIdentity`/`ToolDefinition` (Component 22).
 * Mesma forma já usada por `SkillCapability` (Skill → Capabilities), reaplicada aqui para Skill →
 * Tools; nenhum artefato já aprovado de Tool Runtime referenciava `skillId` antes desta integração.
 * Artefato de integração INT-08, fixado em `AI_CORE_INTEGRATION_ARCHITECTURE.md`, Seção 6, e
 * `AI_CORE_INTEGRATION_IMPLEMENTATION_BACKLOG.md`, item INT-08.
 */
export interface SkillToolAssociation {
  /** Skill que se associa às Ferramentas. */
  readonly skillId: string;

  /** Ferramentas associadas — identificadores opacos, sem redefinir ToolIdentity/ToolDefinition (Component 22). */
  readonly toolIds: readonly string[];

  /** Momento da associação. */
  readonly associatedAt: Date;
}
