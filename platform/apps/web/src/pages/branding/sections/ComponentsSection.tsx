import { useState } from "react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { StatCard } from "@shared/components/StatCard";
import { Alert } from "@shared/components/ui/Alert";
import { Badge } from "@shared/components/ui/Badge";
import { Button } from "@shared/components/ui/Button";
import { Drawer } from "@shared/components/ui/Drawer";
import { DropdownMenu } from "@shared/components/ui/DropdownMenu";
import { Field } from "@shared/components/ui/Field";
import { ProgressBar } from "@shared/components/ui/ProgressBar";
import { Select } from "@shared/components/ui/Select";
import { Skeleton } from "@shared/components/ui/Skeleton";
import { Spinner } from "@shared/components/ui/Spinner";
import { Table } from "@shared/components/ui/Table";
import { Tabs } from "@shared/components/ui/Tabs";
import { useToast } from "@shared/components/ui/toast/useToast";

interface ExampleRow {
  readonly id: string;
  readonly name: string;
}

const EXAMPLE_ROWS: readonly ExampleRow[] = [
  { id: "1", name: "Componente A" },
  { id: "2", name: "Componente B" },
];

/**
 * Componentes (FUN-102) — galeria pura dos componentes já existentes do Design System (UX-001), cada
 * um lendo exclusivamente `var(--color-*)`/`var(--space-*)` (`styles/tokens.css`), então já reagem ao
 * Tema carregado (claro/escuro) sem nenhum código específico desta seção. Nenhum componente novo
 * exclusivo desta Sprint — per a regra explícita da FUN-102 ("nunca criar componentes exclusivos
 * deste módulo").
 */
export function ComponentsSection() {
  const { showToast } = useToast();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("um");

  return (
    <div className="dashboard-section">
      <WidgetCard title="Botões">
        <div className="component-gallery-row">
          <Button variant="primary">Primário</Button>
          <Button variant="secondary">Secundário</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Perigo</Button>
          <Button variant="secondary" size="sm">
            Pequeno
          </Button>
        </div>
      </WidgetCard>

      <WidgetCard title="Badges">
        <div className="component-gallery-row">
          <Badge tone="neutral">Neutro</Badge>
          <Badge tone="primary">Primário</Badge>
          <Badge tone="success">Sucesso</Badge>
          <Badge tone="warning">Aviso</Badge>
          <Badge tone="danger">Erro</Badge>
          <Badge tone="info">Info</Badge>
        </div>
      </WidgetCard>

      <WidgetCard title="Alertas">
        <div className="component-gallery-stack">
          <Alert tone="info">Alerta informativo.</Alert>
          <Alert tone="success">Alerta de sucesso.</Alert>
          <Alert tone="warning">Alerta de aviso.</Alert>
          <Alert tone="danger">Alerta de erro.</Alert>
        </div>
      </WidgetCard>

      <WidgetCard title="Inputs">
        <div className="form-grid">
          <Field label="Campo de texto" placeholder="Digite algo" />
          <Select label="Select">
            <option>Opção 1</option>
            <option>Opção 2</option>
          </Select>
        </div>
      </WidgetCard>

      <WidgetCard title="Cards">
        <div className="dashboard-kpis">
          <StatCard label="Métrica de exemplo" value="42" />
          <StatCard label="Outra métrica" value="128" />
        </div>
      </WidgetCard>

      <WidgetCard title="Tabela">
        <Table columns={[{ key: "name", header: "Nome", render: (row: ExampleRow) => row.name }]} rows={EXAMPLE_ROWS} getRowId={(row) => row.id} />
      </WidgetCard>

      <WidgetCard title="Abas">
        <Tabs label="Exemplo de abas" items={[{ id: "um", label: "Um" }, { id: "dois", label: "Dois" }]} activeId={activeTab} onChange={setActiveTab} />
      </WidgetCard>

      <WidgetCard title="Drawer, Dropdown, Skeleton, Toast, Progresso">
        <div className="component-gallery-row">
          <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
            Abrir Drawer
          </Button>
          <DropdownMenu panelLabel="Menu de exemplo" trigger={(props) => <Button variant="secondary" {...props}>Abrir Dropdown</Button>}>
            <Button variant="ghost" size="sm">
              Item 1
            </Button>
          </DropdownMenu>
          <Button variant="secondary" onClick={() => showToast("info", "Notificação de exemplo.")}>
            Disparar Toast
          </Button>
          <Spinner />
        </div>
        <Skeleton width={160} />
        <ProgressBar value={60} label="Progresso de exemplo" />
      </WidgetCard>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Drawer de exemplo">
        <p>Conteúdo de exemplo dentro do Drawer, usando o mesmo Tema carregado.</p>
      </Drawer>
    </div>
  );
}
