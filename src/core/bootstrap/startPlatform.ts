import { Platform } from "../platform/Platform";
import { startObservability } from "../events/Observability";

let platform: Platform | null = null;

/**
 * Ponto de entrada real da plataforma — chamado uma única vez por
 * `src/main.tsx`, antes do primeiro render de `<App />`.
 *
 * Responsabilidade (Sprint 0B — Integração do Runtime): inicializar a
 * plataforma através do bootstrap oficial — `Platform` → `PlatformRuntime`
 * → `BootPipeline` (Initialize/Validate/Finalize) → ModuleLoader/
 * ModuleRegistry, ConnectorLoader/ConnectorRegistry, AutomationLoader →
 * AgentSimulator ("blog-agent") — em vez de instanciar AgentSimulator
 * diretamente, como fazia antes desta Sprint. O comportamento
 * observável (o Agent "blog-agent" começa a ser simulado) é o mesmo;
 * apenas o caminho até lá passou a atravessar toda a arquitetura já
 * existente.
 *
 * Dependências: Platform (src/core/platform/), startObservability
 * (src/core/events/EventBusTest.ts — assina o EventBus e produz os logs
 * estruturados de boot/execução).
 *
 * Idempotente: chamadas subsequentes não fazem nada enquanto a
 * Platform já existir.
 */
export function startPlatform(): void {
  if (platform) {
    return;
  }

  startObservability();

  platform = new Platform();

  platform.init();
  platform.start();
}
