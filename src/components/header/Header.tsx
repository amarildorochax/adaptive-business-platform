export function Header() {
  return (
    <header
      style={{
        height: 72,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        background: "#0F172A",
        borderBottom: "1px solid #1E293B",
      }}
    >
      <div>
        <h1
          style={{
            margin: 0,
            color: "#FFFFFF",
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          Andreia AI Platform
        </h1>

        <span
          style={{
            color: "#94A3B8",
            fontSize: 13,
          }}
        >
          Centro de Operações Inteligente
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#22C55E",
          }}
        />

        <span
          style={{
            color: "#22C55E",
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          ONLINE
        </span>
      </div>
    </header>
  );
}