// IService.ts
//
// Responsabilidade:
// Contrato mínimo para qualquer entidade registrável em um registry da
// plataforma (ex.: ServiceRegistry). Garante apenas que a entidade
// registrável possua um identificador estável.

export interface IService {
  readonly id: string;
}
