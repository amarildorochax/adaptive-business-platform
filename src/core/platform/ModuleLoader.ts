// ModuleLoader.ts
//
// Responsabilidade:
// Carregamento dos módulos de negócio (src/modules/*, cada um
// implementando IModule).
//
// Sprint 0B — Integração do Runtime: `load()` agora instancia todos os
// Manager já existentes, importados de uma única vez a partir do barrel
// `@/modules` (src/modules/index.ts, criado na Sprint 0A) — nenhum
// caminho profundo individual é importado aqui. Nenhum módulo é
// registrado manualmente em outro lugar do código: quem chama `load()`
// (InitializeRuntimeStep) é responsável por registrar o resultado em um
// ModuleRegistry.
//
// Nota de projeto: como TypeScript/Vite não oferecem descoberta
// automática de classe por reflexão sem um passo de geração de código
// (que seria criar nova arquitetura de build, fora do escopo desta
// Sprint), a lista de Manager abaixo é o único ponto que precisa ser
// atualizado manualmente quando um novo módulo de negócio for
// adicionado a `src/modules/`. É a forma mais próxima de automática
// possível sem introduzir infraestrutura nova.

import type { IModule } from "@/shared/interfaces";
import {
  AcademyManager,
  AgendaManager,
  AnalyticsManager,
  BusinessManager,
  CommunicationManager,
  CrmManager,
  DocumentsManager,
  FiscalManager,
  HrManager,
  MarketingManager,
  MarketplaceManager,
  ProjectsManager,
} from "@/modules";

export class ModuleLoader {
  /** Instancia todos os módulos de negócio já existentes em `src/modules/*`. */
  load(): IModule[] {
    return [
      new AcademyManager(),
      new AgendaManager(),
      new AnalyticsManager(),
      new BusinessManager(),
      new CommunicationManager(),
      new CrmManager(),
      new DocumentsManager(),
      new FiscalManager(),
      new HrManager(),
      new MarketingManager(),
      new MarketplaceManager(),
      new ProjectsManager(),
    ];
  }
}
