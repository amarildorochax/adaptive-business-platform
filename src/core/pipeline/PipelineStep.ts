import type { PipelineContext } from './PipelineContext';

/**
 * Uma única etapa de qualquer Pipeline da plataforma (Boot hoje;
 * Lifecycle, Shutdown, Update, Migration, Plugin, Install no futuro).
 *
 * Responsabilidade: cada etapa concreta decide o que `execute()`/
 * `rollback()` fazem — Pipeline em si nunca conhece essa lógica, apenas
 * orquestra a lista de etapas (register/list/clear/execute).
 *
 * Dependências: apenas o tipo PipelineContext.
 *
 * Exemplo de uso:
 * ```ts
 * class MyStep extends PipelineStep {
 *   readonly name = "my-step";
 *   execute(context: PipelineContext) { }
 *   rollback(context: PipelineContext) { }
 * }
 * ```
 */
export abstract class PipelineStep {
  /** Identificador legível da etapa, usado em mensagens de erro de Pipeline.execute(). */
  abstract readonly name: string;

  /** Lógica da etapa. Lançar aqui interrompe o Pipeline (ver Pipeline.execute()). */
  abstract execute(context: PipelineContext): void;

  /** Reservado para desfazer o efeito de `execute()` — ainda não invocado por Pipeline. */
  abstract rollback(context: PipelineContext): void;
}
