import type { AccessToken } from './AccessToken';

/** Contrato de persistência de Access Token — apenas o contrato. Sem `update` — renovação de Session nunca altera o valor de um Token já emitido; uma nova Session emite um novo Token. */
export interface AccessTokenRepository {
  create(token: AccessToken): Promise<AccessToken>;
  findBySession(sessionId: string): Promise<AccessToken | undefined>;
}
