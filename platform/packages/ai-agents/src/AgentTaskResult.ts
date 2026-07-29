/**
 * Agent Task Result — recebido pelo Task Result Handler, representa o resultado estruturado já
 * retornado pelo contrato externo do AI Hub para uma delegação já registrada
 * (`AI_AGENTS_ARCHITECTURE_DEFINITION.md`, Seções 4, 5 e 8). `resultDescription` é sempre opaco —
 * nunca reinterpretado, expandido, ou validado semanticamente por este pacote, mesma disciplina já
 * exigida de `ActionAIInvocation.ts` no Automation Engine (Sprint 6.3). `confidence` é a única
 * representação externa do grau de certeza já produzido pelo Reasoning do AI Core (Component 19) —
 * nunca uma reconstrução da lógica de Reasoning que o produziu.
 * Este artefato não possui nenhum campo de liberação ou de confirmação humana — o checkpoint de
 * Human Oversight sobre este resultado é responsabilidade exclusiva do Oversight Gate, deliberadamente
 * fora do escopo desta Sprint (`AI_AGENTS_IMPLEMENTATION_BACKLOG.md`, Seção 2, AGT-02).
 * Estrutura definida em `AI_AGENTS_ARCHITECTURE_DEFINITION.md`, Seção 5.
 */
export interface AgentTaskResult {
  /** Identificador do Agent Task Result. */
  readonly agentTaskResultId: string;

  /** Agent Delegation Record ao qual este resultado corresponde — ver AgentDelegationRecord.ts. */
  readonly agentDelegationRecordId: string;

  /** Resultado estruturado, sempre opaco — nunca reinterpretado por este pacote. */
  readonly resultDescription: string;

  /** Grau de confiança associado ao resultado, já produzido pelo Reasoning do AI Core. */
  readonly confidence: number;

  /** Momento em que o resultado foi recebido. */
  readonly producedAt: Date;
}
