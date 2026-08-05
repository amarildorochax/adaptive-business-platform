import type { TaxRecord } from './TaxRecord';
import type { TaxRecordRepository } from './TaxRecordRepository';

/**
 * TaxRecordService — nenhum precedente legado foi encontrado. Registra tributo em nível de domínio,
 * sem assumir jurisdição fiscal específica (`TaxRecord.ts`, doc-comment) — nunca emite nota fiscal,
 * fora do escopo desta Sprint. Nenhuma emissão de Evento aqui — nenhum Evento aprovado cobre Tax
 * Record (ver relatório desta Sprint).
 */
export class TaxRecordService {
  constructor(private readonly repository: TaxRecordRepository) {}

  async register(transactionId: string, amount: number): Promise<TaxRecord> {
    const taxRecord: TaxRecord = { taxRecordId: crypto.randomUUID(), transactionId, amount };
    return this.repository.create(taxRecord);
  }

  async list(transactionId: string): Promise<readonly TaxRecord[]> {
    return this.repository.list(transactionId);
  }
}
