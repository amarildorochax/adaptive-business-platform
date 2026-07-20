// IAutomation.ts
//
// Responsabilidade:
// Contrato para os motores de automação de src/core/automation/*
// (WorkflowEngine, RuleEngine, TriggerManager, HookManager,
// PolicyManager). Combina identidade (IService) e ciclo de vida
// (ILifecycle) para permitir composição/registro genérico futuro.
// Intencionalmente sem membros próprios nesta etapa.

import type { IService } from './IService';
import type { ILifecycle } from './ILifecycle';

export interface IAutomation extends IService, ILifecycle {}
