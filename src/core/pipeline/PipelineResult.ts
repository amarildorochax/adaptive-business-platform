// PipelineResult.ts
//
// Responsabilidade:
// Representa o resultado da execução de qualquer Pipeline. É a versão
// genérica do conceito que nasceu como BootResult na Sprint A.4 —
// mesmos campos, para que qualquer pipeline futuro (Boot, Lifecycle,
// Shutdown, Update, Migration, Plugin, Install...) reporte resultado no
// mesmo formato.
//
// Todas as propriedades já nascem inicializadas com um valor neutro
// (nenhuma fica `undefined`), para que um PipelineResult recém-criado já
// seja um valor válido e utilizável mesmo antes de qualquer etapa ser
// executada — é exatamente o que Pipeline.execute() retorna nesta
// Sprint, sem rodar nenhuma etapa.
//
// Nenhuma lógica de cálculo de sucesso/erro existe aqui.

export class PipelineResult {
  success: boolean = false;

  errors: string[] = [];

  warnings: string[] = [];

  duration: number = 0;
}
