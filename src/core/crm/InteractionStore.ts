import type { Interaction } from "./Interaction";

/**
 * Armazenamento de Interaction — exclusivamente em memória (`Map`),
 * indexado por `id` (Tarefa 08). Mesmo padrão de CustomerStore.
 *
 * Consumido exclusivamente por InteractionService.
 */
export class InteractionStore {
  private interactions = new Map<string, Interaction>();

  /** Adiciona (ou substitui, se já existir o mesmo `id`) uma Interaction. */
  add(interaction: Interaction): void {
    this.interactions.set(interaction.id, interaction);
  }

  /** Retorna a Interaction de `id`, ou `undefined` se não existir. */
  get(id: string): Interaction | undefined {
    return this.interactions.get(id);
  }

  /** Retorna todas as Interaction já armazenadas. */
  getAll(): Interaction[] {
    return Array.from(this.interactions.values());
  }

  /** Remove a Interaction de `id`. Retorna `false` se não existir. */
  remove(id: string): boolean {
    return this.interactions.delete(id);
  }

  /** Remove todas as Interaction. */
  clear(): void {
    this.interactions.clear();
  }

  /** Quantidade total de Interaction armazenadas. */
  count(): number {
    return this.interactions.size;
  }
}
