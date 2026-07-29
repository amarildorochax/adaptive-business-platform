import type { Opportunity } from "./Opportunity";

/**
 * Armazenamento de Opportunity — exclusivamente em memória (`Map`),
 * indexado por `id` (Tarefa 09). Mesmo padrão de CustomerStore.
 *
 * Consumido exclusivamente por OpportunityService.
 */
export class OpportunityStore {
  private opportunities = new Map<string, Opportunity>();

  /** Adiciona (ou substitui, se já existir o mesmo `id`) uma Opportunity. */
  add(opportunity: Opportunity): void {
    this.opportunities.set(opportunity.id, opportunity);
  }

  /** Retorna a Opportunity de `id`, ou `undefined` se não existir. */
  get(id: string): Opportunity | undefined {
    return this.opportunities.get(id);
  }

  /** Retorna todas as Opportunity já armazenadas. */
  getAll(): Opportunity[] {
    return Array.from(this.opportunities.values());
  }

  /** Remove a Opportunity de `id`. Retorna `false` se não existir. */
  remove(id: string): boolean {
    return this.opportunities.delete(id);
  }

  /** Remove todas as Opportunity. */
  clear(): void {
    this.opportunities.clear();
  }

  /** Quantidade total de Opportunity armazenadas. */
  count(): number {
    return this.opportunities.size;
  }
}
