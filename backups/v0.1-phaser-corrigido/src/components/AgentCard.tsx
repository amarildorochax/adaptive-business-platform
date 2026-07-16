import { StatusBadge } from "./StatusBadge";

interface AgentCardProps {
  name: string;
  status: string;
}

export function AgentCard({
  name,
  status,
}: AgentCardProps) {
  return (
    <div
      style={{
        background: "#1E293B",
        borderRadius: 12,
        padding: 16,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <div
          style={{
            color: "#FFFFFF",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          {name}
        </div>

        <div
          style={{
            color: "#94A3B8",
            fontSize: 12,
            marginTop: 4,
          }}
        >
          Agente Inteligente
        </div>
      </div>

      <StatusBadge status={status} />
    </div>
  );
}