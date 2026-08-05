import { ProfileService } from './ProfileService';
import type { SecurityContext } from './SecurityContext';
import { SessionService } from './SessionService';

/**
 * Security Context Service — resolve, uma única vez, "o conjunto de afirmações já verificadas sobre
 * uma identidade... consumido por qualquer Hub sem nova consulta ao Identity Hub" (`SecurityContext.ts`,
 * doc-comment já aprovado). Exige uma Session ativa — nunca resolve um Security Context para uma
 * Session expirada ou revogada (Zero Trust, `IDENTITY_HUB.md`, Capítulo 4).
 *
 * `roles` é sempre, no máximo, um único elemento nesta Sprint — "cada Perfil associado a exatamente
 * um Workspace" (Capítulo 8) — um array, não um valor singular, porque `SecurityContext.ts` já
 * aprovado o declara assim, preservado sem alteração.
 */
export class SecurityContextService {
  constructor(
    private readonly sessions: SessionService,
    private readonly profiles: ProfileService,
  ) {}

  async build(sessionId: string): Promise<SecurityContext> {
    const session = await this.sessions.get(sessionId);

    if (!session) {
      throw new Error(`Session ${sessionId} não encontrada.`);
    }

    if (!this.sessions.isActive(session)) {
      throw new Error(`Session ${sessionId} não está ativa — expirada ou revogada.`);
    }

    const profile = await this.profiles.find(session.identity, session.tenantId);

    return {
      identity: session.identity,
      tenantId: session.tenantId,
      sessionId: session.sessionId,
      roles: profile ? [profile.role] : [],
    };
  }
}
