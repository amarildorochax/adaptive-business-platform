import { WidgetCard } from "@shared/components/WidgetCard";
import type { DemoSnapshot } from "@core/managers/seedDemoData";

export function KnowledgeWidget({ snapshot }: { readonly snapshot: DemoSnapshot }) {
  return (
    <WidgetCard title="Conhecimento">
      <ul>
        {snapshot.knowledgeAssets.map((asset) => (
          <li key={asset.assetId}>
            {asset.type}
            {asset.category ? ` · ${asset.category}` : ""} — {asset.tags.join(", ")}
          </li>
        ))}
      </ul>
    </WidgetCard>
  );
}
