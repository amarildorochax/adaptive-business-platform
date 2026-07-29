/**
 * Workflow Library Entry — o registro de um Workflow no catálogo central de todos os Workflows
 * disponíveis na plataforma, tanto os modelos genéricos oferecidos nativamente quanto os Workflows
 * específicos configurados por cada empresa, consultado pelo Feature Advisor e pelo Automation
 * Selector do Business Profile Engine para produzir recomendação de automação
 * (`AUTOMATION_ENGINE.md`, Capítulo 7).
 * Estrutura definida em `AUTOMATION_ENGINE.md`, Capítulo 7.
 */
export interface WorkflowLibraryEntry {
  /** Workflow catalogado. */
  readonly workflowId: string;

  /** Se este é um modelo genérico nativo da plataforma, em vez de um Workflow específico de uma Empresa. */
  readonly native: boolean;

  /** Tenant proprietário, quando não nativo. */
  readonly tenantId?: string;

  /** Momento do registro no catálogo. */
  readonly registeredAt: Date;
}
