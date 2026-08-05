import type { CreateSupplierCatalogItemInput, CreateSupplierContactInput, CreateSupplierContractInput, CreateSupplierInput } from './SupplierFactory';
import type { Supplier } from './Supplier';
import type { SupplierCatalogItem } from './SupplierCatalogItem';
import { SupplierCatalogService } from './SupplierCatalogService';
import type { SupplierCommand, SupplierCommandType } from './SupplierCommand';
import type { SupplierContract } from './SupplierContract';
import { SupplierContractService } from './SupplierContractService';
import type { SupplierEvent, SupplierEventType } from './SupplierEvent';
import type { SupplierPerformanceRecord } from './SupplierPerformanceRecord';
import { SupplierPerformanceService } from './SupplierPerformanceService';
import { SupplierService } from './SupplierService';

export interface SupplierManagerDependencies {
  readonly suppliers: SupplierService;
  readonly catalog: SupplierCatalogService;
  readonly contracts: SupplierContractService;
  readonly performance: SupplierPerformanceService;
}

/**
 * Resultado de uma operação de SupplierManager — a Entidade produzida, todo Evento consequente já
 * catalogado em `DOMAIN_EVENT_CATALOG.md`, e o Command que a originou. Mesmo formato de
 * `CRMOperationResult`/`FinOperationResult` — `events` fica vazio (nunca `undefined`) para
 * `AddSupplierContact` e `UpdateSupplierCatalogItem`, os dois Commands sem Evento correspondente
 * no catálogo aprovado (ver `SupplierCommand.ts` e `docs/implementation/IMP_201_SUPPLIER_HUB_CORE_REPORT.md`,
 * Capítulo 2) — nunca preenchido com um Evento inventado.
 */
export interface SupplierOperationResult<TEntity> {
  readonly result: TEntity;
  readonly command: SupplierCommand;
  readonly events: readonly SupplierEvent[];
}

/**
 * SupplierManager — a única fachada pública do Supplier Hub (`SUPPLIER_HUB.md`, Capítulo 11).
 * Orquestra os quatro Services do domínio; nenhum consumidor externo acessa `SupplierService`/
 * `SupplierCatalogService`/`SupplierContractService`/`SupplierPerformanceService` diretamente —
 * mesma disciplina "Manager como única fachada" já aplicada por `CRMManager`/`CommerceManager`/
 * `FinanceManager`.
 *
 * Não publica em nenhum Event Bus — `SupplierEvent` é retornado ao chamador, mesmo padrão "Domain
 * Events coletados, despachados pela infraestrutura" já documentado em `CRMManager.ts`, porque
 * nenhuma implementação real de `EventPublisher` existe ainda nesta plataforma.
 */
export class SupplierManager {
  constructor(private readonly deps: SupplierManagerDependencies) {}

  async registerSupplier(input: CreateSupplierInput): Promise<SupplierOperationResult<Supplier>> {
    const supplier = await this.deps.suppliers.register(input);
    return {
      result: supplier,
      command: this.command('RegisterSupplier'),
      events: [this.event('SupplierRegistered', supplier.supplierId)],
    };
  }

  async updateSupplier(
    supplierId: string,
    input: Partial<Pick<Supplier, 'legalName' | 'supplyCategory' | 'taxId'>>,
  ): Promise<SupplierOperationResult<Supplier>> {
    const supplier = await this.deps.suppliers.update(supplierId, input);
    return {
      result: supplier,
      command: this.command('UpdateSupplier'),
      events: [this.event('SupplierUpdated', supplier.supplierId)],
    };
  }

  async disableSupplier(supplierId: string): Promise<SupplierOperationResult<Supplier>> {
    const supplier = await this.deps.suppliers.disable(supplierId);
    return {
      result: supplier,
      command: this.command('DisableSupplier'),
      events: [this.event('SupplierDisabled', supplier.supplierId)],
    };
  }

