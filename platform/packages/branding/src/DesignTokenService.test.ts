import { describe, expect, it } from 'vitest';
import { AccessibilityValidatorService } from './AccessibilityValidatorService';
import { DesignTokenService } from './DesignTokenService';
import { FakeDesignTokenRepository } from './testing/InMemoryFakes';

function buildService() {
  return new DesignTokenService(new FakeDesignTokenRepository(), new AccessibilityValidatorService());
}

describe('DesignTokenService — Color Engine + Typography Engine + Design Token Engine consolidados', () => {
  it('generateColorTokens produz "cor-destaque-primaria" preservando a cor original (elemento de destaque visual)', async () => {
    const service = buildService();

    const tokens = await service.generateColorTokens('theme-1', 'tenant-1', '#EEEEEE', '#FFFFFF');
    const accent = tokens.find((t) => t.name === 'cor-destaque-primaria');

    expect(accent?.value).toBe('#EEEEEE');
    expect(accent?.category).toBe('Cor');
  });

  it('generateColorTokens produz "cor-texto-primaria" ajustada pelo Accessibility Validator quando o contraste original é insuficiente', async () => {
    const service = buildService();
    const accessibility = new AccessibilityValidatorService();

    const tokens = await service.generateColorTokens('theme-1', 'tenant-1', '#EEEEEE', '#FFFFFF');
    const text = tokens.find((t) => t.name === 'cor-texto-primaria');

    expect(text?.value).not.toBe('#EEEEEE');
    expect(accessibility.meetsMinimumContrast(text!.value, '#FFFFFF')).toBe(true);
  });

  it('generateTypographyTokens produz "fonte-titulo" e "fonte-corpo" na categoria Tipografia', async () => {
    const service = buildService();

    const tokens = await service.generateTypographyTokens('theme-1', 'tenant-1', 'Poppins', 'Inter');

    expect(tokens.map((t) => t.name)).toEqual(['fonte-titulo', 'fonte-corpo']);
    expect(tokens.every((t) => t.category === 'Tipografia')).toBe(true);
  });

  it('listByTheme retorna apenas os Tokens do Theme informado', async () => {
    const service = buildService();
    await service.generateTypographyTokens('theme-1', 'tenant-1', 'Poppins', 'Inter');
    await service.generateTypographyTokens('theme-2', 'tenant-1', 'Roboto', 'Roboto');

    const tokens = await service.listByTheme('theme-1');

    expect(tokens).toHaveLength(2);
    expect(tokens.every((t) => t.themeId === 'theme-1')).toBe(true);
  });
});
