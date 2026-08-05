import { describe, expect, it } from 'vitest';
import { IncidentService } from './IncidentService';
import { FakeIncidentRepository } from './testing/InMemoryFakes';

describe('IncidentService — "detecção, classificação de severidade, mitigação, resolução, e revisão posterior"', () => {
  it('open cria um Incident em Detected, sem severidade ainda classificada', async () => {
    const service = new IncidentService(new FakeIncidentRepository());

    const incident = await service.open('alert:pipeline.latency');

    expect(incident.stage).toBe('Detected');
    expect(incident.severity).toBeUndefined();
  });

  it('percorre as cinco etapas em ordem: Detected → SeverityClassified → Mitigated → Resolved → Reviewed', async () => {
    const service = new IncidentService(new FakeIncidentRepository());
    const opened = await service.open('alert:pipeline.latency');

    const classified = await service.classify(opened.incidentId, 'alta');
    const mitigated = await service.mitigate(opened.incidentId);
    const resolved = await service.resolve(opened.incidentId);
    const reviewed = await service.review(opened.incidentId);

    expect(classified.severity).toBe('alta');
    expect(mitigated.stage).toBe('Mitigated');
    expect(resolved.stage).toBe('Resolved');
    expect(reviewed.stage).toBe('Reviewed');
  });

  it('nunca permite pular uma etapa — mitigate antes de classify falha', async () => {
    const service = new IncidentService(new FakeIncidentRepository());
    const opened = await service.open('alert:pipeline.latency');

    await expect(service.mitigate(opened.incidentId)).rejects.toThrow();
  });
});
