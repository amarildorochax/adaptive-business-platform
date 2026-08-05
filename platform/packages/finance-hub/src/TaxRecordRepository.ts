import type { TaxRecord } from './TaxRecord';

/** Contrato de persistência de Tax Record — apenas o contrato, per Etapa 7. */
export interface TaxRecordRepository {
  create(taxRecord: TaxRecord): Promise<TaxRecord>;
  list(transactionId: string): Promise<TaxRecord[]>;
}
