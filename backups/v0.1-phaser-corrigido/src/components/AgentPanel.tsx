export function AgentPanel() {
  const agents = [
    {
      name: "Blog Agent",
      status: "Online",
    },
    {
      name: "SEO Agent",
      status: "Online",
    },
    {
      name: "Pinterest Agent",
      status: "Idle",
    },
    {
      name: "WordPress Agent",
      status: "Offline",
    },
  ];

  return (
    <aside
      style={{
        width: 300,
        background: "#111827",
        borderLeft: "1px solid #1F2937",
        padding: 20,
      }}
    >
      <h3
        style={{
          marginTop: 0,
          marginBottom: 20,
          color: "#FFFFFF",
        }}
      >
        Agentes
      </h3>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {agents.map((agent) => (
          <div
            key={agent.name}
            style={{
              background: "#1E293B",
              padding: 14,
              borderRadius: 10,
            }}
          >
            <div
              style={{
                color: "#FFFFFF",
                fontWeight: 600,
              }}
            >
              {agent.name}
            </div>

            <div
              style={{
                marginTop: 6,
                color: "#94A3B8",
                fontSize: 13,
              }}
            >
              {agent.status}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}