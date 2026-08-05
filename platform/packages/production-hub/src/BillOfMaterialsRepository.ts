import type { BillOfMaterials } from './BillOfMaterials';

/**
 * BillOfMaterialsRepository — contrato de persistência de BillOfMaterials, especificado literalmente
 * por `PRODUCTION_HUB.md`, Capítulo 9. Interface apenas — nenhuma implementação (SQLite, in-memory de
 * produção) é definida por esta Sprint; persistência é escopo de uma Sprint futura (IMP-502).
 *
 * LIMITAÇÃO HERDADA DA ARQUITETURA (documentada, per instrução desta Sprint — "Nunca corrigir
 * silenciosamente"): `findActiveByProduct`/`findById` são especificados literalmente pelo Capítulo 9
 * apenas com `outputProductId`/`id`, sem `tenantId` — mesma disciplina já aplicada por
 * `StockMovementRepository.findByProduct` (`packages/inventory-movement-hub/src/testing/InMemoryFakes.ts`,
 * nota de limitação: "implementa o contrato exatamente como especificado, nunca adiciona um parâmetro
 * não previsto pela arquitetura"). Isolamento entre Tenants para estas consultas é responsabilidade de
 * uma Sprint futura de Persistência, nunca resolvido silenciosamente adicionando um parâmetro aqui.
 */
export interface BillOfMaterialsRepository {
  findActiveByProduct(outputProductId: string): Promise<BillOfMaterials | undefined>;
  findById(billOfMaterialsId: string): Promise<BillOfMaterials | undefined>;
  save(bom: BillOfMaterials): Promise<BillOfMaterials>;
}
