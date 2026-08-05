/**
 * TaxId — identificador fiscal externo de um Supplier (CNPJ/CPF ou equivalente internacional),
 * validado apenas por formato nesta Sprint — nunca por autoridade externa (essa integração é
 * responsabilidade futura do Integration Hub, per `SUPPLIER_HUB.md`, Capítulo 6).
 * Estrutura definida em `SUPPLIER_HUB.md`, Capítulo 6.
 */
export interface TaxId {
  /** Valor bruto do identificador fiscal, apenas dígitos (sem máscara). */
  readonly value: string;
}

/** Formato aceito nesta Sprint: 11 dígitos (CPF) ou 14 dígitos (CNPJ), sem máscara. */
const TAX_ID_PATTERN = /^\d{11}$|^\d{14}$/;

export function isValidTaxIdFormat(value: string): boolean {
  return TAX_ID_PATTERN.test(value);
}
