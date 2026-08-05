import { describe, expect, it } from 'vitest';
import { TaskResultHandlerService } from './TaskResultHandlerService';
import { FakeAgentTaskResultRepository } from './testing/InMemoryFakes';

describe('TaskResultHandlerService — "nunca reinterpretando, expandindo, ou validando semanticamente"', () => {
  it('receive persiste o resultado e a confiança exatamente como fornecidos', async () => {
    const service = new TaskResultHandlerService(new FakeAgentTaskResultRepository());

    const result = await service.receive('delegation-1', 'Lead classificado como Alta prioridade', 0.82);

    expect(result.resultDescription).toBe('Lead classificado como Alta prioridade');
    expect(result.confidence).toBe(0.82);
  });

  it('listByDelegationRecordId retorna apenas os resultados da mesma delegação', async () => {
    const service = new TaskResultHandlerService(new FakeAgentTaskResultRepository());
    await service.receive('delegation-1', 'primeiro', 0.5);
    await service.receive('delegation-2', 'outro', 0.9);

    const results = await service.listByDelegationRecordId('delegation-1');

    expect(results).toHaveLength(1);
    expect(results[0]?.resultDescription).toBe('primeiro');
  });
});
