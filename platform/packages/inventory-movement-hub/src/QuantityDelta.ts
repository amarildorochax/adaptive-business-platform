/**
 * QuantityDelta — Value Object, inteiro assinado (positivo para entrada, negativo para saída), nunca
 * armazenado como dois campos separados de entrada/saída — um único eixo, replicando a disciplina de
 * `Ledger Entry` (débito/crédito como sinal, não como dois campos), per `INVENTORY_MOVEMENT_HUB.md`,
 * Capítulo 6. Zero nunca é um `QuantityDelta` válido — um `StockMovement` sem efeito nenhum não é um
 * fato de negócio, per Capítulo 4 ("cada instância é um fato físico único").
 */
export type QuantityDelta = number;

export function isValidQuantityDelta(quantityDelta: QuantityDelta): boolean {
  return Number.isInteger(quantityDelta) && quantityDelta !== 0;
}
