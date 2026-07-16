const agents = [
  {
    name: "Blog Agent",
    status: "🟢 Online",
  },
  {
    name: "SEO Agent",
    status: "🟡 Aguardando",
  },
  {
    name: "Pinterest Agent",
    status: "🔵 Pronto",
  },
];

export function RightPanel() {
  return (
    <aside
      style={{
        width: 320,
        background: "#111827",
        borderLeft: "1px solid #1F2937",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <h3
        style={{
          margin: 0,
          color: "#FFFFFF",
          fontSize: 16,
          marginBottom: 8,
        }}
      >
        Agentes Ativos
      </h3>

      {agents.map((agent) => (
        <div
          key={agent.name}
          style={{
            background: "#1E293B",
            borderRadius: 12,
            padding: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              color: "#FFFFFF",
              fontWeight: 600,
            }}
          >
            {agent.name}
          </span>

          <span
            style={{
              color: "#94A3B8",
              fontSize: 13,
            }}
          >
            {agent.status}
          </span>
        </div>
      ))}
    </aside>
  );
}