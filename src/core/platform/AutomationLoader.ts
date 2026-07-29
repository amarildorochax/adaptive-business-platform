// AutomationLoader.ts
//
// Responsabilidade:
// Carregamento dos motores de automação (src/core/automation/*, cada um
// implementando IAutomation).
//
// Sprint 0B — Integração do Runtime: `load()` agora instancia os cinco
// Engines já existentes (Workflow, Rule, Trigger, Hook, Policy),
// importados do barrel `@/core/automation` (criado na Sprint 0A).
// Nenhuma regra de negócio nova é implementada — cada Engine continua
// com `init()/start()/stop()` vazios; apenas passam a ser instanciados e
// ter seu ciclo de vida acionado durante o boot (ver
// InitializeRuntimeStep/FinalizeRuntimeStep).

import type { IAutomation } from "@/shared/interfaces";
import {
  WorkflowEngine,
  RuleEngine,
  TriggerManager,
  HookManager,
  PolicyManager,
} from "@/core/automation";

export class AutomationLoader {
  /** Instancia os cinco motores de automação já existentes. */
  load(): IAutomation[] {
    return [
      new WorkflowEngine(),
      new RuleEngine(),
      new TriggerManager(),
      new HookManager(),
      new PolicyManager(),
    ];
  }
}
