import { describe, expect, it } from 'vitest';
import { BusinessClassificationService } from './BusinessClassificationService';
import { FakeBusinessClassificationRecordRepository } from './testing/InMemoryFakes';

describe('BusinessClassificationService — Business Classifier + Segment Engine', () => {
  it('classify registra Segmento e Subsegmento como primeira versão', async () => {
    const service = new BusinessClassificationService(new FakeBusinessClassificationRecordRepository());

    const record = await service.classify('profile-1', 'Clínica', 'Odontológica');

    expect(record.version).toBe(1);
    expect(record.classification.segment).toBe('Clínica');
    expect(record.classification.subsegment).toBe('Odontológica');
  });

  it('current reflete sempre a Classificação mais recente, nunca uma anterior', async () => {
    const service = new BusinessClassificationService(new FakeBusinessClassificationRecordRepository());
    await service.classify('profile-1', 'Floricultura');
    await service.classify('profile-1', 'E-commerce');

    const current = await service.current('profile-1');

    expect(current?.segment).toBe('E-commerce');
  });

  it('history preserva cada versão anterior — nenhuma é descartada (ADR-009)', async () => {
    const service = new BusinessClassificationService(new FakeBusinessClassificationRecordRepository());
    await service.classify('profile-1', 'Floricultura');
    await service.classify('profile-1', 'E-commerce');

    const history = await service.history('profile-1');

    expect(history.map((h) => h.classification.segment)).toEqual(['Floricultura', 'E-commerce']);
  });
});
