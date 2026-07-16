import { useEffect, useState } from "react";
import { agentStore } from "@/core/store/AgentStore";
import { StatCard } from "./StatCard";

export function KpiCards() {
  const [totalAgents, setTotalAgents] = useState(agentStore.totalAgents());

  useEffect(() => {
    const unsubscribe = agentStore.subscribe(() => {
      setTotalAgents(agentStore.totalAgents());
    });

    return unsubscribe;
  }, []);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        gap: 16,
        padding: 16,
      }}
    >
      <StatCard
        title="Agentes"
        value={String(totalAgents)}
        color="#3B82F6"
      />

      <StatCard
        title="Tarefas"
        value="21"
        color="#10B981"
      />

      <StatCard
        title="Execuções"
        value="154"
        color="#F59E0B"
      />

      <StatCard
        title="IA"
        value="GPT-5"
        color="#8B5CF6"
      />

      <StatCard
        title="Leads"
        value="42"
        color="#EC4899"
      />

      <StatCard
        title="Vendas"
        value="12"
        color="#EF4444"
      />
    </div>
  );
}