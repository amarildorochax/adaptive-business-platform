import {
  AttachmentService,
  ConversationAssignmentService,
  ConversationService,
  DeliveryService,
  CommunicationManager,
  MessageService,
  ParticipantService,
} from "@abp/communication-hub";
import {
  FakeAttachmentRepository,
  FakeConversationAssignmentRepository,
  FakeConversationRepository,
  FakeDeliveryRepository,
  FakeMessageRepository,
  FakeParticipantRepository,
} from "@abp/communication-hub/testing";
import {
  AggregationService,
  AnalyticalRecommendationService,
  AnalyticsEventIngestionService,
  AnalyticsManager,
  DashboardService,
  DatasetService,
  ForecastService,
  InsightService,
  KPIService,
  MetricService,
  ReportService,
  ReportTemplateService,
  SnapshotService,
  TimeSeriesService,
  TrendService,
  VisualizationService,
  WidgetService,
} from "@abp/analytics-hub";
import {
  FakeAggregationRepository,
  FakeAnalyticalRecommendationRepository,
  FakeAnalyticsEventIngestionRepository,
  FakeDashboardRepository,
  FakeDatasetRepository,
  FakeForecastRepository,
  FakeInsightRepository,
  FakeKPIRepository,
  FakeMetricRepository,
  FakeReportRepository,
  FakeReportTemplateRepository,
  FakeSnapshotRepository,
  FakeTimeSeriesRepository,
  FakeTrendRepository,
  FakeVisualizationRepository,
  FakeWidgetRepository,
} from "@abp/analytics-hub/testing";
import {
  ActionService,
  AuditRecordService,
  AutomationManager,
  ConditionExpressionService,
  ConditionService,
  DeadLetterEntryService,
  ExecutionHistoryRecordService,
  ExecutionService,
  ExecutionStepService,
  RetryAttemptService,
  RetryPolicyService,
  ScheduleDefinitionService,
  TriggerService,
  WorkflowBranchService,
  WorkflowService,
  WorkflowValidationService,
  WorkflowVersionService,
} from "@abp/automation-engine";
import {
  FakeActionRepository,
  FakeAuditRecordRepository,
  FakeConditionExpressionRepository,
  FakeConditionRepository,
  FakeDeadLetterEntryRepository,
  FakeExecutionHistoryRecordRepository,
  FakeExecutionRepository,
  FakeExecutionStepRepository,
  FakeRetryAttemptRepository,
  FakeRetryPolicyRepository,
  FakeScheduleDefinitionRepository,
  FakeTriggerRepository,
  FakeWorkflowBranchRepository,
  FakeWorkflowRepository,
  FakeWorkflowValidationResultRepository,
  FakeWorkflowVersionRepository,
} from "@abp/automation-engine/testing";
import {
  KnowledgeAssetService,
  KnowledgeIndexService,
  KnowledgeLifecycleService,
  KnowledgeManager,
  KnowledgeSearchService,
  KnowledgeVersionService,
} from "@abp/platform-services";
import {
  FakeIndexEntryRepository,
  FakeKnowledgeAssetRepository,
  FakeKnowledgeLifecycleStateRepository,
  FakeKnowledgeVersionRepository,
} from "@abp/platform-services/testing";
import {
  CartItemService,
  CartService,
  CatalogService,
  CategoryService,
  CommerceManager,
  CouponService,
  DiscountService,
  InventoryService,
  OrderItemService,
  OrderService,
  PriceService,
  ProductService,
  VariantService,
} from "@abp/commerce-hub";
import {
  FakeCartItemRepository,
  FakeCartRepository,
  FakeCatalogRepository,
  FakeCategoryRepository,
  FakeCouponRepository,
  FakeDiscountRepository,
  FakeInventoryRepository,
  FakeOrderItemRepository,
  FakeOrderRepository,
  FakePriceRepository,
  FakeProductRepository,
  FakeVariantRepository,
} from "@abp/commerce-hub/testing";

/**
 * Composição dos Managers de domínio ainda consumidos em processo pelo Frontend — desde a FUN-005,
 * Business Profile, Branding e CRM saíram desta composição (consumidos via `core/http/clients/*`,
 * HTTP real, `apps/api`). Communication, Analytics, Automation e Knowledge continuam em processo,
 * nenhuma API própria existe ainda para eles.
 *
 * `commerce` (FUN-104) é o quinto Manager em processo, adicionado nesta Sprint — não um domínio
 * novo: `CommerceManager`/os doze Services/as doze Repository Interfaces já existiam desde a IMP-006
 * (`@abp/commerce-hub`), e `apps/web` já declarava a dependência em `package.json`/`tsconfig.json`
 * desde então, nunca efetivamente importada até agora. Igual a Business Profile/Branding/CRM antes
 * da FUN-005, o Commerce Hub nunca ganhou nenhuma rota HTTP em `apps/api` — nenhuma Sprint estendeu
 * `@abp/persistence` para ele. Diferente daqueles três, portanto, não há como "migrar para HTTP": a
 * única forma de o Product Hub Workspace (FUN-104) mostrar qualquer dado real é exatamente o mesmo
 * padrão já em uso por Communication/Analytics/Automation/Knowledge desde a FUN-001 — compor o
 * Manager já existente aqui, sobre os Fakes em memória de `src/testing/InMemoryFakes.ts`, nunca
 * apresentado como persistência real. Nenhum Manager/Service/Repository Interface foi criado por
 * esta Sprint — todos já existiam; apenas a composição em `apps/web` é nova.
 */
