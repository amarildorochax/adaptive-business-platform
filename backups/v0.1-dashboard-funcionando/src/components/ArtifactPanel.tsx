interface ArtifactPanelProps {
  artifacts?: unknown[];
  squadCode?: string;
}

export function ArtifactPanel({
  artifacts = [],
  squadCode,
}: ArtifactPanelProps) {
  return (
    <aside
      style={{
        position: "absolute",
        right: 20,
        bottom: 20,
        width: 300,
        background: "#111827",
        border: "1px solid #1F2937",
        borderRadius: 12,
        padding: 16,
        color: "#FFFFFF",
      }}
    >
      <h3
        style={{
          marginTop: 0,
          marginBottom: 12,
          fontSize: 16,
        }}
      >
        Artefatos
      </h3>

      <div
        style={{
          color: "#94A3B8",
          fontSize: 13,
          marginBottom: 12,
        }}
      >
        Squad: {squadCode ?? "-"}
      </div>

      <div
        style={{
          color: "#CBD5E1",
          fontSize: 13,
        }}
      >
        Total de artefatos: {artifacts.length}
      </div>
    </aside>
  );
}