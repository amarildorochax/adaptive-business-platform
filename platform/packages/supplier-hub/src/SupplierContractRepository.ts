import type { SupplierContract } from './SupplierContract';

/**
 * SupplierContractRepository — contrato de persistência de SupplierContract. Interface apenas —
 * nenhuma implementação é definida por esta Sprint.
 */
export interface SupplierContractRepository {
  create(contract: SupplierContract): Promise<SupplierContract>;
  findById(contractId: string): Promise<SupplierContract | undefined>;
  findBySupplier(supplierId: string): Promise<readonly SupplierContract[]>;
}