export interface ManagerRegistry {
  readonly communication: CommunicationManager;
  readonly analytics: AnalyticsManager;
  readonly automation: AutomationManager;
  readonly knowledge: KnowledgeManager;
  readonly commerce: CommerceManager;
}

export function buildManagers(): ManagerRegistry {
  const communication = new CommunicationManager({
    conversations: new ConversationService(new FakeConversationRepository()),
    messages: new MessageService(new FakeMessageRepository()),
    attachments: new AttachmentService(new FakeAttachmentRepository()),
    participants: new ParticipantService(new FakeParticipantRepository()),
    assignments: new ConversationAssignmentService(new FakeConversationAssignmentRepository()),
    deliveries: new DeliveryService(new FakeDeliveryRepository()),
  });

  const analyticsMetrics = new FakeMetricRepository();
  const analytics = new AnalyticsManager({
    datasets: new DatasetService(new FakeDatasetRepository()),
    eventIngestions: new AnalyticsEventIngestionService(new FakeAnalyticsEventIngestionRepository()),
    aggregations: new AggregationService(new FakeAggregationRepository()),
    metrics: new MetricService(analyticsMetrics),
    kpis: new KPIService(new FakeKPIRepository(), analyticsMetrics),
    dashboards: new DashboardService(new FakeDashboardRepository()),
    widgets: new WidgetService(new FakeWidgetRepository()),
    snapshots: new SnapshotService(new FakeSnapshotRepository()),
    timeSeries: new TimeSeriesService(new FakeTimeSeriesRepository()),
    trends: new TrendService(new FakeTrendRepository()),
    forecasts: new ForecastService(new FakeForecastRepository()),
    insights: new InsightService(new FakeInsightRepository()),
    recommendations: new AnalyticalRecommendationService(new FakeAnalyticalRecommendationRepository()),
    reportTemplates: new ReportTemplateService(new FakeReportTemplateRepository()),
    reports: new ReportService(new FakeReportRepository()),
    visualizations: new VisualizationService(new FakeVisualizationRepository()),
  });

  const automationTriggers = new FakeTriggerRepository();
  const automationActions = new FakeActionRepository();
  const automation = new AutomationManager({
    workflows: new WorkflowService(new FakeWorkflowRepository()),
    workflowVersions: new WorkflowVersionService(new FakeWorkflowVersionRepository()),
    workflowBranches: new WorkflowBranchService(new FakeWorkflowBranchRepository()),
    workflowValidation: new WorkflowValidationService(new FakeWorkflowValidationResultRepository(), automationTriggers, automationActions),
    triggers: new TriggerService(automationTriggers),
    schedules: new ScheduleDefinitionService(new FakeScheduleDefinitionRepository()),
    conditions: new ConditionService(new FakeConditionRepository()),
    conditionExpressions: new ConditionExpressionService(new FakeConditionExpressionRepository()),
    actions: new ActionService(automationActions),
    retryPolicies: new RetryPolicyService(new FakeRetryPolicyRepository()),
    executions: new ExecutionService(new FakeExecutionRepository()),
    executionSteps: new ExecutionStepService(new FakeExecutionStepRepository()),
    retryAttempts: new RetryAttemptService(new FakeRetryAttemptRepository()),
    executionHistory: new ExecutionHistoryRecordService(new FakeExecutionHistoryRecordRepository()),
    deadLetter: new DeadLetterEntryService(new FakeDeadLetterEntryRepository()),
    audit: new AuditRecordService(new FakeAuditRecordRepository()),
  });

  const knowledgeAssets = new FakeKnowledgeAssetRepository();
  const knowledgeIndex = new FakeIndexEntryRepository();
  const knowledge = new KnowledgeManager({
    assets: new KnowledgeAssetService(knowledgeAssets),
    lifecycle: new KnowledgeLifecycleService(new FakeKnowledgeLifecycleStateRepository()),
    versions: new KnowledgeVersionService(new FakeKnowledgeVersionRepository()),
    index: new KnowledgeIndexService(knowledgeIndex),
    search: new KnowledgeSearchService(knowledgeAssets, knowledgeIndex),
  });

  const commerce = new CommerceManager({
    products: new ProductService(new FakeProductRepository()),
    variants: new VariantService(new FakeVariantRepository()),
    catalogs: new CatalogService(new FakeCatalogRepository()),
    categories: new CategoryService(new FakeCategoryRepository()),
    prices: new PriceService(new FakePriceRepository()),
    discounts: new DiscountService(new FakeDiscountRepository()),
    coupons: new CouponService(new FakeCouponRepository()),
    carts: new CartService(new FakeCartRepository()),
    cartItems: new CartItemService(new FakeCartItemRepository()),
    orders: new OrderService(new FakeOrderRepository()),
    orderItems: new OrderItemService(new FakeOrderItemRepository()),
    inventory: new InventoryService(new FakeInventoryRepository()),
  });

  return { communication, analytics, automation, knowledge, commerce };
}
