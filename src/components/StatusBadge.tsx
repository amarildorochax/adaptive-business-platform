interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({
  status,
}: StatusBadgeProps) {
  const normalized = status.toLowerCase();

  const color =
    normalized === "online"
      ? "#22C55E"
      : normalized === "idle"
      ? "#F59E0B"
      : normalized === "running"
      ? "#3B82F6"
      : normalized === "assigned"
      ? "#8B5CF6"
      : normalized === "pending"
      ? "#94A3B8"
      : normalized === "completed"
      ? "#10B981"
      : normalized === "failed"
      ? "#EF4444"
      : normalized === "inactive"
      ? "#6B7280"
      : "#6B7280";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 999,
        background: "#1E293B",
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: color,
        }}
      />

      {status}
    </span>
  );
}