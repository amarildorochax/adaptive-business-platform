export function ExecutionHistoryPanel() {
  return (
    <section
      style={{
        background: "#111827",
        border: "1px solid #1F2937",
        borderRadius: 12,
        padding: 20,
        color: "#FFFFFF",
      }}
    >
      <h3
        style={{
          margin: 0,
          marginBottom: 16,
          fontSize: 16,
        }}
      >
        Histórico de Execuções
      </h3>

      <div
        style={{
          color: "#94A3B8",
          fontSize: 14,
        }}
      >
        Nenhuma execução registrada.
      </div>
    </section>
  );
}