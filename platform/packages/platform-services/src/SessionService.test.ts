import { describe, expect, it } from 'vitest';
import { SessionService } from './SessionService';
import { FakeAccessTokenRepository, FakeSessionRepository } from './testing/InMemoryFakes';

describe('SessionService — ciclo de vida: criação, renovação, revogação', () => {
  it('create exige uma AuthenticationResult já confirmada e emite um Access Token associado', async () => {
    const service = new SessionService(new FakeSessionRepository(), new FakeAccessTokenRepository());

    const { session, token } = await service.create({ identity: 'identity-1', authenticatedAt: new Date() }, 'tenant-1');

    expect(session.identity).toBe('identity-1');
    expect(session.revokedAt).toBeUndefined();
    expect(token.sessionId).toBe(session.sessionId);
  });

  it('isActive é falso para uma Session já revogada', async () => {
    const service = new SessionService(new FakeSessionRepository(), new FakeAccessTokenRepository());
    const { session } = await service.create({ identity: 'identity-1', authenticatedAt: new Date() }, 'tenant-1');

    const revoked = await service.revoke(session.sessionId);

    expect(service.isActive(revoked)).toBe(false);
  });

  it('isActive é falso para uma Session já expirada', async () => {
    const service = new SessionService(new FakeSessionRepository(), new FakeAccessTokenRepository());
    const { session } = await service.create({ identity: 'identity-1', authenticatedAt: new Date() }, 'tenant-1', -1000);

    expect(service.isActive(session)).toBe(false);
  });

  it('renew nunca renova uma Session já revogada', async () => {
    const service = new SessionService(new FakeSessionRepository(), new FakeAccessTokenRepository());
    const { session } = await service.create({ identity: 'identity-1', authenticatedAt: new Date() }, 'tenant-1');
    await service.revoke(session.sessionId);

    await expect(service.renew(session.sessionId)).rejects.toThrow();
  });

  it('renew estende expiresAt de uma Session ainda ativa', async () => {
    const service = new SessionService(new FakeSessionRepository(), new FakeAccessTokenRepository());
    const { session } = await service.create({ identity: 'identity-1', authenticatedAt: new Date() }, 'tenant-1', 1_000);

    const renewed = await service.renew(session.sessionId, 3_600_000);

    expect(renewed.expiresAt.getTime()).toBeGreaterThan(session.expiresAt.getTime());
  });
});
