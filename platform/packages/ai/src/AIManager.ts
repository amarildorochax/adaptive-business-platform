import { AIGateway } from './AIGateway';
import type { AIResponse } from './AIResponse';
import { KnowledgeConnectorService } from './KnowledgeConnectorService';
import { MemoryEntryService, type RememberInput } from './MemoryEntryService';
import type { MemoryEntry } from './MemoryEntry';
import type { MemoryOwnership } from './MemoryOwnership';
import { PromptComposerService } from './PromptComposerService';
import type { PromptExecution } from './PromptExecution';
import { PromptExecutionService } from './PromptExecutionService';
import type { PromptTemplate } from './PromptTemplate';
import { PromptTemplateService } from './PromptTemplateService';

export interface AIManagerDependencies {
  readonly gateway: AIGateway;
  readonly promptTemplates: PromptTemplateService;
  readonly promptExecutions: PromptExecutionService;
  readonly promptComposer: PromptComposerService;
  readonly memory: MemoryEntryService;
  readonly knowledge: KnowledgeConnectorService;
}

export interface RequestCompletionInput {
  readonly tenantId: string;
  readonly userPrompt: string;
  readonly promptTemplateId?: string;
  readonly variables?: Readonly<Record<string, string>>;
  /** Já trazido pelo Business Profile Connector — referência opaca, nunca um tipo importado de outro Hub. */
  readonly businessContext?: string;
  /** Já trazido pelo Branding Connector — referência opaca, nunca um tipo importado de outro Hub. */
  readonly brandContext?: string;
  readonly recallMemoryOwnership?: MemoryOwnership;
  readonly knowledgeTags?: readonly string[];
  readonly providerId?: string;
  readonly model?: string;
  readonly maxTokens?: number;
  readonly temperature?: number;
}

/**
 * Resultado de uma operação do AIManager. **Nunca tem um campo `command` nem um campo `events`** —
 * `AI_HUB.md` nunca cataloga Commands nem um Event Map próprio para o AI Hub (26 capítulos, nenhum
 * equivalente a "Comandos"/"Eventos do Domínio" já Frozen/Official em nenhum dos dois Volumes
 * consultados) — mesma ausência já confirmada para o Automation Engine (IMP-009), mas sem sequer um
 * `AuditRecord` equivalente já contratado para este Hub especificamente.
 */
export interface AIOperationResult<TEntity> {
  readonly result: TEntity;
}

/**
 * AIManager — o orquestrador central do AI Hub para esta Sprint, equivalente em função ao Automation
 * Manager e a todo Manager anterior desta série: coordena os Services especializados, nunca contém
 * regra de negócio própria de nenhum componente individual.
 *
 * Fluxo implementado (`AI_HUB.md`, Capítulo 8, versão de curto prazo per o Roadmap, Capítulo 25):
 * Prompt Template (quando informado) → Memory Manager (quando solicitado) → Knowledge Connector
 * (quando solicitado) → Prompt Composer → Prompt Execution (registro) → AI Gateway → Provider Router
 * → Provider Factory → Provider (Mock/OpenAI/Claude/Gemini, todos delegando a MockAIProvider) →
 * AIResponse. Policy Engine, Guardrails, Cache Manager, Retry Manager, Queue Manager, Token/Cost
 * Manager e Observabilidade plena são "médio/longo prazo" per o próprio Roadmap — nenhum implementado
 * nesta Sprint (ver relatório).
 *
 * Memória e Conhecimento recuperados são combinados em um bloco de contexto prependido ao User
 * Prompt antes da composição — mesmo padrão já validado por `src/core/memory/ContextBuilder.ts`
 * (legado, real e funcional) — nunca uma quinta camada de Prompt inventada além das quatro já Frozen
 * (System/Business/Brand/User, `AI_HUB.md`, Capítulo 9).
 */
export class AIManager {
  constructor(private readonly deps: AIManagerDependencies) {}

  async requestCompletion(input: RequestCompletionInput): Promise<AIOperationResult<{ response: AIResponse; execution: PromptExecution }>> {
    const systemContent = input.promptTemplateId ? await this.resolveTemplateContent(input.promptTemplateId) : undefined;
    const contextBlock = await this.buildContextBlock(input.tenantId, input.recallMemoryOwnership, input.knowledgeTags);
    const enrichedUserPrompt = contextBlock ? `${contextBlock}\n\n${input.userPrompt}` : input.userPrompt;

    const composed = this.deps.promptComposer.compose({
      systemContent,
      businessContext: input.businessContext,
      brandContext: input.brandContext,
      userPrompt: enrichedUserPrompt,
      variables: input.variables,
    });

    const execution = await this.deps.promptExecutions.record(
      input.tenantId,
      composed.composedPrompt,
      composed.layersUsed,
      input.promptTemplateId,
    );

    const response = await this.deps.gateway.generate({
      tenantId: input.tenantId,
      prompt: composed.composedPrompt,
      providerId: input.providerId,
      model: input.model,
      maxTokens: input.maxTokens,
      temperature: input.temperature,
    });

    return { result: { response, execution } };
  }

  async createPromptTemplate(tenantId: string, name: string, content: string): Promise<AIOperationResult<PromptTemplate>> {
    const template = await this.deps.promptTemplates.create(tenantId, name, content);
    return { result: template };
  }

  async updatePromptTemplate(promptTemplateId: string, content: string): Promise<AIOperationResult<PromptTemplate>> {
    const template = await this.deps.promptTemplates.update(promptTemplateId, content);
    return { result: template };
  }

  async remember(input: RememberInput): Promise<AIOperationResult<MemoryEntry>> {
    const entry = await this.deps.memory.remember(input);
    return { result: entry };
  }

  private async resolveTemplateContent(promptTemplateId: string): Promise<string> {
    const template = await this.deps.promptTemplates.get(promptTemplateId);

    if (!template) {
      throw new Error(`Prompt Template ${promptTemplateId} não encontrado.`);
    }

    return template.content;
  }

  private async buildContextBlock(
    tenantId: string,
    recallMemoryOwnership: MemoryOwnership | undefined,
    knowledgeTags: readonly string[] | undefined,
  ): Promise<string | undefined> {
    const blocks: string[] = [];

    if (recallMemoryOwnership) {
      const entries = await this.deps.memory.recallByOwnership(tenantId, recallMemoryOwnership);

      if (entries.length > 0) {
        const lines = entries.map((entry) => `- ${entry.title ?? entry.memoryId}: ${entry.content ?? ''}`).join('\n');
        blocks.push(`Memória institucional:\n${lines}`);
      }
    }

    if (knowledgeTags && knowledgeTags.length > 0) {
      const assets = await this.deps.knowledge.consult(tenantId, knowledgeTags);

      if (assets.length > 0) {
        const lines = assets.map((asset) => `- ${asset.assetId} (${asset.category ?? asset.type})`).join('\n');
        blocks.push(`Conhecimento institucional:\n${lines}`);
      }
    }

    return blocks.length > 0 ? blocks.join('\n\n') : undefined;
  }
}
