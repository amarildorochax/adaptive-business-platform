/**
 * Agent Contract — os dezessete elementos obrigatórios que todo Agente deve satisfazer integralmente
 * antes de ser considerado válido para invocação pelo Agent Coordinator; a ausência de qualquer
 * elemento é tratada como especificação incompleta, nunca como variação legítima.
 * O décimo sétimo elemento, Lifecycle, é satisfeito por AgentLifecycleState, referenciado pelo mesmo
 * agentId, nunca duplicado como campo aqui.
 * Estrutura, regras e invariantes definidas em AGENT_FRAMEWORK_CONCRETE_STRUCTURE.md.
 */
export interface AgentContract {
  /** Identity — identificador único do Agente. */
  readonly agentId: string;

  /** Identity — nome único e descrição formal. */
  readonly name: string;

  /** Mission — propósito específico do Agente. */
  readonly mission: string;

  /** Responsibilities — fronteiras exatas do que o Agente processa. */
  readonly responsibilities: readonly string[];

  /** Capabilities — Capabilities já catalogadas que o Agente está autorizado a apoiar. */
  readonly capabilityIds: readonly string[];

  /** Permissions — escopo de acesso a dado de negócio, sempre herdado do Usuário. */
  readonly permissionScope: readonly string[];

  /** Execution Policies — políticas de execução aplicáveis às ações propostas pelo Agente. */
  readonly executionPolicies: readonly string[];

  /** Memory Access — categorias de memória que o Agente pode consultar e, quando aplicável, persistir. */
  readonly memoryAccessScopes: readonly string[];

  /** Context Access — fontes de contexto que o Agente pode consumir. */
  readonly contextAccessSources: readonly string[];

  /** Planning Interface — se o Agente declara contrato de decomposição interna (Component 20). */
  readonly planningInterfaceDeclared: boolean;

  /** Reasoning Interface — se o Agente declara contrato de raciocínio especializado (Component 19). */
  readonly reasoningInterfaceDeclared: boolean;

  /** Skill Invocation — se o Agente declara contrato de descoberta e invocação de Skill (Component 21). */
  readonly skillInvocationDeclared: boolean;

  /** Tool Access — escopo de recurso externo acessível por Skills invocadas (Component 22). */
  readonly toolAccessScope: readonly string[];

  /** Observability — sinais que o Agente produz de forma obrigatória. */
  readonly observabilitySignals: readonly string[];

  /** Response Contract — formato estrutural de retorno ao Orchestrator. */
  readonly responseContractFormat: string;

  /** Version — identificador de versão de comportamento do Agente. */
  readonly version: string;

  /** Governance — referência às regras de AI_MANIFESTO.md respeitadas integralmente. */
  readonly governanceReference: string;
}
