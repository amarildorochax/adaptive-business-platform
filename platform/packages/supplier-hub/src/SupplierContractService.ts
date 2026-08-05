import { SupplierFactory, type CreateSupplierContractInput } from './SupplierFactory';
import type { SupplierContract } from './SupplierContract';
import type { SupplierContractRepository } from './SupplierContractRepository';

/**
 * SupplierContractService — ciclo de vida de `SupplierContract`. `SUPPLIER_HUB.md`, Capítulo 10,
 * não nomeia este Service explicitamente (apenas SupplierCatalogService e SupplierPerformanceService),
 * mas `SupplierContract` possui Repository Interface própria (Capítulo 9) e Command/Evento
 * próprios (`CreateSupplierContract`/`SupplierContractCreated`) — exige, portanto, um Service
 * dedicado pela mesma disciplina de responsabilidade única já aplicada aos demais; documentado em
 * `docs/implementation/IMP_201_SUPPLIER_HUB_CORE_REPORT.md`, Capítulo 3.
 */
export class SupplierContractService {
  private readonly factory = new SupplierFactory();

  constructor(private readonly repository: SupplierContractRepository) {}

  async create(input: CreateSupplierContractInput): Promise<SupplierContract> {
    const contract = this.factory.createSupplierContract(input);
    return this.repository.create(contract);
  }

  async listBySupplier(supplierId: string): Promise<readonly SupplierContract[]> {
    return this.repository.findBySupplier(supplierId);
  }
}
