import { StatusBadge } from "./StatusBadge";

interface SquadCardProps {
  name: string;
  description: string;
  status: string;
}

export function SquadCard({
  name,
  description,
  status,
}: SquadCardProps) {
  return (
    <div
      style={{
        background: "#1E293B",
        borderRadius: 12,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <strong
          style={{
            color: "#FFFFFF",
            fontSize: 15,
          }}
        >
          {name}
        </strong>

        <StatusBadge status={status} />
      </div>

      <span
        style={{
          color: "#94A3B8",
          fontSize: 13,
          lineHeight: 1.5,
        }}
      >
        {description}
      </span>
    </div>
  );
}