import { describe, expect, it } from 'vitest';
import { MemoryEntryService } from './MemoryEntryService';
import { FakeMemoryEntryRepository } from './testing/InMemoryFakes';

describe('MemoryEntryService — isolamento absoluto entre Empresas (ADR-008)', () => {
  it('recallByOwnership nunca retorna entrada de outro Tenant', async () => {
    const service = new MemoryEntryService(new FakeMemoryEntryRepository());
    await service.remember({ tenantId: 'tenant-1', type: 'LongDuration', scope: 'Organizacional', ownership: 'Empresa', title: 'Segmento', content: 'Floricultura', tags: ['segmento'] });
    await service.remember({ tenantId: 'tenant-2', type: 'LongDuration', scope: 'Organizacional', ownership: 'Empresa', title: 'Segmento', content: 'Pet Shop', tags: ['segmento'] });

    const results = await service.recallByOwnership('tenant-1', 'Empresa');

    expect(results).toHaveLength(1);
    expect(results[0]?.content).toBe('Floricultura');
  });

  it('recallByTags filtra por marcador', async () => {
    const service = new MemoryEntryService(new FakeMemoryEntryRepository());
    await service.remember({ tenantId: 'tenant-1', type: 'ShortDuration', scope: 'Efêmera', ownership: 'Usuário', title: 'Preferência', content: 'Prefere respostas curtas', tags: ['preferencia'] });

    const results = await service.recallByTags('tenant-1', ['preferencia']);

    expect(results).toHaveLength(1);
  });

  it('filterByType distingue ShortDuration de LongDuration dentro de um conjunto já recuperado', async () => {
    const service = new MemoryEntryService(new FakeMemoryEntryRepository());
    const entries = [
      { memoryId: '1', tenantId: 't', type: 'ShortDuration' as const, scope: 'Efêmera' as const, ownership: 'IA' as const, createdAt: new Date() },
      { memoryId: '2', tenantId: 't', type: 'LongDuration' as const, scope: 'Organizacional' as const, ownership: 'IA' as const, createdAt: new Date() },
    ];

    expect(service.filterByType(entries, 'LongDuration')).toHaveLength(1);
  });
});
