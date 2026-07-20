// RuntimeState.ts
//
// Responsabilidade:
// Enumera os estados possíveis do ciclo de vida do PlatformRuntime.
// É apenas um vocabulário de estados — não contém transições nem regras
// sobre quando cada estado pode ocorrer. Quem decide a transição é o
// PlatformRuntime/LifecycleManager em etapas futuras.

export enum RuntimeState {
  CREATED = "created",

  INITIALIZING = "initializing",

  INITIALIZED = "initialized",

  STARTING = "starting",

  RUNNING = "running",

  STOPPING = "stopping",

  STOPPED = "stopped",

  ERROR = "error",
}
