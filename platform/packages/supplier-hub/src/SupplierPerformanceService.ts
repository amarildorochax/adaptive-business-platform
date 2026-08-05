import {
  SupplierFactory,
  type CreateSupplierPerformanceRecordInput,
} from './SupplierFactory';
import type { SupplierPerformanceRecord } from './SupplierPerformanceRecord';
import type { SupplierPerformanceRepository } from './SupplierPerformanceRepository';

/**
 * SupplierPerformanceService — consome fato observado no Purchase Hub (`PurchaseReceived`/
 * `PurchasePartiallyReceived`) e produz `SupplierPerformanceRecord` (`SUPPLIER_HUB.md`, Capítulo
 * 10). `@abp/purchase-hub` não existe ainda nesta Fase (IMP-201 é exclusivamente Supplier Hub) —
 * `recordFromReceiving` aceita, portanto, parâmetros primitivos já correlacionados
 * (`purchaseOrderId`, datas, quantidades) em vez de um objeto de Evento literal `PurchaseReceived`;
 * a consumação real de Evento entre pacotes é trabalho de uma Sprint futura de integração,
 * documentado como decisão em `docs/implementation/IMP_201_SUPPLIER_HUB_CORE_REPORT.md`, Capítulo 3.
 * Todo registro é imutável assim que criado (`SupplierPerformanceRepository.append`) — nenhum
 * método de atualização existe neste Service.
 */
export class SupplierPerformanceService {
  private readonly factory = new SupplierFactory();

  constructor(private readonly repository: SupplierPerformanceRepository) {}

  async record(input: CreateSupplierPerformanceRecordInput): Promise<SupplierPerformanceRecord> {
    const record = this.factory.createSupplierPerformanceRecord(input);
    return this.repository.append(record);
  }

  /**
   * Deriva o tipo de observação comparando data/quantidade prometida versus efetivamente
   * observada — a mesma comparação que `SUPPLIER_HUB.md`, Capítulo 10, descreve como automática,
   * "nunca requer input manual para o registro básico".
   */
  async recordFromReceiving(input: {
    readonly supplierId: string;
    readonly tenantId: string;
    readonly purchaseOrderId: string;
    readonly promisedAt: Date;
    readonly receivedAt: Date;
    readonly quantityOrdered: number;
    readonly quantityReceived: number;
  }): Promise<readonly SupplierPerformanceRecord[]> {
    const records: SupplierPerformanceRecord[] = [];

    const deliveryRecord = await this.record({
      supplierId: input.supplierId,
      tenantId: input.tenantId,
      purchaseOrderId: input.purchaseOrderId,
      observationType: input.receivedAt <= input.promisedAt ? 'OnTimeDelivery' : 'LateDelivery',
      observedAt: input.receivedAt,
    });
    records.push(deliveryRecord);

    const quantityRecord = await this.record({
      supplierId: input.supplierId,
      tenantId: input.tenantId,
      purchaseOrderId: input.purchaseOrderId,
      observationType:
        input.quantityReceived === input.quantityOrdered ? 'QuantityMatch' : 'QuantityMismatch',
      observedAt: input.receivedAt,
    });
    records.push(quantityRecord);

    return records;
  }

  async listBySupplier(supplierId: string): Promise<readonly SupplierPerformanceRecord[]> {
    return this.repository.findBySupplier(supplierId);
  }
}
