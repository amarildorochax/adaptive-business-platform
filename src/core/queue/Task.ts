import { TaskStatus } from "./TaskStatus";

/**
 * Unidade de trabalho a ser executada por um Agent, gerenciada por
 * TaskQueue.
 *
 * Dependências: TaskStatus.
 */
export interface Task {
  id: string;

  title: string;

  description?: string;

  createdBy: string;

  assignedTo?: string;

  status: TaskStatus;

  payload?: unknown;

  createdAt: Date;

  updatedAt: Date;
}
