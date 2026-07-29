import type { Interaction } from "./Interaction";
import { InteractionStore } from "./InteractionStore";

/** Campos aceitos por `InteractionService.create()`. */
export type InteractionInput = Pick<Interaction, "customerId" | "type" | "description" | "metadata">;

/**
 * Registro e consulta de Interaction (Tarefa 11).
 *
 * Stateless em relação a eventos/métricas — isso é responsabilidade de
 * CRMManager.
 *
 * Dependências: InteractionStore (própria instância).
 *
 * Consumido exclusivamente por CRMManager.
 */
export class InteractionService {
  private readonly store = new InteractionStore();

  /** Registra uma nova Interaction. */
  create(input: InteractionInput): Interaction {
    const interaction: Interaction = {
      id: crypto.randomUUID(),
      customerId: input.customerId,
      type: input.type,
      description: input.description,
      metadata: input.metadata,
      createdAt: new Date(),
    };

    this.store.add(interaction);

    return interaction;
  }

  /** Retorna as Interaction registradas — todas, ou apenas de `customerId` quando informado. */
  list(customerId?: string): Interaction[] {
    const all = this.store.getAll();

    return customerId === undefined ? all : all.filter((interaction) => interaction.customerId === customerId);
  }
}
