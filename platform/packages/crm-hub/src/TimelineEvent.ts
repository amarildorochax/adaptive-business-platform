/**
 * Timeline Event — a unidade individual que compõe a Timeline de um Relationship; toda Activity
 * concluída, toda mudança de Stage, todo Task criado produz um Timeline Event. Imutável por
 * construção — nenhum campo deste artefato é alterável após criação (Blueprint, ADR-006).
 * Estrutura definida em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface TimelineEvent {
  /** Identificador do Timeline Event. */
  readonly timelineEventId: string;

  /** Tenant ao qual o Timeline Event pertence. */
  readonly tenantId: string;

  /** Relationship ao qual este Timeline Event pertence. */
  readonly relationshipId: string;

  /** Descrição do que este Timeline Event registra. */
  readonly description: string;

  /** Momento em que o fato registrado ocorreu. */
  readonly occurredAt: Date;
}
