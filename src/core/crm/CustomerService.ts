import type { Customer } from "./Customer";
import { CustomerStore } from "./CustomerStore";

/** Campos aceitos por `CustomerService.create()` — os campos que o chamador de fato decide. */
export type CustomerInput = Pick<Customer, "name" | "email" | "phone" | "status" | "metadata">;

/**
 * Cadastro, atualização, consulta e remoção de Customer (Tarefa 10).
 *
 * Stateless em relação a eventos/métricas — nenhuma dependência de
 * EventBus ou CRMMetrics (isso é responsabilidade de CRMManager, mesmo
 * princípio já usado por CampaignAnalyzer/CustomerSegmentation em
 * `@/core/marketing`, Sprint 10).
 *
 * Dependências: CustomerStore (própria instância — nenhum outro
 * componente deve manter sua própria instância de CustomerStore).
 *
 * Consumido exclusivamente por CRMManager.
 */
export class CustomerService {
  private readonly store = new CustomerStore();

  /** Cria um novo Customer. */
  create(input: CustomerInput): Customer {
    const now = new Date();

    const customer: Customer = {
      id: crypto.randomUUID(),
      name: input.name,
      email: input.email,
      phone: input.phone,
      status: input.status,
      metadata: input.metadata,
      createdAt: now,
      updatedAt: now,
    };

    this.store.add(customer);

    return customer;
  }

  /** Atualiza os campos de `input` (parcial) no Customer de `id`. Retorna `undefined` se não existir. */
  update(id: string, input: Partial<CustomerInput>): Customer | undefined {
    const existing = this.store.get(id);

    if (!existing) {
      return undefined;
    }

    const updated: Customer = {
      ...existing,
      ...input,
      updatedAt: new Date(),
    };

    this.store.add(updated);

    return updated;
  }

  /** Remove o Customer de `id`. Retorna `false` se não existir. */
  remove(id: string): boolean {
    return this.store.remove(id);
  }

  /** Retorna o Customer de `id`, ou `undefined` se não existir. */
  get(id: string): Customer | undefined {
    return this.store.get(id);
  }

  /** Retorna todos os Customer já cadastrados. */
  list(): Customer[] {
    return this.store.getAll();
  }
}
