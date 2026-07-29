// Session.ts
//
// Responsabilidade:
// Contrato de sessão autenticada — combina `Identity` com os tokens,
// sem implementar nenhuma lógica de expiração/renovação real.

import type { Identity } from './Identity';
import type { AccessToken, RefreshToken } from './AccessToken';

export interface Session {
  identity: Identity;
  accessToken: AccessToken;
  refreshToken?: RefreshToken;
  issuedAt: string;
}
