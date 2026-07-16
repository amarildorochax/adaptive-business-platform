export function Sidebar() {
  const items = [
    "Dashboard",
    "Squads",
    "Agentes",
    "Tarefas",
    "Automações",
    "Analytics",
    "Integrações",
    "Eventos",
    "Configurações",
  ];

  return (
    <aside
      style={{
        width: 240,
        background: "#111827",
        borderRight: "1px solid #1F2937",
        padding: 20,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h3
        style={{
          color: "#FFFFFF",
          marginTop: 0,
          marginBottom: 20,
          fontSize: 16,
        }}
      >
        Menu
      </h3>

      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {items.map((item) => (
          <button
            key={item}
            style={{
              background: "transparent",
              border: "none",
              color: "#CBD5E1",
              textAlign: "left",
              cursor: "pointer",
              padding: "12px 14px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              transition: "all .2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#1E293B";
              e.currentTarget.style.color = "#FFFFFF";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#CBD5E1";
            }}
          >
            {item}
          </button>
        ))}
      </nav>
    </aside>
  );
}