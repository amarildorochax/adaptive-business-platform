import {
  AccessibilityValidatorService,
  BrandThemeService,
  BrandingManager,
  DesignTokenService,
  LogoService,
} from "@abp/branding";
import {
  FakeBrandThemeRepository,
  FakeDesignTokenRepository,
  FakeLogoRepository,
} from "@abp/branding/testing";
import {
  BusinessClassificationService,
  BusinessMaturityService,
  BusinessProfileLifecycleService,
  BusinessProfileManager,
  BusinessProfileService,
} from "@abp/business-profile";
import {
  FakeBusinessClassificationRecordRepository,
  FakeBusinessProfileLifecycleStateRepository,
  FakeBusinessProfileRepository,
  FakeMaturityRecordRepository,
} from "@abp/business-profile/testing";
import {
  CRMManager,
  ContactService,
  CustomerService,
  LeadService,
  OpportunityService,
  OrganizationService,
  RelationshipService,
  TimelineEventService,
} from "@abp/crm-hub";
import {
  FakeContactRepository,
  FakeCustomerRepository,
  FakeLeadRepository,
  FakeOpportunityRepository,
  FakeOrganizationRepository,
  FakeRelationshipRepository,
  FakeTimelineEventRepository,
} from "@abp/crm-hub/testing";
import {
  FiscalDocumentIssuanceService,
  FiscalManager,
  FiscalObligationTrackingService,
  TaxCalculationService,
  TaxRegimeService,
  TaxRuleService,
} from "@abp/fiscal-hub";
import {
  FakeFiscalDocumentRepository,
  FakeFiscalObligationRepository,
  FakeTaxRegimeRepository,
  FakeTaxRuleRepository,
} from "@abp/fiscal-hub/testing";
import {
  AccessAuditService,
  AuthenticationService,
  AuthorizationService,
  CredentialService,
  IAMManager,
  ProfileService,
  RolePermissionService,
  SecurityContextService,
  SessionService,
} from "@abp/platform-services";
import {
  FakeAccessAuditRecordRepository,
  FakeAccessTokenRepository,
  FakeCredentialRepository,
  FakeProfileRepository,
  FakeRolePermissionRepository,
  FakeSessionRepository,
} from "@abp/platform-services/testing";
import {
  InventoryMovementManager,
  StockAlertEvaluationService,
  StockLocationService,
  StockMovementRecordingService,
  StockPositionProjectionService,
  StockReservationService,
  type StockAlertRuleRepository,
  type StockLocationRepository,
  type StockMovementRepository,
  type StockPositionRepository,
  type StockReservationRepository,
} from "@abp/inventory-movement-hub";
import {
  FakeStockAlertRuleRepository,
  FakeStockLocationRepository,
  FakeStockMovementRepository,
  FakeStockPositionRepository,
  FakeStockReservationRepository,
} from "@abp/inventory-movement-hub/testing";
import {
  BillOfMaterialsService,
  ProductionExecutionService,
  ProductionManager,
  WorkCenterService,
} from "@abp/production-hub";
import {
  FakeBillOfMaterialsRepository,
  FakeProductionOrderRepository,
  FakeWorkCenterRepository,
} from "@abp/production-hub/testing";
import {
  PurchaseManager,
  PurchaseOrderService,
  PurchaseRequisitionService,
  ReceivingService,
  ReorderEvaluationService,
} from "@abp/purchase-hub";
import {
  SupplierCatalogService,
  SupplierContractService,
  SupplierManager,
  SupplierPerformanceService,
  SupplierService,
} from "@abp/supplier-hub";
import {
  FakeSupplierCatalogItemRepository,
  FakeSupplierContractRepository,
  FakeSupplierPerformanceRepository,
  FakeSupplierRepository,
} from "@abp/supplier-hub/testing";
import {
  FakePurchaseOrderRepository,
  FakePurchaseRequisitionRepository,
  FakeReceivingRepository,
  FakeReorderRuleRepository,
} from "@abp/purchase-hub/testing";
import type { DatabaseHandle } from "../db/client.js";
import { SqliteBrandThemeRepository } from "../repositories/branding/SqliteBrandThemeRepository.js";
import { SqliteDesignTokenRepository } from "../repositories/branding/SqliteDesignTokenRepository.js";
import { SqliteLogoRepository } from "../repositories/branding/SqliteLogoRepository.js";
import { SqliteBusinessClassificationRecordRepository } from "../repositories/business-profile/SqliteBusinessClassificationRecordRepository.js";
import { SqliteBusinessProfileLifecycleStateRepository } from "../repositories/business-profile/SqliteBusinessProfileLifecycleStateRepository.js";
import { SqliteBusinessProfileRepository } from "../repositories/business-profile/SqliteBusinessProfileRepository.js";
import { SqliteMaturityRecordRepository } from "../repositories/business-profile/SqliteMaturityRecordRepository.js";
import { SqliteContactRepository } from "../repositories/crm/SqliteContactRepository.js";
import { SqliteFiscalDocumentRepository } from "../repositories/fiscal/SqliteFiscalDocumentRepository.js";
import { SqliteFiscalObligationRepository } from "../repositories/fiscal/SqliteFiscalObligationRepository.js";
import { SqliteTaxRegimeRepository } from "../repositories/fiscal/SqliteTaxRegimeRepository.js";
import { SqliteTaxRuleRepository } from "../repositories/fiscal/SqliteTaxRuleRepository.js";
import { SqliteCustomerRepository } from "../repositories/crm/SqliteCustomerRepository.js";
import { SqliteLeadRepository } from "../repositories/crm/SqliteLeadRepository.js";
import { SqliteOpportunityRepository } from "../repositories/crm/SqliteOpportunityRepository.js";
import { SqliteOrganizationRepository } from "../repositories/crm/SqliteOrganizationRepository.js";
import { SqliteRelationshipRepository } from "../repositories/crm/SqliteRelationshipRepository.js";
import { SqliteTimelineEventRepository } from "../repositories/crm/SqliteTimelineEventRepository.js";
import { SqliteAccessAuditRecordRepository } from "../repositories/iam/SqliteAccessAuditRecordRepository.js";
import { SqliteAccessTokenRepository } from "../repositories/iam/SqliteAccessTokenRepository.js";
import { SqliteCredentialRepository } from "../repositories/iam/SqliteCredentialRepository.js";
import { SqliteProfileRepository } from "../repositories/iam/SqliteProfileRepository.js";
import { SqliteRolePermissionRepository } from "../repositories/iam/SqliteRolePermissionRepository.js";
import { SqliteSessionRepository } from "../repositories/iam/SqliteSessionRepository.js";
import { SqliteStockAlertRuleRepository } from "../repositories/inventory-movement/SqliteStockAlertRuleRepository.js";
import { SqliteStockLocationRepository } from "../repositories/inventory-movement/SqliteStockLocationRepository.js";
import { SqliteStockMovementRepository } from "../repositories/inventory-movement/SqliteStockMovementRepository.js";
import { SqliteStockPositionRepository } from "../repositories/inventory-movement/SqliteStockPositionRepository.js";
import { SqliteStockReservationRepository } from "../repositories/inventory-movement/SqliteStockReservationRepository.js";
import { SqliteBillOfMaterialsRepository } from "../repositories/production/SqliteBillOfMaterialsRepository.js";
import { SqliteProductionOrderRepository } from "../repositories/production/SqliteProductionOrderRepository.js";
import { SqliteWorkCenterRepository } from "../repositories/production/SqliteWorkCenterRepository.js";
import { SqlitePurchaseOrderRepository } from "../repositories/purchase/SqlitePurchaseOrderRepository.js";
import { SqlitePurchaseRequisitionRepository } from "../repositories/purchase/SqlitePurchaseRequisitionRepository.js";
import { SqliteReceivingRepository } from "../repositories/purchase/SqliteReceivingRepository.js";
import { SqliteReorderRuleRepository } from "../repositories/purchase/SqliteReorderRuleRepository.js";
import { SqliteSupplierCatalogItemRepository } from "../repositories/supplier/SqliteSupplierCatalogItemRepository.js";
import { SqliteSupplierContractRepository } from "../repositories/supplier/SqliteSupplierContractRepository.js";
import { SqliteSupplierPerformanceRepository } from "../repositories/supplier/SqliteSupplierPerformanceRepository.js";
import { SqliteSupplierRepository } from "../repositories/supplier/SqliteSupplierRepository.js";

