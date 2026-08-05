import { useState } from "react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { BillOfMaterialsCard } from "@shared/components/ui/BillOfMaterialsCard";
import { Button } from "@shared/components/ui/Button";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { Field } from "@shared/components/ui/Field";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { Select } from "@shared/components/ui/Select";
import { useToast } from "@shared/components/ui/toast/useToast";
import type { BillOfMaterialsResponseDto, BOMLineDto, UnitOfMeasureDto } from "@core/production/production.dto";
import { useActiveBillOfMaterialsForProduct } from "@core/production/useActiveBillOfMaterialsForProduct";
import { useBillOfMaterials } from "@core/production/useBillOfMaterials";
import { useCreateBillOfMaterials } from "@core/production/useCreateBillOfMaterials";
import { useSupersedeBillOfMaterials } from "@core/production/useSupersedeBillOfMaterials";

const UNIT_OPTIONS: readonly UnitOfMeasureDto[] = ["Unit", "Kilogram", "Liter", "Meter"];
const UNIT_LABEL: Record<UnitOfMeasureDto, string> = { Unit: "Unidade", Kilogram: "Quilograma", Liter: "Litro", Meter: "Metro" };

interface LineFormState {
  readonly inputProductId: string;
  readonly quantityPerOutputUnit: string;
  readonly unitOfMeasure: UnitOfMeasureDto;
}

const EMPTY_LINE: LineFormState = { inputProductId: "", quantityPerOutputUnit: "1", unitOfMeasure: "Unit" };

function toBOMLines(lines: readonly LineFormState[]): readonly BOMLineDto[] {
  return lines
    .filter((line) => line.inputProductId.trim() && line.quantityPerOutputUnit)
    .map((line) => ({ inputProductId: line.inputProductId.trim(), quantityPerOutputUnit: Number(line.quantityPerOutputUnit), unitOfMeasure: line.unitOfMeasure }));
}

function LinesEditor({ lines, onChange }: { readonly lines: readonly LineFormState[]; readonly onChange: (lines: readonly LineFormState[]) => void }) {
  return (
    <div className="form-grid">
      {lines.map((line, index) => (
        <div key={index} className="form-grid" style={{ gridColumn: "1 / -1" }}>
          <Field label={`Insumo ${index + 1}`} value={line.inputProductId} onChange={(event) => onChange(lines.map((l, i) => (i === index ? { ...l, inputProductId: event.target.value } : l)))} placeholder="Ex.: flour" />
          <Field label="Quantidade por unidade de saída" type="number" min={0} value={line.quantityPerOutputUnit} onChange={(event) => onChange(lines.map((l, i) => (i === index ? { ...l, quantityPerOutputUnit: event.target.value } : l)))} />
          <Select label="Unidade de medida" value={line.unitOfMeasure} onChange={(event) => onChange(lines.map((l, i) => (i === index ? { ...l, unitOfMeasure: event.target.value as UnitOfMeasureDto } : l)))}>
            {UNIT_OPTIONS.map((unit) => (
              <option key={unit} value={unit}>
                {UNIT_LABEL[unit]}
              </option>
            ))}
          </Select>
          {lines.length > 1 && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(lines.filter((_, i) => i !== index))}>
              Remover insumo
            </Button>
          )}
        </div>
      ))}
      <Button type="button" variant="ghost" size="sm" onClick={() => onChange([...lines, EMPTY_LINE])}>
        + Adicionar insumo
      </Button>
    </div>
  );
}

function renderBOM(bom: BillOfMaterialsResponseDto) {
  return <BillOfMaterialsCard key={bom.billOfMaterialsId} billOfMaterialsId={bom.billOfMaterialsId} outputProductId={bom.outputProductId} version={bom.version} status={bom.status} linesCount={bom.lines.length} />;
}

/**
 * Estruturas / BOM (IMP-505) — criação, consulta e versionamento (`SupersedeBillOfMaterials`) de
 * `BillOfMaterials`. `useBillOfMaterials`/`useActiveBillOfMaterialsForProduct` (`core/production/`,
 * IMP-504) exigem um identificador conhecido — não existe "listar todas as Composições da Empresa"
 * (`ProductionManager` nunca expôs essa Query); mesma disciplina honesta de `OrdersSection.tsx`.
 *
 * `lines` aceita múltiplos insumos via uma lista dinâmica (`LinesEditor`) — o Command
 * `CreateBillOfMaterials`/`SupersedeBillOfMaterials` (Core, IMP-501) aceita um array completo de
 * `BOMLine`, nunca uma única linha fixa; esta interface nunca subestima a capacidade real do Command.
 *
 * "Composições criadas/superadas nesta sessão" é a mesma "Session Preview" já aplicada por
 * `AlertsSection.tsx` — a única forma real de revisitar uma Composição sem conhecer de antemão seu
 * identificador, já que nenhuma listagem tenant-wide existe.
 */
