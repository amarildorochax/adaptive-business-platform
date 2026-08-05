import type { AccessToken } from './AccessToken';
import type { AccessTokenRepository } from './AccessTokenRepository';
import type { AuthenticationResult } from './AuthenticationResult';
import type { Session } from './Session';
import type { SessionRepository } from './SessionRepository';

const DEFAULT_SESSION_TTL_MS = 1000 * 60 * 60; // 1 hora

/**
 * Session Service — "administra o ciclo de vida de uma sessão autenticada — criação, renovação,
 * expiração, revogação" (`IDENTITY_HUB.md`, Capítulo 7, "Session Manager"). `create` exige um
 * `AuthenticationResult` já confirmado — nunca cria uma Session a partir de uma Identity não
 * autenticada (Authentication Before Authorization, ADR-006; Capítulo 11, "Criação de sessão
 * acontece imediatamente após uma Authentication bem-sucedida").
 *
 * Dispositivo/Trust Engine (confiança contínua) são "médio prazo" per o Roadmap — esta Sprint nunca
 * calcula nível de confiança, apenas o ciclo de vida básico da Session.
 */
export class SessionService {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly tokens: AccessTokenRepository,
  ) {}

  async create(authentication: AuthenticationResult, tenantId: string, ttlMs: number = DEFAULT_SESSION_TTL_MS): Promise<{ session: Session; token: AccessToken }> {
    const now = new Date();
    const session = await this.sessions.create({
      sessionId: crypto.randomUUID(),
      identity: authentication.identity,
      tenantId,
      createdAt: now,
      expiresAt: new Date(now.getTime() + ttlMs),
    });

    const token = await this.tokens.create({
      value: crypto.randomUUID(),
      sessionId: session.sessionId,
      expiresAt: session.expiresAt,
    });

    return { session, token };
  }

  async renew(sessionId: string, extendMs: number = DEFAULT_SESSION_TTL_MS): Promise<Session> {
    const existing = await this.requireActive(sessionId);
    return this.sessions.update({ ...existing, expiresAt: new Date(Date.now() + extendMs) });
  }

  /** Revogação encerra a Session de forma imediata e explícita, antes de sua expiração natural (`IDENTITY_HUB.md`, Capítulo 11). */
  async revoke(sessionId: string): Promise<Session> {
    const existing = await this.sessions.get(sessionId);

    if (!existing) {
      throw new Error(`Session ${sessionId} não encontrada.`);
    }

    return this.sessions.update({ ...existing, revokedAt: new Date() });
  }

  async get(sessionId: string): Promise<Session | undefined> {
    return this.sessions.get(sessionId);
  }

  isActive(session: Session): boolean {
    return session.revokedAt === undefined && session.expiresAt.getTime() > Date.now();
  }

  private async requireActive(sessionId: string): Promise<Session> {
    const existing = await this.sessions.get(sessionId);

    if (!existing) {
      throw new Error(`Session ${sessionId} não encontrada.`);
    }

    if (!this.isActive(existing)) {
      throw new Error(`Session ${sessionId} não está ativa — expirada ou revogada.`);
    }

    return existing;
  }
}
