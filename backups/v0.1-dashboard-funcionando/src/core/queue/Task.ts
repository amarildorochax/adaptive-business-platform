import { TaskStatus } from "./TaskStatus";

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