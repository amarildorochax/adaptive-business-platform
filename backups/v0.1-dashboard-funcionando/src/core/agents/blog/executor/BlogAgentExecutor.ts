import type { Task } from "@/core/queue/Task";
import { blogOutputService } from "../output/BlogOutputService";
import { AIProviderFactory } from "@/core/ai/AIProviderFactory";

export interface BlogExecutionResult {
  success: boolean;
  title: string;
  output: string;
  fileName: string;
  provider: string;
  createdAt: Date;
  finishedAt: Date;
}

export class BlogAgentExecutor {
  async execute(task: Task): Promise<BlogExecutionResult> {
    console.log("[BlogAgent] Iniciando tarefa:", task.title);

    const ai = AIProviderFactory.create();

    const response = await ai.generate({
      prompt: `
Escreva um artigo em Markdown.

Título:
${task.title}

Descrição:
${task.description}
      `.trim(),
    });

    const artifact = blogOutputService.create(
      "artigo.md",
      response.content
    );

    console.log(
      `[BlogAgent] Conteúdo gerado usando ${response.provider}.`
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

export const blogAgentExecutor = new BlogAgentExecutor();