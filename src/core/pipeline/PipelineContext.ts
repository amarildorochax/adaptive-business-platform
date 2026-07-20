// PipelineContext.ts
//
// Responsabilidade:
// Objeto de contexto compartilhado entre todas as etapas (PipelineStep)
// de um Pipeline. É a versão genérica do conceito que nasceu como
// BootContext na Sprint A.4 — qualquer pipeline futuro (Boot, Lifecycle,
// Shutdown, Update, Migration, Plugin, Install...) reutiliza este mesmo
// contêiner em vez de cada um definir o seu próprio.
//
// Nesta etapa é apenas um contêiner estrutural: nenhuma propriedade tem
// tipo concreto. Tipar "runtime" como PlatformRuntime, por exemplo,
// criaria uma dependência circular (PlatformRuntime -> BootPipeline ->
// Pipeline -> PipelineStep -> PipelineContext -> PlatformRuntime).
// Manter os tipos como `unknown` evita esse ciclo e mantém o
// PipelineContext desacoplado de qualquer classe concreta da
// plataforma.
//
// Nenhuma implementação, nenhum comportamento nesta etapa.

export class PipelineContext {
  // Representará futuramente a configuração da plataforma (ex.: PlatformConfig).
  config?: unknown;

  // Representará futuramente o registry da plataforma (ex.: PlatformRegistry).
  registry?: unknown;

  // Representará futuramente a instância de runtime (ex.: PlatformRuntime).
  runtime?: unknown;

  // Representará futuramente os serviços registrados (ex.: ServiceRegistry).
  services?: unknown;

  // Representará futuramente o ambiente de execução (ex.: "development").
  environment?: unknown;
}
