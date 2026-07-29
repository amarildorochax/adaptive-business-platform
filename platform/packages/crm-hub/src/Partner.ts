/**
 * Partner — relacionamento de colaboração comercial, com potencial de originar Opportunity conjunta;
 * uma Opportunity originada por um Partner é sempre associada ao Customer final, nunca ao Partner como
 * titular direto (Blueprint, Capítulo 7 e ADR-007).
 * Estrutura definida em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Partner {
  /** Identificador do Partner. */
  readonly partnerId: string;

  /** Tenant ao qual o Partner pertence. */
  readonly tenantId: string;

  /** Relationship que estrutura este Partner — ver Relationship.ts. */
  readonly relationshipId: string;

  /** Momento de criação. */
  readonly createdAt: Date;
}
