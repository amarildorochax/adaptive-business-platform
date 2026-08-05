import { useState } from "react";
import { AsyncState } from "@shared/components/AsyncState";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Alert } from "@shared/components/ui/Alert";
import { Button } from "@shared/components/ui/Button";
import { Field } from "@shared/components/ui/Field";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { useToast } from "@shared/components/ui/toast/useToast";
import { useBrandIdentity } from "@core/query/useBrandIdentity";
import { useSubmitLogo } from "@core/query/useSubmitLogo";

/**
 * Logo (FUN-102) — `Logo` (`packages/branding/src/Logo.ts`) é restrito a uma referência opaca de
 * ativo (`assetReference: string`) enviada via `BrandingManager.submitLogo`: "nenhuma geração,
 * edição, ou processamento de imagem acontece nesta Sprint" — nunca um upload de arquivo binário
 * real, per instrução explícita da Sprint ("Caso o backend não suporte upload: Mostrar placeholder.
 * Exibir claramente: Upload ainda não disponível."). Versão clara/escura/Ícone/FavIcon nunca
 * existiram como campo de `Logo` — variações "permanecem tecnologia de processamento de imagem não
 * decidida por este Core" (mesmo comentário do Core, ver `Logo.ts`).
 */
export function LogoSection({ tenantId }: { readonly tenantId: string }) {
  const identity = useBrandIdentity(tenantId);
  const submitLogo = useSubmitLogo(tenantId);
  const { showToast } = useToast();
  const [assetReference, setAssetReference] = useState("");

  function handleSubmit() {
    if (!assetReference.trim()) {
      return;
    }
    submitLogo.mutate(
      { tenantId, assetReference: assetReference.trim() },
      {
        onSuccess: () => {
          showToast("success", "Logo enviado.");
          setAssetReference("");
        },
        onError: () => showToast("danger", "Não foi possível enviar o logo."),
      },
    );
  }

  return (
    <div className="dashboard-section">
      <AsyncState isLoading={identity.isLoading} isError={identity.isError} error={identity.error} onRetry={() => void identity.refetch()}>
        <WidgetCard title="Logo principal">
          {identity.data?.logo ? (
            <Alert tone="success">
              <p>
                Referência do ativo: <code>{identity.data.logo.assetReference}</code>
              </p>
            </Alert>
          ) : (
            <p>Nenhum logo enviado ainda.</p>
          )}

          <p className="upload-unavailable-note">
            <strong>Upload de arquivo ainda não disponível.</strong> O Backend aceita apenas uma referência opaca já hospedada em outro lugar (nunca um binário de imagem).
          </p>
          <div className="form-grid">
            <Field label="Referência do ativo (URL ou identificador)" value={assetReference} onChange={(event) => setAssetReference(event.target.value)} placeholder="Ex.: https://cdn.example.com/logo.svg" />
          </div>
          <Button type="button" variant="primary" onClick={handleSubmit} disabled={submitLogo.isPending || !assetReference.trim()}>
            {submitLogo.isPending ? "Enviando…" : "Enviar logo"}
          </Button>
        </WidgetCard>
      </AsyncState>

      <NotConnectedNotice fields={["Versão clara", "Versão escura", "Ícone", "FavIcon"]} context="Branding Hub" />
    </div>
  );
}
