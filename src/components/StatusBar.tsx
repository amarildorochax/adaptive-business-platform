export function StatusBar() {
  return (
    <footer
      style={{
        height: 34,
        background: "#0B1220",
        borderTop: "1px solid #1E293B",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        color: "#94A3B8",
        fontSize: 12,
      }}
    >
      <span>Andreia AI Platform v0.1</span>

      <span style={{ color: "#22C55E" }}>
        ● Sistema Operacional
      </span>
    </footer>
  );
}