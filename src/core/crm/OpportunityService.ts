import type { Opportunity } from "./Opportunity";
import { OpportunityStore } from "./OpportunityStore";

/** Campos aceitos por `OpportunityService.create()`. */
export type OpportunityInput = Pick<Opportunity, "customerId" | "title" | "value" | "status" | "probability">;

/**
 * Gerenciamento de oportunidades comerciais (Tarefa 12).
 *
 * Stateless em relação a eventos/métricas — isso é responsabilidade de
 * CRMManager.
 *
 * Dependências: OpportunityStore (própria instância).
 *
 * Consumido exclusivamente por CRMManager.
 */
export class OpportunityService {
  private readonly store = new OpportunityStore();

  /** Cria uma nova Opportunity. */
  create(input: OpportunityInput): Opportunity {
    const now = new Date();

    const opportunity: Opportunity = {
      id: crypto.randomUUID(),
      customerId: input.customerId,
      title: input.title,
      value: input.value,
      status: input.status,
      probability: input.probability,
      createdAt: now,
      updatedAt: now,
    };

    this.store.add(opportunity);

    return opportunity;
  }

  /** Atualiza os campos de `input` (parcial) na Opportunity de `id`. Retorna `undefined` se não existir. */
  update(id: string, input: Partial<OpportunityInput>): Opportunity | undefined {
    const existing = this.store.get(id);

    if (!existing) {
      return undefined;
    }

    const updated: Opportunity = {
      ...existing,
      ...input,
      updatedAt: new Date(),
    };

    this.store.add(updated);

    return updated;
  }

  /** Retorna as Opportunity já cadastradas — todas, ou apenas de `customerId` quando informado. */
  list(customerId?: string): Opportunity[] {
    const all = this.store.getAll();

    return customerId === undefined ? all : all.filter((opportunity) => opportunity.customerId === customerId);
  }
}