export function BOMSection({ tenantId, onLogged }: { readonly tenantId: string; readonly onLogged: (message: string) => void }) {
  const { showToast } = useToast();
  const createBOM = useCreateBillOfMaterials();
  const supersedeBOM = useSupersedeBillOfMaterials();

  const [bomsThisSession, setBomsThisSession] = useState<readonly BillOfMaterialsResponseDto[]>([]);

  const [outputProductId, setOutputProductId] = useState("");
  const [createLines, setCreateLines] = useState<readonly LineFormState[]>([EMPTY_LINE]);

  const [bomIdInput, setBomIdInput] = useState("");
  const [searchedBomId, setSearchedBomId] = useState<string | undefined>(undefined);
  const [productIdInput, setProductIdInput] = useState("");
  const [searchedProductId, setSearchedProductId] = useState<string | undefined>(undefined);

  const [supersedeLines, setSupersedeLines] = useState<readonly LineFormState[]>([EMPTY_LINE]);

  const byId = useBillOfMaterials(searchedBomId);
  const activeByProduct = useActiveBillOfMaterialsForProduct(searchedProductId);

  function submitCreate() {
    if (!outputProductId.trim()) {
      return;
    }
    createBOM.mutate(
      { tenantId, outputProductId: outputProductId.trim(), lines: toBOMLines(createLines) },
      {
        onSuccess: (bom) => {
          showToast("success", "Composição criada.");
          onLogged(`Composição ${bom.billOfMaterialsId.slice(0, 8)} criada para o Produto ${bom.outputProductId.slice(0, 8)}.`);
          setBomsThisSession((current) => [bom, ...current]);
          setOutputProductId("");
          setCreateLines([EMPTY_LINE]);
        },
        onError: () => showToast("danger", "Não foi possível criar a Composição."),
      },
    );
  }

  function searchById() {
    if (!bomIdInput.trim()) {
      return;
    }
    setSearchedBomId(bomIdInput.trim());
  }

  function searchByProduct() {
    if (!productIdInput.trim()) {
      return;
    }
    setSearchedProductId(productIdInput.trim());
  }

  function submitSupersede() {
    if (!searchedBomId || !byId.data) {
      return;
    }
    supersedeBOM.mutate(
      { billOfMaterialsId: searchedBomId, payload: { lines: toBOMLines(supersedeLines) } },
      {
        onSuccess: ({ previous, next }) => {
          showToast("success", "Composição superada — nova versão já ativa.");
          onLogged(`Composição ${previous.billOfMaterialsId.slice(0, 8)} superada pela versão ${next.version} (${next.billOfMaterialsId.slice(0, 8)}).`);
          setBomsThisSession((current) => [next, previous, ...current]);
          setSupersedeLines([EMPTY_LINE]);
        },
        onError: () => showToast("danger", "Não foi possível superar a Composição."),
      },
    );
  }

  return (
    <div className="dashboard-section">
      <WidgetCard title="Criar Composição">
        <Field label="Produto final" value={outputProductId} onChange={(event) => setOutputProductId(event.target.value)} placeholder="Ex.: bread" />
        <LinesEditor lines={createLines} onChange={setCreateLines} />
        <Button type="button" variant="primary" disabled={!outputProductId.trim() || createBOM.isPending} onClick={submitCreate}>
          Criar Composição
        </Button>
      </WidgetCard>

      <WidgetCard title="Consultar Composição por identificador">
        <div className="form-grid">
          <Field label="Composição a consultar" value={bomIdInput} onChange={(event) => setBomIdInput(event.target.value)} placeholder="Ex.: bom-123" />
        </div>
        <Button type="button" variant="secondary" disabled={!bomIdInput.trim()} onClick={searchById}>
          Consultar Composição
        </Button>
      </WidgetCard>

      {searchedBomId !== undefined && (
        <WidgetCard title={`Composição ${searchedBomId.slice(0, 8)}`}>
          {byId.data ? (
            <>
              <div className="dashboard-grid">{renderBOM(byId.data)}</div>
              {byId.data.status === "Active" && (
                <div style={{ marginTop: 16 }}>
                  <h3>Superar Composição</h3>
                  <LinesEditor lines={supersedeLines} onChange={setSupersedeLines} />
                  <Button type="button" variant="danger" disabled={supersedeBOM.isPending} onClick={submitSupersede}>
                    Superar Composição
                  </Button>
                </div>
              )}
            </>
          ) : (
            <EmptyState title="Nenhuma Composição encontrada para este identificador" />
          )}
        </WidgetCard>
      )}

      <WidgetCard title="Consultar Composição ativa por Produto">
        <div className="form-grid">
          <Field label="Produto a consultar" value={productIdInput} onChange={(event) => setProductIdInput(event.target.value)} placeholder="Ex.: bread" />
        </div>
        <Button type="button" variant="secondary" disabled={!productIdInput.trim()} onClick={searchByProduct}>
          Consultar Composição Ativa
        </Button>
      </WidgetCard>

      {searchedProductId !== undefined && (
        <WidgetCard title={`Composição ativa — Produto ${searchedProductId.slice(0, 8)}`}>
          {activeByProduct.data ? <div className="dashboard-grid">{renderBOM(activeByProduct.data)}</div> : <EmptyState title="Nenhuma Composição ativa encontrada para este Produto" />}
        </WidgetCard>
      )}

      <NotConnectedNotice fields={["Listagem de todas as BillOfMaterials já cadastradas"]} context="Production Hub" />

      <WidgetCard title="Composições criadas/superadas nesta sessão">
        {bomsThisSession.length === 0 ? <EmptyState title="Nenhuma Composição criada ainda nesta sessão" /> : <div className="dashboard-grid">{bomsThisSession.map(renderBOM)}</div>}
      </WidgetCard>
    </div>
  );
}
