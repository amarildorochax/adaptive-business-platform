import type { Task } from "@/core/queue/Task";
import { blogOutputService } from "../output/BlogOutputService";
import { promptManager } from "@/core/prompt/PromptManager";
import { MemoryCategory } from "@/core/memory/MemoryCategory";

/** Resultado de uma execução de Task pelo BlogAgent. */
export interface BlogExecutionResult {
  success: boolean;
  title: string;
  output: string;
  fileName: string;
  provider: string;
  createdAt: Date;
  finishedAt: Date;
}

/**
 * Executor concreto do BlogAgent: gera um artigo em Markdown a partir do
 * título/descrição da Task, usando o Prompt Manager.
 *
 * Responsabilidade: único executor real da plataforma hoje, resolvido
 * por AgentDispatcher para `agentId === "blog-agent"` (ver
 * AgentDispatcher.registerExecutor).
 *
 * Sprint Prompt Manager (Tarefa 09): este executor não chama mais
 * `contextBuilder.generate()` diretamente — passou a chamar
 * exclusivamente `promptManager.generate()`
 * (src/core/prompt/PromptManager.ts), que resolve o template
 * `"template-blog"`, monta o prompt completo (System + User, variáveis
 * `{{businessName}}`/`{{tone}}` já substituídas), e só então encaminha a
 * ContextBuilder (Business Memory + AI Gateway, ambos inalterados). O
 * BlogAgent nunca monta prompt manualmente, e nunca conhece
 * PromptBuilder/PromptRegistry/ContextBuilder/MemoryStore/AIGateway
 * diretamente — apenas PromptManager.
 *
 * Fluxo completo: BlogAgent → PromptManager → ContextBuilder →
 * BusinessMemory → AIGateway.
 *
 * Dependências: Task (tipo), blogOutputService, promptManager,
 * MemoryCategory (apenas para o hint `metadata.category`).
 */
export class BlogAgentExecutor {
  /** Gera o artigo via PromptManager (Prompt + Contexto + IA) e persiste via BlogOutputService. */
  async execute(task: Task): Promise<BlogExecutionResult> {
    const response = await promptManager.generate({
      templateId: "template-blog",
      userPrompt: `
Escreva um artigo em Markdown.

Título:
${task.title}

Descrição:
${task.description}
      `.trim(),
      variables: {
        businessName: "Andreia Rocha Floral",
        tone: "profissional e acolhedor",
      },
      metadata: { category: MemoryCategory.BLOG },
    });

    const artifact = blogOutputService.create(
      "artigo.md",
      response.content
    );

    return {
      success: response.success,
      title: task.title,
      output: artifact.content,
      fileName: artifact.fileName,
      provider: response.provider,
      createdAt: artifact.createdAt,
      finishedAt: new Date(),
    };
  }
}

/** Instância única e compartilhada do BlogAgentExecutor para toda a plataforma. */
export const blogAgentExecutor = new BlogAgentExecutor();
