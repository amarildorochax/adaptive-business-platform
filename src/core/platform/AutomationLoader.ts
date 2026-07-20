// AutomationLoader.ts
//
// Responsabilidade:
// Infraestrutura para o futuro carregamento dos motores de automação
// (src/core/automation/*, cada um implementando IAutomation). O tipo de
// retorno usa IAutomation apenas para documentar o contrato esperado.
//
// Nesta etapa, explicitamente:
// - nenhum workflow é criado ou executado;
// - nenhuma regra é avaliada;
// - somente infraestrutura.
//
// load() retorna uma lista vazia — é apenas a assinatura futura.

import type { IAutomation } from "@/shared/interfaces";

export class AutomationLoader {
  load(): IAutomation[] {
    return [];
  }
}