export type RepositoryMode = "fake" | "real";

export interface ManagerRegistry {
  readonly businessProfile: BusinessProfileManager;
  readonly branding: BrandingManager;
  readonly crm: CRMManager;
  readonly iam: IAMManager;
  readonly supplier: SupplierManager;
  readonly purchase: PurchaseManager;
  readonly inventoryMovement: InventoryMovementManager;
  readonly production: ProductionManager;
  readonly fiscal: FiscalManager;
}

/**
 * Composition Root centralizada desde a FUN-003 — o único lugar de todo o pacote onde
 * `mode === 'real'` é testado. Nenhum outro arquivo — nem os Managers, nem os Services, nem nenhum
 * Repository — contém uma condicional Fake/Real; per a instrução explícita da FUN-003, "nunca
 * espalhar condicionais pelo sistema".
 *
 * `handle` é exigido apenas quando `mode === 'real'` — em `mode === 'fake'`, nenhuma conexão de
 * banco é sequer construída, preservando exatamente o mesmo custo de inicialização já usado pelos
 * testes existentes que dependem de Fakes.
 *
 * Escopo: Business Profile, Branding, CRM (FUN-003), IAM Core (FUN-100), Supplier Hub (IMP-202),
 * Purchase Hub (IMP-302), Inventory Movement Hub (IMP-402), Production Hub (IMP-502) e, desde a
 * IMP-602, Fiscal Hub — as quarenta Repository Interfaces destes nove domínios já possuem
 * implementação real (`../repositories`); os demais domínios permanecem exclusivamente Fake, nunca
 * antecipados aqui. Finance Hub (`@abp/finance-hub`) não é um desses nove domínios — nunca foi
 * incorporado a este Composition Root, em nenhuma Sprint, Fake ou real; Fiscal Hub não depende dele
 * e não o afeta. (Comentário desatualizado desde IMP-202, que já havia adicionado Supplier Hub sem
 * revisar esta contagem — corrigido pela IMP-402, novamente pela IMP-502, e novamente por esta Sprint
 * ao tocar este mesmo bloco.)
 *
 * `inventoryMovement` é o primeiro Manager cuja construção Fake não cabe em um único `mode === "real"
 * ? new Sqlite... : new Fake..." por linha — `FakeStockPositionRepository` (`@abp/inventory-movement-hub/testing`)
 * exige, apenas em modo teste, uma referência concreta às instâncias Fake de Movement/Reservation para
 * poder recalcular a posição em memória (documentado em `InventoryMovementManager.test.ts`, Core,
 * como "liberdade exclusiva de teste"); por isso a construção de suas cinco Repository abaixo usa um
 * bloco `if (mode === "real") {...} else {...}` em vez do padrão ternário-por-linha do restante deste
 * arquivo — mesmo resultado, forma diferente, decisão documentada em
 * `IMP_402_INVENTORY_MOVEMENT_PERSISTENCE_REPORT.md`.
 */
