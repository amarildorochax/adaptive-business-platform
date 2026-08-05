import type { ConversionGoal } from './ConversionGoal';

/** Contrato de persistência de Conversion Goal — apenas o contrato, per Etapa 7 (IMP-005). */
export interface ConversionGoalRepository {
  create(conversionGoal: ConversionGoal): Promise<ConversionGoal>;
  get(conversionGoalId: string): Promise<ConversionGoal | undefined>;
  list(): Promise<ConversionGoal[]>;
}
