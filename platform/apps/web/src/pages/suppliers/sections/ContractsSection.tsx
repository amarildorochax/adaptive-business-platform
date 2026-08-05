import { useState } from "react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Button } from "@shared/components/ui/Button";
import { ContractCard } from "@shared/components/ui/ContractCard";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { Field } from "@shared/components/ui/Field";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { Select } from "@shared/components/ui/Select";
import { useToast } from "@shared/components/ui/toast/useToast";
import type { SupplierContractResponseDto, SupplierResponseDto } from "@core/supplier/supplier.dto";
import { useCreateSupplierContract } from "@core/supplier/useCreateSupplierContract";

/**
 * Contratos (IMP-205) — "Mostrar apenas dados realmente disponíveis... Caso algum conceito ainda
 * não exista, utilizar NotConnectedNotice." Criar Contrato é real (`useCreateSupplierContract`,
 * `POST /supplier-contracts`, IMP-203) — o Fornecedor, o Contrato criado nesta sessão e cada campo
 * exibido vêm do próprio retorno da Mutation, nunca fabricados. Listar/reabrir um Contrato já
 * existente não é suportado: `SupplierManager`/`apps/api` nunca expuseram nenhum `GET` para
 * `SupplierContract` (Core, IMP-201; HTTP, IMP-203) — `NotConnectedNotice` explica exatamente essa
 * lacuna, os contratos exibidos abaixo existem apenas nesta sessão do navegador.
 */
export function ContractsSection({ suppliers, onLogged }: { readonly suppliers: readonly SupplierResponseDto[]; readonly onLogged: (message: string) => void }) {
  const { showToast } = useToast();
  const createContract = useCreateSupplierContract();

  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.supplierId ?? "");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [paymentTermsDueInDays, setPaymentTermsDueInDays] = useState("30");
  const [minimumVolume, setMinimumVolume] = useState("");
  const [createdThisSession, setCreatedThisSession] = useState<readonly SupplierContractResponseDto[]>([]);

  function supplierName(supplierId: string): string | undefined {
    return suppliers.find((supplier) => supplier.supplierId === supplierId)?.legalName;
  }

  function submit() {
    if (!selectedSupplierId || !startsAt) {
      return;
    }

    createContract.mutate(
      {
        supplierId: selectedSupplierId,
        tenantId: suppliers.find((supplier) => supplier.supplierId === selectedSupplierId)?.tenantId ?? "",
        startsAt: new Date(startsAt).toISOString(),
        endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
        paymentTermsDueInDays: Number(paymentTermsDueInDays),
        minimumVolume: minimumVolume ? Number(minimumVolume) : undefined,
      },
      {
        onSuccess: (contract) => {
          showToast("success", "Contrato registrado.");
          onLogged(`Contrato registrado com "${supplierName(selectedSupplierId) ?? "Fornecedor"}".`);
          setCreatedThisSession((current) => [contract, ...current]);
          setStartsAt("");
          setEndsAt("");
          setMinimumVolume("");
        },
        onError: () => showToast("danger", "Não foi possível registrar o Contrato."),
      },
    );
  }

  return (
    <div className="dashboard-section">
      <NotConnectedNotice fields={["Listagem de Contratos já existentes"]} context="Supplier Hub" />

      <WidgetCard title="Contratos registrados nesta sessão">
        {createdThisSession.length === 0 ? (
          <EmptyState title="Nenhum Contrato registrado ainda" description="Registre um Contrato no formulário abaixo." />
        ) : (
          <div className="dashboard-grid">
            {createdThisSession.map((contract) => (
              <ContractCard key={contract.contractId} supplierName={supplierName(contract.supplierId)} startsAt={contract.startsAt} endsAt={contract.endsAt} paymentTermsDueInDays={contract.paymentTermsDueInDays} minimumVolume={contract.minimumVolume} />
            ))}
          </div>
        )}
      </WidgetCard>

      <WidgetCard title="Registrar Contrato">
        {suppliers.length === 0 ? (
          <p>Cadastre um Fornecedor antes de registrar um Contrato.</p>
        ) : (
          <>
            <div className="form-grid">
              <Select label="Fornecedor" value={selectedSupplierId} onChange={(event) => setSelectedSupplierId(event.target.value)}>
                {suppliers.map((supplier) => (
                  <option key={supplier.supplierId} value={supplier.supplierId}>
                    {supplier.legalName}
                  </option>
                ))}
              </Select>
              <Field label="Início de vigência" type="date" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
              <Field label="Fim de vigência (opcional)" type="date" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} />
              <Field label="Prazo de pagamento (dias)" type="number" min={0} value={paymentTermsDueInDays} onChange={(event) => setPaymentTermsDueInDays(event.target.value)} />
              <Field label="Volume mínimo (opcional)" type="number" min={0} value={minimumVolume} onChange={(event) => setMinimumVolume(event.target.value)} />
            </div>
            <Button type="button" variant="secondary" disabled={!selectedSupplierId || !startsAt || createContract.isPending} onClick={submit}>
              Registrar Contrato
            </Button>
          </>
        )}
      </WidgetCard>
    </div>
  );
}