export function createManagerRegistry(mode: RepositoryMode, handle?: DatabaseHandle): ManagerRegistry {
  if (mode === "real" && !handle) {
    throw new Error("createManagerRegistry('real', handle) exige uma DatabaseHandle — ver createDatabase().");
  }

  const businessProfile =
    mode === "real"
      ? new BusinessProfileManager({
          profiles: new BusinessProfileService(new SqliteBusinessProfileRepository(handle!.db)),
          classification: new BusinessClassificationService(new SqliteBusinessClassificationRecordRepository(handle!.db)),
          maturity: new BusinessMaturityService(new SqliteMaturityRecordRepository(handle!.db)),
          lifecycle: new BusinessProfileLifecycleService(new SqliteBusinessProfileLifecycleStateRepository(handle!.db)),
        })
      : new BusinessProfileManager({
          profiles: new BusinessProfileService(new FakeBusinessProfileRepository()),
          classification: new BusinessClassificationService(new FakeBusinessClassificationRecordRepository()),
          maturity: new BusinessMaturityService(new FakeMaturityRecordRepository()),
          lifecycle: new BusinessProfileLifecycleService(new FakeBusinessProfileLifecycleStateRepository()),
        });

  const branding =
    mode === "real"
      ? new BrandingManager({
          logos: new LogoService(new SqliteLogoRepository(handle!.db)),
          tokens: new DesignTokenService(new SqliteDesignTokenRepository(handle!.db), new AccessibilityValidatorService()),
          themes: new BrandThemeService(new SqliteBrandThemeRepository(handle!.db)),
          accessibility: new AccessibilityValidatorService(),
          businessProfile,
        })
      : new BrandingManager({
          logos: new LogoService(new FakeLogoRepository()),
          tokens: new DesignTokenService(new FakeDesignTokenRepository(), new AccessibilityValidatorService()),
          themes: new BrandThemeService(new FakeBrandThemeRepository()),
          accessibility: new AccessibilityValidatorService(),
          businessProfile,
        });

  const crm =
    mode === "real"
      ? new CRMManager({
          leads: new LeadService(new SqliteLeadRepository(handle!.db)),
          customers: new CustomerService(new SqliteCustomerRepository(handle!.db)),
          organizations: new OrganizationService(new SqliteOrganizationRepository(handle!.db)),
          contacts: new ContactService(new SqliteContactRepository(handle!.db)),
          relationships: new RelationshipService(new SqliteRelationshipRepository(handle!.db)),
          opportunities: new OpportunityService(new SqliteOpportunityRepository(handle!.db)),
          timeline: new TimelineEventService(new SqliteTimelineEventRepository(handle!.db)),
        })
      : new CRMManager({
          leads: new LeadService(new FakeLeadRepository()),
          customers: new CustomerService(new FakeCustomerRepository()),
          organizations: new OrganizationService(new FakeOrganizationRepository()),
          contacts: new ContactService(new FakeContactRepository()),
          relationships: new RelationshipService(new FakeRelationshipRepository()),
          opportunities: new OpportunityService(new FakeOpportunityRepository()),
          timeline: new TimelineEventService(new FakeTimelineEventRepository()),
        });

  const credentials = new CredentialService(mode === "real" ? new SqliteCredentialRepository(handle!.db) : new FakeCredentialRepository());
  const profiles = new ProfileService(mode === "real" ? new SqliteProfileRepository(handle!.db) : new FakeProfileRepository());
  const rolePermissions = new RolePermissionService(mode === "real" ? new SqliteRolePermissionRepository(handle!.db) : new FakeRolePermissionRepository());
  const sessions = new SessionService(
    mode === "real" ? new SqliteSessionRepository(handle!.db) : new FakeSessionRepository(),
    mode === "real" ? new SqliteAccessTokenRepository(handle!.db) : new FakeAccessTokenRepository(),
  );
  const audit = new AccessAuditService(mode === "real" ? new SqliteAccessAuditRecordRepository(handle!.db) : new FakeAccessAuditRecordRepository());

  const iam = new IAMManager({
    credentials,
    authentication: new AuthenticationService(credentials),
    profiles,
    rolePermissions,
    authorization: new AuthorizationService(profiles, rolePermissions),
    sessions,
    securityContext: new SecurityContextService(sessions, profiles),
    audit,
  });

  const supplierRepository = mode === "real" ? new SqliteSupplierRepository(handle!.db) : new FakeSupplierRepository();
  const supplier = new SupplierManager({
    suppliers: new SupplierService(supplierRepository),
    catalog: new SupplierCatalogService(
      mode === "real" ? new SqliteSupplierCatalogItemRepository(handle!.db) : new FakeSupplierCatalogItemRepository(),
      supplierRepository,
    ),
    contracts: new SupplierContractService(mode === "real" ? new SqliteSupplierContractRepository(handle!.db) : new FakeSupplierContractRepository()),
    performance: new SupplierPerformanceService(
      mode === "real" ? new SqliteSupplierPerformanceRepository(handle!.db) : new FakeSupplierPerformanceRepository(),
    ),
  });

  const purchaseOrderRepository = mode === "real" ? new SqlitePurchaseOrderRepository(handle!.db) : new FakePurchaseOrderRepository();
  const requisitionRepository = mode === "real" ? new SqlitePurchaseRequisitionRepository(handle!.db) : new FakePurchaseRequisitionRepository();
  const purchase = new PurchaseManager({
    orders: new PurchaseOrderService(purchaseOrderRepository),
    receiving: new ReceivingService(
      mode === "real" ? new SqliteReceivingRepository(handle!.db) : new FakeReceivingRepository(),
      purchaseOrderRepository,
    ),
    requisitions: new PurchaseRequisitionService(requisitionRepository, purchaseOrderRepository),
    reorder: new ReorderEvaluationService(
      mode === "real" ? new SqliteReorderRuleRepository(handle!.db) : new FakeReorderRuleRepository(),
      requisitionRepository,
    ),
  });

  let stockMovementRepository: StockMovementRepository;
  let stockReservationRepository: StockReservationRepository;
  let stockPositionRepository: StockPositionRepository;
  let stockLocationRepository: StockLocationRepository;
  let stockAlertRuleRepository: StockAlertRuleRepository;

  if (mode === "real") {
    stockMovementRepository = new SqliteStockMovementRepository(handle!.db);
    stockReservationRepository = new SqliteStockReservationRepository(handle!.db);
    stockPositionRepository = new SqliteStockPositionRepository(handle!.db);
    stockLocationRepository = new SqliteStockLocationRepository(handle!.db);
    stockAlertRuleRepository = new SqliteStockAlertRuleRepository(handle!.db);
  } else {
    const fakeMovements = new FakeStockMovementRepository();
    const fakeReservations = new FakeStockReservationRepository();
    stockMovementRepository = fakeMovements;
    stockReservationRepository = fakeReservations;
    stockPositionRepository = new FakeStockPositionRepository(fakeMovements, fakeReservations);
    stockLocationRepository = new FakeStockLocationRepository();
    stockAlertRuleRepository = new FakeStockAlertRuleRepository();
  }

  const inventoryMovement = new InventoryMovementManager({
    movements: new StockMovementRecordingService(stockMovementRepository),
    positions: new StockPositionProjectionService(stockPositionRepository),
    reservations: new StockReservationService(stockReservationRepository, stockPositionRepository, stockMovementRepository),
    alerts: new StockAlertEvaluationService(stockAlertRuleRepository),
    locations: new StockLocationService(stockLocationRepository),
  });

  const billOfMaterialsRepository = mode === "real" ? new SqliteBillOfMaterialsRepository(handle!.db) : new FakeBillOfMaterialsRepository();
  const production = new ProductionManager({
    billsOfMaterials: new BillOfMaterialsService(billOfMaterialsRepository),
    execution: new ProductionExecutionService(
      mode === "real" ? new SqliteProductionOrderRepository(handle!.db) : new FakeProductionOrderRepository(),
      billOfMaterialsRepository,
    ),
    workCenters: new WorkCenterService(mode === "real" ? new SqliteWorkCenterRepository(handle!.db) : new FakeWorkCenterRepository()),
  });

  const taxRuleRepository = mode === "real" ? new SqliteTaxRuleRepository(handle!.db) : new FakeTaxRuleRepository();
  const fiscal = new FiscalManager({
    taxRegimes: new TaxRegimeService(mode === "real" ? new SqliteTaxRegimeRepository(handle!.db) : new FakeTaxRegimeRepository()),
    taxRules: new TaxRuleService(taxRuleRepository),
    taxCalculation: new TaxCalculationService(taxRuleRepository),
    documents: new FiscalDocumentIssuanceService(
      mode === "real" ? new SqliteFiscalDocumentRepository(handle!.db) : new FakeFiscalDocumentRepository(),
    ),
    obligations: new FiscalObligationTrackingService(
      mode === "real" ? new SqliteFiscalObligationRepository(handle!.db) : new FakeFiscalObligationRepository(),
    ),
  });

  return { businessProfile, branding, crm, iam, supplier, purchase, inventoryMovement, production, fiscal };
}
