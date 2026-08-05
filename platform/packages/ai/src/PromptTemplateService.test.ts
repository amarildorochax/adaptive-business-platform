import { describe, expect, it } from 'vitest';
import { PromptTemplateService } from './PromptTemplateService';
import { FakePromptTemplateRepository, FakePromptVersionRepository } from './testing/InMemoryFakes';

describe('PromptTemplateService — versionamento com o mesmo rigor de código de produção (ADR-010)', () => {
  it('cria um Prompt Template sempre na versão 1, registrando a primeira Prompt Version', async () => {
    const service = new PromptTemplateService(new FakePromptTemplateRepository(), new FakePromptVersionRepository());

    const template = await service.create('tenant-1', 'Boas-vindas', 'Você é a IA da {{businessName}}.');

    expect(template.version).toBe(1);
    expect(await service.listVersions(template.promptTemplateId)).toHaveLength(1);
  });

  it('update incrementa a versão e preserva a versão anterior no histórico, nunca sobrescrevendo-a', async () => {
    const service = new PromptTemplateService(new FakePromptTemplateRepository(), new FakePromptVersionRepository());
    const created = await service.create('tenant-1', 'Boas-vindas', 'Versão 1.');

    const updated = await service.update(created.promptTemplateId, 'Versão 2.');

    expect(updated.version).toBe(2);
    const versions = await service.listVersions(created.promptTemplateId);
    expect(versions).toHaveLength(2);
    expect(versions.find((v) => v.version === 1)?.supersededAt).toBeDefined();
    expect(versions.find((v) => v.version === 2)?.supersededAt).toBeUndefined();
  });
});
