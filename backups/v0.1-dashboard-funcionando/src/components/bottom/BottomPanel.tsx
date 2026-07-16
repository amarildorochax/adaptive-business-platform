const events = [
  "Dashboard iniciado",
  "Sistema carregado",
  "Event Center ativo",
  "Aguardando novas tarefas",
];

export function BottomPanel() {
  return (
    <footer
      style={{
        height: 140,
        background: "#0F172A",
        borderTop: "1px solid #1E293B",
        padding: 20,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h3
        style={{
          margin: 0,
          color: "#FFFFFF",
          fontSize: 16,
          marginBottom: 12,
        }}
      >
        Central de Eventos
      </h3>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          color: "#94A3B8",
          fontSize: 13,
        }}
      >
        {events.map((event, index) => (
          <span key={index}>
            {event}
          </span>
        ))}
      </div>
    </footer>
  );
}