/**
 * Resultado da execução de um Pipeline — sempre um valor válido e
 * utilizável, mesmo antes de qualquer etapa ser executada (nenhuma
 * propriedade fica `undefined`).
 */
export class PipelineResult {
  /** `true` se todas as etapas executaram sem lançar exceção. */
  success: boolean = false;

  /** Mensagens de erro — no formato `"<nome-da-etapa>: <mensagem>"` quando a origem é conhecida. */
  errors: string[] = [];

  /** Reservado para avisos não fatais — ainda não populado por Pipeline.execute(). */
  warnings: string[] = [];

  /** Duração total da execução, em milissegundos. */
  duration: number = 0;
}
