import { AsyncState } from "@shared/components/AsyncState";
import { WidgetCard } from "@shared/components/WidgetCard";
import { useBusinessProfileSummary } from "@core/query/useBusinessProfileSummary";

export function BusinessProfileWidget({ profileId }: { readonly profileId: string | undefined }) {
  const { data, isLoading, isError, error, refetch } = useBusinessProfileSummary(profileId);

  return (
    <WidgetCard title="Perfil Empresarial">
      <AsyncState isLoading={isLoading} isError={isError} error={error} onRetry={() => void refetch()} isEmpty={!data}>
        {data && (
          <dl>
            <dt>Segmento</dt>
            <dd>
              {data.classification?.segment}
              {data.classification?.subsegment ? ` · ${data.classification.subsegment}` : ""}
            </dd>
            <dt>Maturidade</dt>
            <dd>{data.maturity}</dd>
            <dt>Estágio</dt>
            <dd>{data.stage}</dd>
          </dl>
        )}
      </AsyncState>
    </WidgetCard>
  );
}
