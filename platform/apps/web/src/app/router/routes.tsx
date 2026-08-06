import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { AppLayout } from "@app/layout/AppLayout";
import { ComingSoonPage } from "@/pages/coming-soon/ComingSoonPage";
import { LoginPage } from "@/pages/login/LoginPage";
import { RequireAuth } from "./RequireAuth";

const DashboardPage = lazy(() => import("@/pages/dashboard/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const BusinessProfilePage = lazy(() => import("@/pages/business-profile/BusinessProfilePage").then((m) => ({ default: m.BusinessProfilePage })));
const BrandingPage = lazy(() => import("@/pages/branding/BrandingPage").then((m) => ({ default: m.BrandingPage })));
const CRMPage = lazy(() => import("@/pages/crm/CRMPage").then((m) => ({ default: m.CRMPage })));
const CommunicationPage = lazy(() => import("@/pages/communication/CommunicationPage").then((m) => ({ default: m.CommunicationPage })));
const AnalyticsPage = lazy(() => import("@/pages/analytics/AnalyticsPage").then((m) => ({ default: m.AnalyticsPage })));
const AutomationPage = lazy(() => import("@/pages/automation/AutomationPage").then((m) => ({ default: m.AutomationPage })));
const KnowledgePage = lazy(() => import("@/pages/knowledge/KnowledgePage").then((m) => ({ default: m.KnowledgePage })));
const ProductHubPage = lazy(() => import("@/pages/product-hub/ProductHubPage").then((m) => ({ default: m.ProductHubPage })));
const InventoryPage = lazy(() => import("@/pages/inventory/InventoryPage").then((m) => ({ default: m.InventoryPage })));
const InventoryMovementPage = lazy(() => import("@/pages/inventory-movement/InventoryMovementPage").then((m) => ({ default: m.InventoryMovementPage })));
const ProductionPage = lazy(() => import("@/pages/production/ProductionPage").then((m) => ({ default: m.ProductionPage })));
const FiscalPage = lazy(() => import("@/pages/fiscal/FiscalPage").then((m) => ({ default: m.FiscalPage })));
const PurchasePage = lazy(() => import("@/pages/purchases/PurchasePage").then((m) => ({ default: m.PurchasePage })));
const SupplierPage = lazy(() => import("@/pages/suppliers/SupplierPage").then((m) => ({ default: m.SupplierPage })));

/** Um Manager já mapeado (relatório FUN-001, Seção 2), mas ainda não conectado ao Composition Root — ver `ComingSoonPage`. */
const PLANNED_DOMAINS: ReadonlyArray<{ path: string; label: string; managerName: string; packageName: string }> = [
  { path: "/content", label: "Conteúdo", managerName: "ContentManager", packageName: "@abp/content-hub" },
  { path: "/growth", label: "Growth", managerName: "GrowthManager", packageName: "@abp/growth-hub" },
  { path: "/finance", label: "Finance", managerName: "FinanceManager", packageName: "@abp/finance-hub" },
  { path: "/ai", label: "Inteligência Artificial", managerName: "AIManager", packageName: "@abp/ai" },
  { path: "/integration", label: "Integrações", managerName: "IntegrationManager", packageName: "@abp/platform-services" },
  { path: "/runtime", label: "Runtime", managerName: "RuntimeManager", packageName: "@abp/runtime" },
  { path: "/ai-agents", label: "Agentes de IA", managerName: "AIAgentsManager", packageName: "@abp/ai-agents" },
  { path: "/platform-operations", label: "Operações da Plataforma", managerName: "PlatformOperationsManager", packageName: "@abp/infrastructure" },
];

/**
 * Definição de rotas — extraída de `ApplicationRouter.tsx` para ser reutilizável tanto pela
 * aplicação real (`createBrowserRouter`) quanto pelos testes (`createMemoryRouter`), sem duplicar a
 * árvore de rotas em dois lugares.
 */
export function createAppRoutes(): RouteObject[] {
  return [
    { path: "/login", element: <LoginPage /> },
    {
      path: "/",
      element: (
        <RequireAuth>
          <AppLayout />
        </RequireAuth>
      ),
      children: [
        { index: true, element: <DashboardPage /> },
        { path: "business-profile", element: <BusinessProfilePage /> },
        { path: "branding", element: <BrandingPage /> },
        { path: "crm", element: <CRMPage /> },
        { path: "communication", element: <CommunicationPage /> },
        { path: "analytics", element: <AnalyticsPage /> },
        { path: "automation", element: <AutomationPage /> },
        { path: "knowledge", element: <KnowledgePage /> },
        { path: "commerce", element: <ProductHubPage /> },
        { path: "inventory", element: <InventoryPage /> },
        { path: "inventory-movement", element: <InventoryMovementPage /> },
        { path: "production", element: <ProductionPage /> },
        { path: "fiscal", element: <FiscalPage /> },
        { path: "purchases", element: <PurchasePage /> },
        { path: "suppliers", element: <SupplierPage /> },
        ...PLANNED_DOMAINS.map((domain) => ({
          path: domain.path.slice(1),
          element: <ComingSoonPage domainLabel={domain.label} managerName={domain.managerName} packageName={domain.packageName} />,
        })),
      ],
    },
  ];
}
