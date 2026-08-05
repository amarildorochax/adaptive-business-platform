import type { SupplierContract, SupplierContractRepository } from "@abp/supplier-hub";
import type { DatabaseSync } from "node:sqlite";
import { fromMs, fromMsOrUndefined, orNull, orUndefined, toMs, toMsOrNull } from "../../db/sqlUtil.js";

interface Row {
  contract_id: string;
  supplier_id: string;
  tenant_id: string;
  starts_at: number;
  ends_at: number | null;
  payment_terms_due_in_days: number;
  minimum_volume: number | null;
  created_at: number;
}

/** Implementação real de `SupplierContractRepository`. Sem `update` — o contrato da Interface não
 * exige um, mesma disciplina já aplicada a `TimelineEventRepository`/`ContactRepository` (CRM Hub)
 * para Entidades imutáveis após criação. */
export class SqliteSupplierContractRepository implements SupplierContractRepository {
  constructor(private readonly db: DatabaseSync) {}

  async create(contract: SupplierContract): Promise<SupplierContract> {
    this.db
      .prepare(
        "INSERT INTO supplier_contracts (contract_id, supplier_id, tenant_id, starts_at, ends_at, payment_terms_due_in_days, minimum_volume, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        contract.contractId,
        contract.supplierId,
        contract.tenantId,
        toMs(contract.startsAt),
        toMsOrNull(contract.endsAt),
        contract.paymentTerms.dueInDays,
        orNull(contract.minimumVolume),
        toMs(contract.createdAt),
      );
    return contract;
  }

  async findById(contractId: string): Promise<SupplierContract | undefined> {
    const row = this.db.prepare("SELECT * FROM supplier_contracts WHERE contract_id = ?").get(contractId) as unknown as Row | undefined;
    return row ? toContract(row) : undefined;
  }

  async findBySupplier(supplierId: string): Promise<readonly SupplierContract[]> {
    const rows = this.db.prepare("SELECT * FROM supplier_contracts WHERE supplier_id = ?").all(supplierId) as unknown as Row[];
    return rows.map(toContract);
  }
}

function toContract(row: Row): SupplierContract {
  return {
    contractId: row.contract_id,
    supplierId: row.supplier_id,
    tenantId: row.tenant_id,
    startsAt: fromMs(row.starts_at),
    endsAt: fromMsOrUndefined(row.ends_at),
    paymentTerms: { dueInDays: row.payment_terms_due_in_days },
    minimumVolume: orUndefined(row.minimum_volume),
    createdAt: fromMs(row.created_at),
  };
}
