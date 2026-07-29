import type { WorkflowDefinition } from "./WorkflowDefinition";
import type { WorkflowStep } from "./WorkflowStep";
import { WorkflowStatus } from "./WorkflowStatus";

/** Campos aceitos por `WorkflowRegistry.register()` quando o chamador cria uma WorkflowDefinition nova, sem `id` explícito. */
export type WorkflowDefinitionInput = Pick<WorkflowDefinition, "name" | "description" | "steps" | "metadata">;

function step(order: number, action: string, input: string): WorkflowStep {
  return {
    id: crypto.randomUUID(),
    order,
    agentId: "blog-agent",
    action,
    input,
    status: WorkflowStatus.PENDING,
  };
}

/**
 * Registro central de WorkflowDefinition, indexado por `id` (Tarefa
 * 04) — mesmo papel que PromptRegistry cumpre para PromptRecord.
 *
 * Responsabilidade: registrar, remover, localizar, listar, e atualizar
 * WorkflowDefinition — nenhuma lógica de planejamento ou de execução
 * vive aqui.
 *
 * Seed inicial (construtor, Tarefa 10): `"workflow-article-production"`
 * — "Produção de Artigo" (Pesquisar → Escrever → Revisar), as três
 * etapas usando `agentId: "blog-agent"` (único Agent real hoje). Existe
 * exclusivamente para validar a infraestrutura de ponta a ponta — não
 * introduz nenhum Agent novo.
 *
 * Dependências: WorkflowDefinition/WorkflowStep (tipos).
 *
 * Consumido exclusivamente por WorkflowEngine — nenhum outro componente
 * deve manter sua própria instância de WorkflowRegistry.
 */
export class WorkflowRegistry {
  private definitions = new Map<string, WorkflowDefinition>();

  constructor() {
    this.seed();
  }

  private seed(): void {
    const now = new Date();

    const articleProduction: WorkflowDefinition = {
      id: "workflow-article-production",
      name: "Produção de Artigo",
      description: "Pesquisar, escrever, e revisar um artigo de blog — as três etapas usam o BlogAgent nesta Sprint.",
      version: 1,
      steps: [
        step(0, "Pesquisar", "Pesquise e liste os pontos principais sobre o tema do artigo."),
        step(1, "Escrever", "Escreva o artigo completo em Markdown com base na pesquisa."),
        step(2, "Revisar", "Revise o artigo já escrito, corrigindo clareza e tom."),
      ],
      metadata: {},
      createdAt: now,
      updatedAt: now,
    };

    this.definitions.set(articleProduction.id, articleProduction);
  }

  /** Cria e registra uma nova WorkflowDefinition — `version` inicia em 1. */
  register(input: WorkflowDefinitionInput): WorkflowDefinition {
    const now = new Date();

    const definition: WorkflowDefinition = {
      id: crypto.randomUUID(),
      name: input.name,
      description: input.description,
      version: 1,
      steps: input.steps,
      metadata: input.metadata,
      createdAt: now,
      updatedAt: now,
    };

    this.definitions.set(definition.id, definition);

    return definition;
  }

  /** Remove a WorkflowDefinition de `id`. Retorna `false` se não existir. */
  unregister(id: string): boolean {
    return this.definitions.delete(id);
  }

  /** Localiza a WorkflowDefinition de `id`, ou `undefined` se não existir. */
  get(id: string): WorkflowDefinition | undefined {
    return this.definitions.get(id);
  }

  /** Retorna todas as WorkflowDefinition já registradas (inclui o seed). */
  list(): WorkflowDefinition[] {
    return Array.from(this.definitions.values());
  }

  /**
   * Atualiza os campos de `input` (parcial) na WorkflowDefinition de
   * `id`, incrementando `version` e `updatedAt`. Retorna `undefined` se
   * o registro não existir.
   */
  update(id: string, input: Partial<WorkflowDefinitionInput>): WorkflowDefinition | undefined {
    const existing = this.definitions.get(id);

    if (!existing) {
      return undefined;
    }

    const updated: WorkflowDefinition = {
      ...existing,
      ...input,
      version: existing.version + 1,
      updatedAt: new Date(),
    };

    this.definitions.set(id, updated);

    return updated;
  }
}
