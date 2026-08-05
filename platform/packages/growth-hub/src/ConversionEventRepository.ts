import type { ConversionEvent } from './ConversionEvent';

/**
 * Contrato de persistência de Conversion Event — apenas o contrato, per Etapa 7 (IMP-005). Nunca
 * declara `update` nem `remove`: "uma vez registrado, nunca é removido ou alterado" (`ConversionEvent`,
 * próprio doc-comment), regra de negócio `ConversionsPreserveHistory` (`GrowthBusinessRule.ts`)
 * enforçada estruturalmente por este contrato, não apenas por convenção.
 */
export interface ConversionEventRepository {
  create(conversionEvent: ConversionEvent): Promise<ConversionEvent>;
  get(conversionEventId: string): Promise<ConversionEvent | undefined>;
  listByGoal(conversionGoalId: string): Promise<ConversionEvent[]>;
}
