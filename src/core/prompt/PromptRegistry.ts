import type { PromptRecord } from "./PromptRecord";
import { PromptType } from "./PromptType";
import { PromptTemplateKind, type PromptTemplate } from "./PromptTemplate";
import { eventBus } from "../events/EventBus";
import { EventTypes } from "../events/EventTypes";

/** Campos aceitos por `PromptRegistry.register()` quando o chamador cria um PromptRecord novo, sem `id` explícito. */
export type PromptRecordInput = Pick<PromptRecord, "name" | "type" | "content" | "variables" | "metadata">;

function seedTemplate(
  id: string,
  kind: PromptTemplateKind,
  name: string,
  content: string
): PromptTemplate {
  const now = new Date();

  return {
    id,
    name,
    type: PromptType.SYSTEM,
    kind,
    content,
    variables: [
      { key: "businessName", description: "Nome da empresa ou marca." },
      { key: "tone", description: "Tom de voz desejado." },
    ],
    version: 1,
    metadata: {},
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Registro central de PromptRecord (incluindo PromptTemplate),
 * indexado por `id` (Tarefa 06) — mesmo papel que AgentRegistry cumpre
 * para Agent, e MemoryStore para MemoryRecord.
 *
 * Responsabilidade: registrar, localizar, listar, remover, e atualizar
 * PromptRecord — nenhuma lógica de composição de prompt vive aqui (isso
 * é responsabilidade de PromptBuilder).
 *
 * Seed inicial (construtor): sete PromptTemplate, um por
 * PromptTemplateKind (Blog, CRM, Marketing, Atendimento, Financeiro,
 * SEO, Geral) — ids estáveis (`template-blog`, `template-crm`, etc.),
 * cada um com um System Prompt mínimo e as variáveis `{{businessName}}`/
 * `{{tone}}` já declaradas.
 *
 * Dependências: PromptRecord/PromptTemplate (tipos), EventBus/EventTypes.
 *
 * Consumido exclusivamente por PromptManager — nenhum outro componente
 * deve manter sua própria instância de PromptRegistry.
 */
export class PromptRegistry {
  private records = new Map<string, PromptRecord>();

  constructor() {
    this.seed();
  }

  private seed(): void {
    const templates: PromptTemplate[] = [
      seedTemplate(
        "template-blog",
        PromptTemplateKind.BLOG,
        "Blog — Padrão",
        "Você é um redator especializado em blog para {{businessName}}. Escreva em Markdown, com tom {{tone}}."
      ),
      seedTemplate(
        "template-crm",
        PromptTemplateKind.CRM,
        "CRM — Padrão",
        "Você organiza informações de relacionamento com clientes de {{businessName}}, com tom {{tone}}."
      ),
      seedTemplate(
        "template-marketing",
        PromptTemplateKind.MARKETING,
        "Marketing — Padrão",
        "Você cria conteúdo de marketing para {{businessName}}, com tom {{tone}}."
      ),
      seedTemplate(
        "template-atendimento",
        PromptTemplateKind.SUPPORT,
        "Atendimento — Padrão",
        "Você atende clientes de {{businessName}} com tom {{tone}}, sempre claro e cordial."
      ),
      seedTemplate(
        "template-financeiro",
        PromptTemplateKind.FINANCE,
        "Financeiro — Padrão",
        "Você organiza informações financeiras de {{businessName}} com tom {{tone}}, sempre preciso."
      ),
      seedTemplate(
        "template-seo",
        PromptTemplateKind.SEO,
        "SEO — Padrão",
        "Você otimiza conteúdo para SEO de {{businessName}}, com tom {{tone}}."
      ),
      seedTemplate(
        "template-geral",
        PromptTemplateKind.GENERAL,
        "Geral — Padrão",
        "Você é um assistente de {{businessName}}, com tom {{tone}}."
      ),
    ];

    for (const template of templates) {
      this.records.set(template.id, template);
    }
  }

  /** Cria e registra um novo PromptRecord — `version` inicia em 1. Emite PROMPT_REGISTERED. */
  register(input: PromptRecordInput): PromptRecord {
    const now = new Date();

    const record: PromptRecord = {
      id: crypto.randomUUID(),
      name: input.name,
      type: input.type,
      content: input.content,
      variables: input.variables,
      metadata: input.metadata,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    this.records.set(record.id, record);

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.PROMPT_REGISTERED,
      source: "PromptRegistry",
      payload: { id: record.id, name: record.name, type: record.type },
      createdAt: now,
    });

    return record;
  }

  /** Localiza o PromptRecord de `id`, ou `undefined` se não existir. */
  get(id: string): PromptRecord | undefined {
    return this.records.get(id);
  }

  /** Retorna todos os PromptRecord já registrados (inclui os sete templates seed). */
  list(): PromptRecord[] {
    return Array.from(this.records.values());
  }

  /**
   * Atualiza os campos de `input` (parcial) no PromptRecord de `id`,
   * incrementando `version` e `updatedAt`. Emite PROMPT_UPDATED.
   * Retorna `undefined` se o registro não existir.
   */
  update(id: string, input: Partial<PromptRecordInput>): PromptRecord | undefined {
    const existing = this.records.get(id);

    if (!existing) {
      return undefined;
    }

    const updated: PromptRecord = {
      ...existing,
      ...input,
      version: existing.version + 1,
      updatedAt: new Date(),
    };

    this.records.set(id, updated);

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.PROMPT_UPDATED,
      source: "PromptRegistry",
      payload: { id: updated.id, version: updated.version },
      createdAt: updated.updatedAt,
    });

    return updated;
  }

  /** Remove o PromptRecord de `id`. Emite PROMPT_REMOVED. Retorna `false` se não existir. */
  remove(id: string): boolean {
    const removed = this.records.delete(id);

    if (removed) {
      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.PROMPT_REMOVED,
        source: "PromptRegistry",
        payload: { id },
        createdAt: new Date(),
      });
    }

    return removed;
  }
}
