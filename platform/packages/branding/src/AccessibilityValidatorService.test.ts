import { describe, expect, it } from 'vitest';
import { AccessibilityValidatorService } from './AccessibilityValidatorService';

describe('AccessibilityValidatorService — Accessibility Validator (WCAG 2.x, contraste mínimo 4.5:1)', () => {
  it('contrastRatio calcula a razão de contraste máxima (preto sobre branco = 21:1)', () => {
    const service = new AccessibilityValidatorService();

    expect(service.contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 0);
  });

  it('meetsMinimumContrast aprova um contraste acima de 4.5:1', () => {
    const service = new AccessibilityValidatorService();

    expect(service.meetsMinimumContrast('#000000', '#FFFFFF')).toBe(true);
  });

  it('meetsMinimumContrast reprova um contraste insuficiente (cinza claro sobre branco)', () => {
    const service = new AccessibilityValidatorService();

    expect(service.meetsMinimumContrast('#EEEEEE', '#FFFFFF')).toBe(false);
  });

  it('ensureAccessible preserva a cor original quando já atende ao contraste mínimo', () => {
    const service = new AccessibilityValidatorService();

    const { value, adjusted } = service.ensureAccessible('#000000', '#FFFFFF');

    expect(value).toBe('#000000');
    expect(adjusted).toBe(false);
  });

  it('ensureAccessible ajusta apenas a luminosidade (ADR-008) quando o contraste é insuficiente, e sinaliza adjusted=true', () => {
    const service = new AccessibilityValidatorService();

    const { value, adjusted } = service.ensureAccessible('#EEEEEE', '#FFFFFF');

    expect(adjusted).toBe(true);
    expect(service.meetsMinimumContrast(value, '#FFFFFF')).toBe(true);
  });
});
