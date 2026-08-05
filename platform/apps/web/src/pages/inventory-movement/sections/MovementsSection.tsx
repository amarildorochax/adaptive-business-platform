import { useState } from "react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Alert } from "@shared/components/ui/Alert";
import { Button } from "@shared/components/ui/Button";
import { Field } from "@shared/components/ui/Field";
import { MovementBadge } from "@shared/components/ui/MovementBadge";
import { Table, type TableColumn } from "@shared/components/ui/Table";
import type { StockMovementResponseDto } from "@core/inventory-movement/inventoryMovement.dto";
import { useStockMovementsByProduct } from "@core/inventory-movement/useStockMovementsByProduct";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function totalDelta(rows: readonly StockMovementResponseDto[]): number {
  return rows.reduce((sum, row) => sum + row.quantityDelta, 0);
}

/**
 * Movimentações (IMP-405) — o ledger completo, por Produto. `GET /stock-movements/by-product/:productId`
 * (`core/inventory-movement/`, IMP-404) exige um `productId` conhecido — não existe "listar todas as
 * movimentações da Empresa" no domínio (`INVENTORY_MOVEMENT_HUB.md`, um ledger é consultado por
 * Produto/referência, nunca "por completo"); esta seção reflete essa realidade honestamente com um
 * campo de busca antes da tabela, nunca uma lista pré-carregada fictícia. `useStockMovementsByProduct`
 * já devolve os movimentos em ordem cronológica real (`SqliteStockMovementRepository.findByProduct`,
 * `ORDER BY occurred_at ASC`, IMP-402) — a soma exibida (`totalDelta`) é uma verificação honesta de
 * integridade, nunca um recálculo de saldo (a Persistência já fez essa soma real; este total é apenas
 * a mesma soma repetida sobre o dado já recebido, para conferência visual, nunca uma fonte de
 * verdade paralela à Stock Position real — ver `PositionsSection.tsx`).
 *
 * **Princípio do Ledger, reforçado nesta camada**: a tabela nunca recebe `rowActions` — não existe
 * nenhuma ação de linha a oferecer, porque nenhum Command de edição/exclusão/substituição de Stock
 * Movement existe em nenhuma camada já construída (Core/Persistência/HTTP/Frontend, IMP-401/402/403/404).
 * A ausência de uma coluna de ações não é uma omissão desta Sprint — é a ausência estrutural do
 * próprio domínio, tornada visível na interface.
 *
 * **Sem botão secundário "Nova Movimentação" — achado real de auditoria (Passo 1), corrigido nesta
 * Sprint.** A primeira versão desta seção desenhava, ao lado de "Consultar Movimentações", um segundo
 * botão com o mesmo nome acessível do `PageHeader.actions` (`InventoryMovementPage.tsx`) — mesma
 * ambiguidade de nome acessível já documentada e corrigida em `OverviewSection.tsx` (o `Drawer` nunca
 * desmonta o conteúdo por trás de si, então os dois botões "Nova Movimentação" ficavam simultaneamente
 * no DOM). Removido, mesma disciplina do Purchase Workspace: a Ação Rápida do `PageHeader` já cobre
 * esta necessidade em qualquer aba, um segundo gatilho local é redundante.
 */
export function MovementsSection({
  onLogged,
}: {
  readonly onLogged: (message: string) => void;
}) {
  const [productId, setProductId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [searchedProductId, setSearchedProductId] = useState<string | undefined>(undefined);

  const movements = useStockMovementsByProduct(searchedProductId, locationId.trim() || undefined);

  function search() {
    if (!productId.trim()) {
      return;
    }
    setSearchedProductId(productId.trim());
    onLogged(`Histórico de movimentações consultado para o Produto ${productId.trim().slice(0, 8)}.`);
  }

  const columns: readonly TableColumn<StockMovementResponseDto>[] = [
    { key: "movementId", header: "Movimento", render: (row) => row.movementId.slice(0, 8), sortValue: (row) => row.movementId },
    { key: "origin", header: "Origem", render: (row) => <MovementBadge origin={row.origin} quantityDelta={row.quantityDelta} /> },
    { key: "quantityDelta", header: "Quantidade", render: (row) => `${row.quantityDelta > 0 ? "+" : ""}${row.quantityDelta}`, sortValue: (row) => row.quantityDelta },
    { key: "locationId", header: "Localização", render: (row) => row.locationId?.slice(0, 8) ?? "—" },
    { key: "originReferenceId", header: "Referência de origem", render: (row) => row.originReferenceId?.slice(0, 8) ?? "—" },
    { key: "occurredAt", header: "Ocorrido em", render: (row) => formatDateTime(row.occurredAt), sortValue: (row) => row.occurredAt },
  ];

  return (
    <div className="dashboard-section">
      <WidgetCard title="Consultar o ledger de um Produto">
        <div className="form-grid">
          <Field label="Identificador do Produto" value={productId} onChange={(event) => setProductId(event.target.value)} placeholder="Ex.: product-123" />
          <Field label="Localização (opcional)" value={locationId} onChange={(event) => setLocationId(event.target.value)} placeholder="Ex.: location-123" />
        </div>
        <Button type="button" variant="primary" disabled={!productId.trim()} onClick={search}>
          Consultar Movimentações
        </Button>
      </WidgetCard>

      {searchedProductId === undefined ? (
        <Alert tone="info">
          <p>Informe um Produto acima para consultar seu histórico real de movimentações — o ledger não pode ser listado por completo, apenas por Produto.</p>
        </Alert>
      ) : (
        <WidgetCard title={`Ledger — Produto ${searchedProductId.slice(0, 8)}`}>
          {(movements.data?.length ?? 0) > 0 && (
            <p style={{ marginBottom: 12 }}>
              Saldo do ledger consultado: <strong>{totalDelta(movements.data!) > 0 ? "+" : ""}{totalDelta(movements.data!)}</strong> un. em {movements.data!.length} movimentação(ões).
            </p>
          )}
          <Table
            columns={columns}
            rows={movements.data ?? []}
            getRowId={(row) => row.movementId}
            searchPlaceholder="Buscar por identificador do movimento…"
            searchText={(row) => row.movementId}
            emptyTitle="Nenhuma movimentação registrada para este Produto ainda"
            emptyDescription="Registre a primeira movimentação pelo botão acima."
          />
        </WidgetCard>
      )}
    </div>
  );
}
