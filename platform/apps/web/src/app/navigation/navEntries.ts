import {
  ArrowRightLeft,
  BarChart3,
  Bot,
  BookOpen,
  Building2,
  Cpu,
  Factory,
  FileText,
  Handshake,
  LayoutDashboard,
  MessageSquare,
  Package,
  Palette,
  Plug,
  Settings2,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Truck,
  Users,
  Wallet,
  Workflow,
  type LucideIcon,
} from "lucide-react";

/**
 * Fonte única de verdade da navegação — Sidebar, Breadcrumb e a definição de rotas
 * (`ApplicationRouter.tsx`) leem exclusivamente deste arquivo, nunca duplicam a lista de módulos.
 *
 * `status: "active"` — o Manager correspondente já está conectado ao Composition Root (sete domínios
 * desde a FUN-001, mais Commerce desde a FUN-104 — em processo, como Communication/Analytics/
 * Automation/Knowledge, nunca via HTTP, ver `core/managers/buildManagers.ts`). `/inventory` (FUN-105)
 * é uma exceção sem Manager próprio — uma nova lente Web sobre o mesmo `CommerceManager`/
 * `["commerce","workspace"]` já conectado por `/commerce`, nunca um domínio novo. `/suppliers`
 * (IMP-205), `/purchases` (IMP-305, substituindo o placeholder FUN-106 sobre `CommerceManager` — ver
 * `IMP_305_PURCHASE_WORKSPACE_REPORT.md`) e `/inventory-movement` (IMP-405) são a exceção oposta:
 * nenhum Manager em processo — `SupplierManager`/`PurchaseManager`/`InventoryMovementManager` rodam em
 * `apps/api` real, consumidos exclusivamente por HTTP via `core/supplier/`/`core/purchase/`/
 * `core/inventory-movement/` (IMP-204/IMP-304/IMP-404), nunca por `core/managers/buildManagers.ts`.
 * `/inventory-movement` é deliberadamente uma rota nova, distinta de `/inventory` (FUN-105, ainda
 * ativa e intocada) — o Inventory Movement Hub (ledger real) e a lente simplificada de `Inventory`
 * sobre `CommerceManager` cobrem escopos apenas parcialmente sobrepostos; ver
 * `IMP_405_INVENTORY_MOVEMENT_WORKSPACE_REPORT.md`. `/production` (IMP-505) é a mesma exceção —
 * `ProductionManager` roda em `apps/api` real, consumido exclusivamente por HTTP via
 * `core/production/` (IMP-504) — rota inteiramente nova, sem placeholder anterior a substituir (nunca
 * existiu uma lente sobre `CommerceManager` para "Produção").
 * `status: "planned"` —
 * o Manager já está mapeado (relatório do FUN-001, Seção 2) mas ainda não conectado; a rota existe
 * (per "preparar estrutura para os demais Managers ainda não utilizados") e aponta para
 * `ComingSoonPage`, nunca para uma página com dado inventado.
 *
 * `icon` (UX-001) — exclusivamente Lucide Icons (regra explícita desta Sprint: "nunca misturar
 * bibliotecas"), um ícone semântico por módulo, nunca decorativo sem relação com o domínio.
 *
 * `category` (UX-002) — agrupamento puramente visual da Sidebar, per "Organização Modular":
 * reforça visualmente a fronteira de responsabilidade de cada módulo (`SupplierHub`/`Commerce`
 * nunca aparecem misturados a `Analytics`/`Automation`), preservando ao mesmo tempo a sensação de
 * ecossistema único — todos os grupos vivem na mesma Sidebar contínua, nunca em telas separadas.
 * Nunca lido por `ApplicationRouter.tsx`/`findNavEntry` — é puramente uma preferência de
 * apresentação da Sidebar (`Sidebar.tsx`), sem nenhum efeito sobre rota ou Manager. "Início"
 * (Dashboard) é renderizado fora de qualquer grupo, sempre primeiro — mesmo lugar que já ocupava
 * antes desta Sprint.
 */
export type NavCategory = "Início" | "Comercial" | "Operação" | "Inteligência" | "Plataforma";

export interface NavEntry {
  readonly path: string;
  readonly label: string;
  readonly status: "active" | "planned";
  readonly icon: LucideIcon;
  readonly category: NavCategory;
}

export const NAV_ENTRIES: readonly NavEntry[] = [
  { path: "/", label: "Dashboard", status: "active", icon: LayoutDashboard, category: "Início" },
  { path: "/business-profile", label: "Perfil Empresarial", status: "active", icon: Building2, category: "Plataforma" },
  { path: "/branding", label: "Branding", status: "active", icon: Palette, category: "Plataforma" },
  { path: "/crm", label: "CRM", status: "active", icon: Users, category: "Comercial" },
  { path: "/communication", label: "Comunicação", status: "active", icon: MessageSquare, category: "Comercial" },
  { path: "/analytics", label: "Analytics", status: "active", icon: BarChart3, category: "Inteligência" },
  { path: "/automation", label: "Automação", status: "active", icon: Workflow, category: "Inteligência" },
  { path: "/knowledge", label: "Conhecimento", status: "active", icon: BookOpen, category: "Inteligência" },
  { path: "/content", label: "Conteúdo", status: "planned", icon: FileText, category: "Comercial" },
  { path: "/growth", label: "Growth", status: "planned", icon: TrendingUp, category: "Comercial" },
  { path: "/commerce", label: "Produtos", status: "active", icon: ShoppingCart, category: "Operação" },
  { path: "/inventory", label: "Estoque", status: "active", icon: Package, category: "Operação" },
  { path: "/inventory-movement", label: "Movimentação de Estoque", status: "active", icon: ArrowRightLeft, category: "Operação" },
  { path: "/production", label: "Produção", status: "active", icon: Factory, category: "Operação" },
  { path: "/purchases", label: "Compras", status: "active", icon: Truck, category: "Operação" },
  { path: "/suppliers", label: "Fornecedores", status: "active", icon: Handshake, category: "Operação" },
  { path: "/finance", label: "Finance", status: "planned", icon: Wallet, category: "Operação" },
  { path: "/ai", label: "Inteligência Artificial", status: "planned", icon: Sparkles, category: "Inteligência" },
  { path: "/integration", label: "Integrações", status: "planned", icon: Plug, category: "Plataforma" },
  { path: "/runtime", label: "Runtime", status: "planned", icon: Cpu, category: "Plataforma" },
  { path: "/ai-agents", label: "Agentes de IA", status: "planned", icon: Bot, category: "Inteligência" },
  { path: "/platform-operations", label: "Operações da Plataforma", status: "planned", icon: Settings2, category: "Plataforma" },
];

export function findNavEntry(pathname: string): NavEntry | undefined {
  return NAV_ENTRIES.find((entry) => entry.path === pathname);
}
