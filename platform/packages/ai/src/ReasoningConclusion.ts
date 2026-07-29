/**
 * Reasoning Conclusion — a conclusão produzida ao final do ciclo de raciocínio, sempre acompanhada de
 * confiança proporcional (nunca certeza absoluta), verificação obrigatória contra Regra de negócio, e
 * justificativa rastreável (Explainable by Default).
 * Estrutura definida em REASONING_CONCRETE_STRUCTURE.md.
 */
export interface ReasoningConclusion {
  /** Subtarefa para a qual esta conclusão foi produzida. */
  readonly subtaskId: string;

  /** Grau de confiança da Inferência — a natureza permanece sempre probabilística. */
  readonly confidence: number;

  /** Se a conclusão foi confirmada como não contraditória a Regra de negócio já documentada. */
  readonly validated: boolean;

  /** Justificativa rastreável até o dado e o contexto que sustentam esta conclusão. */
  readonly explanation: string;

  /** Momento em que a conclusão foi produzida. */
  readonly producedAt: Date;
}
