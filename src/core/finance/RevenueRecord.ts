/**
 * Receita registrada — entidade central de entrada financeira (Tarefa
 * 04). `category` é texto livre (nenhuma taxonomia fixa é imposta nesta
 * Sprint); `currency` é um código livre (ex.: "BRL", "USD"), sem
 * validação de formato.
 */
export interface RevenueRecord {
  id: string;

  description: string;

  category: string;

  amount: number;

  currency: string;

  createdAt: Date;

  metadata: Record<string, unknown>;
}
