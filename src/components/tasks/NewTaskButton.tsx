interface NewTaskButtonProps {
  onClick?: () => void;
}

export function NewTaskButton({
  onClick,
}: NewTaskButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "#2563EB",
        color: "#FFFFFF",
        border: "none",
        borderRadius: 10,
        padding: "12px 18px",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        transition: "0.2s",
      }}
    >
      + Nova Tarefa
    </button>
  );
}