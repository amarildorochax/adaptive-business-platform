import type { Customer } from "./Customer";

/**
 * Armazenamento de Customer — exclusivamente em memória (`Map`),
 * indexado por `id` (Tarefa 07). Sem persistência, sem banco — mesmo
 * padrão já usado por `KnowledgeStore`/`MemoryStore`.
 *
 * Responsabilidade: guardar e recuperar Customer por identificador —
 * nenhuma regra de cadastro/atualização (isso é responsabilidade de
 * CustomerService) e nenhuma emissão de evento (isso é responsabilidade
 * de CRMManager).
 *
 * `CRMPersistenceAdapter.ts` (Tarefa 15) já reserva o contrato para um
 * backend real futuro — este Store nunca o referencia nesta Sprint.
 *
 * Consumido exclusivamente por CustomerService.
 */
export class CustomerStore {
  private customers = new Map<string, Customer>();

  /** Adiciona (ou substitui, se já existir o mesmo `id`) um Customer. */
  add(customer: Customer): void {
    this.customers.set(customer.id, customer);
  }

  /** Retorna o Customer de `id`, ou `undefined` se não existir. */
  get(id: string): Customer | undefined {
    return this.customers.get(id);
  }

  /** Retorna todos os Customer já armazenados. */
  getAll(): Customer[] {
    return Array.from(this.customers.values());
  }

  /** Remove o Customer de `id`. Retorna `false` se não existir. */
  remove(id: string): boolean {
    return this.customers.delete(id);
  }

  /** Remove todos os Customer. */
  clear(): void {
    this.customers.clear();
  }

  /** Quantidade total de Customer armazenados. */
  count(): number {
    return this.customers.size;
  }
}
