/** Artefato de saída gerado por BlogAgentExecutor. */
export interface BlogOutput {
  fileName: string;
  content: string;
  createdAt: Date;
}

/**
 * Encapsula a criação de um BlogOutput. Hoje apenas monta o objeto em
 * memória — nenhuma persistência real (disco, storage, WordPress) é
 * feita ainda, apesar de "WordPress" já constar entre as ferramentas de
 * BlogAgent.
 */
export class BlogOutputService {
  /** Monta um BlogOutput com `createdAt` no momento da chamada. */
  create(fileName: string, content: string): BlogOutput {
    return {
      fileName,
      content,
      createdAt: new Date(),
    };
  }
}

/** Instância única e compartilhada do BlogOutputService para toda a plataforma. */
export const blogOutputService = new BlogOutputService();
