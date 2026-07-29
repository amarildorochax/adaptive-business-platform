import { Header } from "@/components/header/Header";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { ScenePanel } from "@/components/center/ScenePanel";
import { RightPanel } from "@/components/rightpanel/RightPanel";
import { BottomPanel } from "@/components/bottom/BottomPanel";
import { KpiCards } from "@/components/cards/KpiCards";
import { NewTaskButton } from "@/components/tasks/NewTaskButton";
import { taskQueue } from "@/core/queue/TaskQueue";
import { TaskStatus } from "@/core/queue/TaskStatus";
import { eventBus } from "@/core/events/EventBus";
import { EventTypes } from "@/core/events/EventTypes";

import styles from "./DashboardLayout.module.css";

// Sprint 0B — Integração do Runtime: conecta NewTaskButton a
// TaskQueue.add(), fechando o fluxo UI -> TaskQueue -> TaskRunner ->
// Dispatcher -> Executor -> Provider que antes só existia em teoria
// (nenhum ponto do código chamava `taskQueue.add()`). O título é fixo
// de propósito — nenhum formulário de criação de tarefa é implementado
// aqui, apenas a conexão de infraestrutura já pedida por esta Sprint;
// um formulário real de criação de tarefa é funcionalidade de negócio,
// fora do escopo desta Sprint.
function handleNewTask(): void {
  const now = new Date();

  const task = {
    id: crypto.randomUUID(),
    title: "Novo artigo de blog",
    description: "Tarefa criada manualmente pelo botão 'Nova Tarefa' do dashboard.",
    createdBy: "dashboard-ui",
    status: TaskStatus.PENDING,
    createdAt: now,
    updatedAt: now,
  };

  taskQueue.add(task);

  eventBus.emit({
    id: crypto.randomUUID(),
    type: EventTypes.TASK_CREATED,
    source: "NewTaskButton",
    payload: { taskId: task.id, title: task.title },
    createdAt: now,
  });
}

export function DashboardLayout() {
  return (
    <div className={styles.layout}>
      <Header />

      <KpiCards />

      <div style={{ padding: "0 16px 16px" }}>
        <NewTaskButton onClick={handleNewTask} />
      </div>

      <div className={styles.content}>
        <Sidebar />

        <ScenePanel />

        <RightPanel />
      </div>

      <BottomPanel />
    </div>
  );
}
