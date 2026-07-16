interface StatCardProps {
  title: string;
  value: string;
  color: string;
}

export function StatCard({
  title,
  value,
  color,
}: StatCardProps) {
  return (
    <div
      style={{
        background: "#1E293B",
        borderRadius: 12,
        padding: 16,
        borderLeft: `5px solid ${color}`,
      }}
    >
      <div
        style={{
          color: "#94A3B8",
          fontSize: 13,
        }}
      >
        {title}
      </div>

      <div
        style={{
          color: "#FFFFFF",
          fontSize: 28,
          fontWeight: 700,
          marginTop: 8,
        }}
      >
        {value}
      </div>
    </div>
  );
}