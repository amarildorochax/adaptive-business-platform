export function ActivityFeed() {
  return (
    <section
      style={{
        background: "#0F172A",
        borderTop: "1px solid #1E293B",
        padding: 16,
        color: "#FFFFFF",
      }}
    >
      <h3
        style={{
          margin: 0,
          marginBottom: 12,
          fontSize: 16,
        }}
      >
        Atividade em Tempo Real
      </h3>

      <div
        style={{
          color: "#94A3B8",
          fontSize: 14,
        }}
      >
        Nenhuma atividade registrada.
      </div>
    </section>
  );
}