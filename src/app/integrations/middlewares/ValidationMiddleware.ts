// ValidationMiddleware.ts
//
// Responsabilidade:
// Pipeline de validação do `PipelineRequest.payload` — executa uma
// lista de validadores (`Validator[]`) e lança `ValidationError` se
// algum falhar. Nesta Sprint a lista é sempre vazia (nenhuma regra de
// negócio); a estrutura está pronta para uma Sprint futura registrar
// validadores por módulo sem alterar este Middleware.

import { ValidationError } from '../errors/ValidationError';
import type { PipelineMiddleware } from '../contracts/PipelineMiddleware';
import type { PipelineContext } from '../context/PipelineContext';

export type Validator = (context: PipelineContext) => string | null;

const validators: Validator[] = [];

export const validationMiddleware: PipelineMiddleware = {
  name: 'validation',
  priority: 70,

  beforeExecute(context: PipelineContext): PipelineContext {
    const fieldErrors: Record<string, string> = {};

    validators.forEach((validate, index) => {
      const message = validate(context);
      if (message) fieldErrors[`validator[${index}]`] = message;
    });

    if (Object.keys(fieldErrors).length > 0) {
      throw new ValidationError('Falha de validação do pipeline.', fieldErrors, context.request.moduleId);
    }

    return context;
  },
};
