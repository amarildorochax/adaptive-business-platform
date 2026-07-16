import { StatusBadge } from "./StatusBadge";

interface SquadCardProps {
  squad: {
    code: string;
    name: string;
    description?: string;
  };

  state?: {
    status?: string;
  };

  isSelected: boolean;

  onSelect: () => void;
}

export function SquadCard({
  squad,
  state,
  isSelected,
  onSelect,
}: SquadCardProps) {
  return (
    <div
      onClick={onSelect}
      style={{
        margin: 8,
        padding: 14,
        borderRadius: 12,
        cursor: "pointer",
        background: isSelected ? "#2563EB" : "#1E293B",
        border: isSelected
          ? "2px solid #60A5FA"
          : "1px solid #334155",
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
          }}
        >
          {squad.name}
        </strong>

        <StatusBadge
          status={state?.status ?? "inactive"}
        />
      </div>

      <div
        style={{
          marginTop: 8,
          color: "#CBD5E1",
          fontSize: 12,
        }}
      >
        {squad.description ?? squad.code}
      </div>
    </div>
  );
}