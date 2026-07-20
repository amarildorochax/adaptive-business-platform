// BaseBootStep.ts
//
// Responsabilidade:
// Classe base comum para todas as Boot Steps (etapas de inicialização
// da plataforma, registradas em BootPipeline). Existe apenas para dar
// identidade ao conjunto de etapas de boot — para que o BootPipeline e
// qualquer código futuro possam diferenciar "uma PipelineStep qualquer"
// de "uma etapa que pertence especificamente ao boot", sem que isso
// implique nenhum comportamento ou membro extra.
//
// Não adiciona nenhum método, propriedade ou lógica além do que já vem
// de PipelineStep (src/core/pipeline/PipelineStep.ts) — `name`,
// `execute` e `rollback` continuam abstratos e sem corpo. Cada Boot
// Step concreta (InitializeRuntimeStep, ValidateRuntimeStep,
// FinalizeRuntimeStep, e outras futuras) é quem decide o que fazer.

import { PipelineStep } from '../../pipeline/PipelineStep';

export abstract class BaseBootStep extends PipelineStep {}
