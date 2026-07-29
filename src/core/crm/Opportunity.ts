/** Estágio comercial de uma Opportunity. */
export type OpportunityStatus = "open" | "won" | "lost";

/**
 * Oportunidade comercial associada a um Customer (Tarefa 06).
 *
 * `probability` é um número entre 0 e 1 (ex.: 0.25 = 25%) — nenhuma
 * validação de intervalo é aplicada nesta Sprint (Store/Service apenas
 * armazenam o que recebem; regra de negócio sobre `probability` fica
 * reservada a uma Sprint futura de Finance Intelligence, se necessário).
 */
export interface Opportunity {
  id: string;

  customerId: string;

  title: string;

  value: number;

  status: OpportunityStatus;

  probability: number;

  createdAt: Date;

  updatedAt: Date;
}
