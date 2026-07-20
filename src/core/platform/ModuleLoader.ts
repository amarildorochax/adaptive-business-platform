// ModuleLoader.ts
//
// Responsabilidade:
// Infraestrutura para o futuro carregamento dos módulos de negócio
// (src/modules/*, cada um implementando IModule). O tipo de retorno usa
// IModule apenas para documentar o contrato esperado.
//
// Nesta etapa, explicitamente:
// - nenhum import dinâmico de módulos concretos;
// - nenhum registro automático em ModuleRegistry/PlatformRegistry;
// - nenhum módulo concreto é referenciado.
//
// load() retorna uma lista vazia — é apenas a assinatura futura.

import type { IModule } from "@/shared/interfaces";

export class ModuleLoader {
  load(): IModule[] {
    return [];
  }
}
