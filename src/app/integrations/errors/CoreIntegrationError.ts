// CoreIntegrationError.ts
//
// Responsabilidade:
// Classe-base de todo erro produzido pela camada de integração —
// nunca um erro do Core é repassado cru à UI; todo Adapter converte
// qualquer falha para um subtipo desta hierarquia (ver os 7 subtipos
// neste diretório).

export abstract class CoreIntegrationError extends Error {
  abstract readonly code: string;
  readonly moduleId?: string;

  constructor(message: string, moduleId?: string) {
    super(message);
    this.name = new.target.name;
    this.moduleId = moduleId;
  }
}
