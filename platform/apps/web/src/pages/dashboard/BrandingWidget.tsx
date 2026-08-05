import { AsyncState } from "@shared/components/AsyncState";
import { WidgetCard } from "@shared/components/WidgetCard";
import { useBrandIdentity } from "@core/query/useBrandIdentity";
import { DEMO_TENANT_ID } from "@core/managers/seedDemoData";

export function BrandingWidget() {
  const { data, isLoading, isError, error, refetch } = useBrandIdentity(DEMO_TENANT_ID);

  return (
    <WidgetCard title="Identidade de Marca">
      <AsyncState isLoading={isLoading} isError={isError} error={error} onRetry={() => void refetch()} isEmpty={!data?.theme}>
        {data?.theme && (
          <dl>
            <dt>Theme</dt>
            <dd>Versão {data.theme.version}</dd>
            <dt>Logo</dt>
            <dd>{data.logo ? data.logo.assetReference : "Nenhum logo enviado"}</dd>
          </dl>
        )}
      </AsyncState>
    </WidgetCard>
  );
}
