/**
 * Contêiner de contexto compartilhado entre todas as PipelineStep de um
 * mesmo Pipeline (um novo PipelineContext é criado a cada
 * `Pipeline.execute()`).
 *
 * Responsabilidade: dar às etapas um lugar comum para ler/escrever
 * estado durante a execução do pipeline.
 *
 * Nota de projeto: os campos abaixo são `unknown` de propósito — tipá-los
 * como classes concretas (ex.: `runtime: PlatformRuntime`) criaria uma
 * dependência circular (PlatformRuntime -> BootPipeline -> Pipeline ->
 * PipelineStep -> PipelineContext -> PlatformRuntime). Cada etapa
 * concreta é responsável por fazer o narrowing de tipo necessário.
 */
export class PipelineContext {
  /** Representará futuramente a configuração da plataforma (ex.: PlatformConfig). */
  config?: unknown;

  /** Representará futuramente o registry da plataforma (ex.: PlatformRegistry). */
  registry?: unknown;

  /** Representará futuramente a instância de runtime (ex.: PlatformRuntime). */
  runtime?: unknown;

  /** Representará futuramente os serviços registrados (ex.: ServiceRegistry). */
  services?: unknown;

  /** Representará futuramente o ambiente de execução (ex.: "development"). */
  environment?: unknown;
}
