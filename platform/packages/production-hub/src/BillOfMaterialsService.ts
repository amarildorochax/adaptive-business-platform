import type { BillOfMaterials } from './BillOfMaterials';
import type { BillOfMaterialsRepository } from './BillOfMaterialsRepository';
import { BillOfMaterialsNotFoundError } from './ProductionDomainError';
import { ProductionFactory, type CreateBillOfMaterialsInput } from './ProductionFactory';
import { ProductionValidator } from './ProductionValidator';
import type { BOMLine } from './BOMLine';

export interface SupersedeBillOfMaterialsInput {
  readonly lines: readonly BOMLine[];
}

export interface SupersedeBillOfMaterialsResult {
  readonly previous: BillOfMaterials;
  readonly next: BillOfMaterials;
}

/**
 * BillOfMaterialsService — "encapsula versionamento: toda alteração de composição cria uma nova
 * versão, nunca edita a existente" (`PRODUCTION_HUB.md`, Capítulo 10). Um dos dois Services
 * explicitamente nomeados por aquele documento.
 */
export class BillOfMaterialsService {
  private readonly factory = new ProductionFactory();
  private readonly validator = new ProductionValidator();

  constructor(private readonly repository: BillOfMaterialsRepository) {}

  async create(input: CreateBillOfMaterialsInput): Promise<BillOfMaterials> {
    for (const line of input.lines) {
      this.validator.ensureValidBOMLine(line);
    }

    const bom = this.factory.createBillOfMaterials(input);
    return this.repository.save(bom);
  }

  /**
   * "Nova versão de Bill of Materials para o mesmo Produto nunca sobrescreve a anterior, é uma nova
   * instância versionada" (`PRODUCTION_HUB.md`, Capítulo 4/ADR-PD-002) — marca a versão corrente como
   * `Superseded` e cria a versão seguinte como `Active`, nunca edita a existente in-place.
   */
  async supersede(billOfMaterialsId: string, input: SupersedeBillOfMaterialsInput): Promise<SupersedeBillOfMaterialsResult> {
    const existing = await this.getOrThrow(billOfMaterialsId);
    this.validator.ensureBillOfMaterialsActive(existing.billOfMaterialsId, existing.status);

    for (const line of input.lines) {
      this.validator.ensureValidBOMLine(line);
    }

    const previous = await this.repository.save({
      ...existing,
      status: 'Superseded',
      supersededAt: new Date(),
    });

    const next = await this.repository.save(
      this.factory.createBillOfMaterials({
        tenantId: existing.tenantId,
        outputProductId: existing.outputProductId,
        lines: input.lines,
        version: existing.version + 1,
      }),
    );

    return { previous, next };
  }

  async getById(billOfMaterialsId: string): Promise<BillOfMaterials | undefined> {
    return this.repository.findById(billOfMaterialsId);
  }

  async getActiveForProduct(outputProductId: string): Promise<BillOfMaterials | undefined> {
    return this.repository.findActiveByProduct(outputProductId);
  }

  private async getOrThrow(billOfMaterialsId: string): Promise<BillOfMaterials> {
    const existing = await this.repository.findById(billOfMaterialsId);

    if (!existing) {
      throw new BillOfMaterialsNotFoundError(billOfMaterialsId);
    }

    return existing;
  }
}
