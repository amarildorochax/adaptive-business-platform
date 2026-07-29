// PipelineResult.ts
//
// Responsabilidade:
// Resultado tipado de uma execução de pipeline — usado internamente
// pelo `PipelineExecutor` para diferenciar sucesso de falha sem recorrer
// a exceções em todo o caminho, quando isso for útil (ex.: um
// middleware que precise inspecionar o resultado sem interromper o
// fluxo com `try/catch`).

import type { PipelineResponse } from './PipelineResponse';
import type { CoreIntegrationError } from '../errors/CoreIntegrationError';

export type PipelineResult<Data = unknown> =
  | { success: true; response: PipelineResponse<Data> }
  | { success: false; error: CoreIntegrationError };
