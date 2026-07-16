import type { Task } from "./Task";
import { TaskStatus } from "./TaskStatus";

export class TaskQueue {
  private tasks: Task[] = [];

  add(task: Task): void {
    this.tasks.push(task);
  }

  next(): Task | undefined {
    const task = this.tasks.find(
      (task) => task.status === TaskStatus.PENDING
    );

    if (!task) {
      return undefined;
    }

    task.status = TaskStatus.ASSIGNED;
    task.updatedAt = new Date();

    return task;
  }

  start(taskId: string): boolean {
    const task = this.tasks.find((task) => task.id === taskId);

    if (!task) {
      return false;
    }

    task.status = TaskStatus.RUNNING;
    task.updatedAt = new Date();

    return true;
  }

  complete(taskId: string): boolean {
    const task = this.tasks.find((task) => task.id === taskId);

    if (!task) {
      return false;
    }

    task.status = TaskStatus.COMPLETED;
    task.updatedAt = new Date();

    return true;
  }

  fail(taskId: string): boolean {
    const task = this.tasks.find((task) => task.id === taskId);

    if (!task) {
      return false;
    }

    task.status = TaskStatus.FAILED;
    task.updatedAt = new Date();

    return true;
  }

  cancel(taskId: string): boolean {
    const task = this.tasks.find((task) => task.id === taskId);

    if (!task) {
      return false;
    }

    task.status = TaskStatus.CANCELLED;
    task.updatedAt = new Date();

    return true;
  }

  getAll(): Task[] {
    return [...this.tasks];
  }

  clear(): void {
    this.tasks = [];
  }

  count(): number {
    return this.tasks.length;
  }
}

export const taskQueue = new TaskQueue();