  async reactivateSupplier(supplierId: string): Promise<SupplierOperationResult<Supplier>> {
    const supplier = await this.deps.suppliers.reactivate(supplierId);
    return {
      result: supplier,
      command: this.command('ReactivateSupplier'),
      events: [this.event('SupplierReactivated', supplier.supplierId)],
    };
  }

  /**
   * `AddSupplierContact` não possui Evento correspondente em `DOMAIN_EVENT_CATALOG.md` —
   * incompletude documentada, `events` retorna vazio, nunca preenchido com um Evento inventado
   * (per instrução explícita de IMP-201: "Não criar eventos adicionais").
   */
  async addSupplierContact(
    supplierId: string,
    input: Omit<CreateSupplierContactInput, 'supplierId'>,
  ): Promise<SupplierOperationResult<Supplier>> {
    const supplier = await this.deps.suppliers.addContact(supplierId, input);
    return {
      result: supplier,
      command: this.command('AddSupplierContact'),
      events: [],
    };
  }

  async registerSupplierCatalogItem(
    input: CreateSupplierCatalogItemInput,
  ): Promise<SupplierOperationResult<SupplierCatalogItem>> {
    const item = await this.deps.catalog.register(input);
    return {
      result: item,
      command: this.command('RegisterSupplierCatalogItem'),
      events: [this.event('SupplierCatalogItemRegistered', item.supplierId)],
    };
  }

  /**
   * `UpdateSupplierCatalogItem` não possui Evento correspondente em `DOMAIN_EVENT_CATALOG.md` —
   * mesma incompletude documentada acima.
   */
  async updateSupplierCatalogItem(
    catalogItemId: string,
    input: Partial<Pick<SupplierCatalogItem, 'listPrice' | 'leadTimeInDays' | 'minimumOrderQuantity'>>,
  ): Promise<SupplierOperationResult<SupplierCatalogItem>> {
    const item = await this.deps.catalog.update(catalogItemId, input);
    return {
      result: item,
      command: this.command('UpdateSupplierCatalogItem'),
      events: [],
    };
  }

  async createSupplierContract(
    input: CreateSupplierContractInput,
  ): Promise<SupplierOperationResult<SupplierContract>> {
    const contract = await this.deps.contracts.create(input);
    return {
      result: contract,
      command: this.command('CreateSupplierContract'),
      events: [this.event('SupplierContractCreated', contract.supplierId)],
    };
  }

  /**
   * Deriva um ou mais `SupplierPerformanceRecord` a partir da comparação entre o prometido e o
   * efetivamente recebido — o único caminho de criação legítimo per ADR-SU-002
   * (`SUPPLIER_HUB.md`), nunca um registro manual e subjetivo.
   */
  async recordSupplierPerformance(input: {
    readonly supplierId: string;
    readonly tenantId: string;
    readonly purchaseOrderId: string;
    readonly promisedAt: Date;
    readonly receivedAt: Date;
    readonly quantityOrdered: number;
    readonly quantityReceived: number;
  }): Promise<SupplierOperationResult<readonly SupplierPerformanceRecord[]>> {
    const records = await this.deps.performance.recordFromReceiving(input);
    return {
      result: records,
      command: this.command('RecordSupplierPerformance'),
      events: records.map(() => this.event('SupplierPerformanceRecorded', input.supplierId)),
    };
  }

  async getSupplier(supplierId: string): Promise<Supplier | undefined> {
    return this.deps.suppliers.get(supplierId);
  }

  async listActiveSuppliers(tenantId: string): Promise<readonly Supplier[]> {
    return this.deps.suppliers.listActive(tenantId);
  }

  private command(type: SupplierCommandType): SupplierCommand {
    return { operationId: crypto.randomUUID(), type, requestedAt: new Date() };
  }

  private event(type: SupplierEventType, supplierId: string): SupplierEvent {
    return { eventId: crypto.randomUUID(), type, supplierId, occurredAt: new Date() };
  }
}
