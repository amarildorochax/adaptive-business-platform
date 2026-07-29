// AccessToken.ts
//
// Responsabilidade:
// Contratos de token de acesso/renovação — preparação arquitetural,
// sem nenhuma emissão/validação real de token nesta Sprint.

export interface AccessToken {
  value: string;
  expiresAt: string;
}

export interface RefreshToken {
  value: string;
  expiresAt: string;
}
