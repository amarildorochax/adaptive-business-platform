import type { Task } from "./Task";
import { TaskStatus } from "./TaskStatus";

/**
 * Fila de tarefas em memória, consumida hoje por TaskRunner
 * (src/core/tasks/TaskRunner.ts).
 *
 * Responsabilidade: manter a lista de Task e as transições válidas de
 * TaskStatus (PENDING -> ASSIGNED -> RUNNING -> COMPLETED | FAILED |
 * CANCELLED).
 *
 * Objetivo: ser o único ponto de mutação do estado de uma Task — nenhum
 * consumidor deve alterar `task.status` diretamente.
 *
 * Dependências: Task, TaskStatus (mesmo módulo). Nenhuma dependência de
 * Agent, de EventBus, ou de qualquer módulo de negócio.
 *
 * Nota de auditoria (Sprint 0A): nenhum ponto do código hoje chama
 * `taskQueue.add()` — a fila está sempre vazia em produção, e
 * `TaskRunner.run()` sempre recebe `undefined` de `next()`. A UI já
 * possui um componente para criar tarefa (`NewTaskButton`,
 * src/components/tasks/), mas ele também não está conectado a
 * `taskQueue.add()`. Nenhuma correção de comportamento foi feita por
 * esta Sprint (fora do escopo) — ver BUILD_ENVIRONMENT... (Relatório
 * Final desta Sprint, seção "Débito técnico restante").
 *
 * Exemplo de uso:
 * ```ts
 * taskQueue.add(task);
 * const next = taskQueue.next(); // marca ASSIGNED
 * taskQueue.start(next!.id);     // marca RUNNING
 * taskQueue.complete(next!.id);  // marca COMPLETED
 * ```
 */
export class TaskQueue {
  private tasks: Task[] = [];

  /** Adiciona uma Task já criada ao final da fila, em status arbitrário. */
  add(task: Task): void {
    this.tasks.push(task);
  }

  /**
   * Retorna a próxima Task pendente (a primeira com status PENDING) e a
   * marca como ASSIGNED. Retorna `undefined` se não houver nenhuma
   * pendente.
   */
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

  /** Marca a Task de id `taskId` como RUNNING. Retorna `false` se não existir. */
  start(taskId: string): boolean {
    const task = this.tasks.find((task) => task.id === taskId);

    if (!task) {
      return false;
    }

    task.status = TaskStatus.RUNNING;
    task.updatedAt = new Date();

    return true;
  }

  /** Marca a Task de id `taskId` como COMPLETED. Retorna `false` se não existir. */
  complete(taskId: string): boolean {
    const task = this.tasks.find((task) => task.id === taskId);

    if (!task) {
      return false;
    }

    task.status = TaskStatus.COMPLETED;
    task.updatedAt = new Date();

    return true;
  }

  /** Marca a Task de id `taskId` como FAILED. Retorna `false` se não existir. */
  fail(taskId: string): boolean {
    const task = this.tasks.find((task) => task.id === taskId);

    if (!task) {
      return false;
    }

    task.status = TaskStatus.FAILED;
    task.updatedAt = new Date();

    return true;
  }

  /** Marca a Task de id `taskId` como CANCELLED. Retorna `false` se não existir. */
  cancel(taskId: string): boolean {
    const task = this.tasks.find((task) => task.id === taskId);

    if (!task) {
      return false;
    }

    task.status = TaskStatus.CANCELLED;
    task.updatedAt = new Date();

    return true;
  }

  /** Retorna uma cópia rasa de todas as Tasks da fila, em qualquer status. */
  getAll(): Task[] {
    return [...this.tasks];
  }

  /** Remove todas as Tasks da fila. */
  clear(): void {
    this.tasks = [];
  }

  /** Quantidade total de Tasks na fila, em qualquer status. */
  count(): number {
    return this.tasks.length;
  }
}

/** Instância única e compartilhada da fila de tarefas para toda a plataforma. */
export const taskQueue = new TaskQueue();
