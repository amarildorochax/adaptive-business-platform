// PipelineStep.ts
//
// Responsabilidade:
// Representa uma única etapa de qualquer pipeline da plataforma (Boot,
// Lifecycle, Shutdown, Update, Migration, Plugin, Install, etc. no
// futuro). É a versão genérica do conceito que nasceu como BootStep na
// Sprint A.4 — a lógica de uma etapa nunca pertence ao Pipeline em si,
// e sim a uma PipelineStep concreta.
//
// Classe abstrata: `name`, `execute` e `rollback` não têm corpo aqui de
// propósito — cada etapa concreta futura decide o que fazer. Isso
// mantém o Pipeline capaz de gerenciar qualquer etapa de forma
// genérica (register/list/clear), sem conhecer a lógica de nenhuma
// etapa específica.
//
// Nenhuma etapa concreta é criada nesta Sprint.

import type { PipelineContext } from './PipelineContext';

export abstract class PipelineStep {
  abstract readonly name: string;

  abstract execute(context: PipelineContext): void;

  abstract rollback(context: PipelineContext): void;
}
