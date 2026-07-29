import type { Event } from "./Event";

type EventListener = (event: Event) => void;

/**
 * Barramento de eventos síncrono e em memória da plataforma.
 *
 * Responsabilidade: permitir que qualquer parte do Core (ou de um módulo
 * de negócio, no futuro) publique e assine eventos de domínio (ver
 * EventTypes.ts) sem que publicador e assinante se conheçam diretamente.
 *
 * Objetivo: desacoplar componentes — hoje nenhum ponto do caminho ao vivo
 * (AgentSimulator/TaskRunner/AgentDispatcher) emite eventos por aqui;
 * eles usam console.log diretamente. EventBus está pronto para ser
 * adotado como o canal padrão de notificação entre módulos.
 *
 * Dependências: apenas o tipo `Event` (Event.ts). Nenhuma dependência de
 * nenhum outro submódulo de Core.
 *
 * Exemplo de uso:
 * ```ts
 * const unsubscribe = eventBus.subscribe("TASK_CREATED", (event) => {
 *   console.log(event.payload);
 * });
 *
 * eventBus.emit({ id: "1", type: "TASK_CREATED", source: "queue", createdAt: new Date() });
 *
 * unsubscribe();
 * ```
 */
export class EventBus {
  private listeners = new Map<string, Set<EventListener>>();

  /**
   * Registra um listener para um tipo de evento.
   *
   * @param type - identificador do tipo de evento (ver EventTypes.ts).
   * @param listener - função chamada de forma síncrona a cada `emit()` daquele tipo.
   * @returns função de cancelamento — remove o listener e, se ele era o
   * último daquele tipo, também remove a entrada correspondente do mapa
   * interno.
   */
  subscribe(type: string, listener: EventListener): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }

    this.listeners.get(type)!.add(listener);

    return () => {
      this.listeners.get(type)?.delete(listener);

      if (this.listeners.get(type)?.size === 0) {
        this.listeners.delete(type);
      }
    };
  }

  /**
   * Publica um evento para todos os listeners já assinados em `event.type`.
   * Não faz nada se não houver nenhum listener assinado para esse tipo.
   *
   * @param event - o evento a publicar (ver Event.ts).
   */
  emit(event: Event): void {
    const listeners = this.listeners.get(event.type);

    if (!listeners) {
      return;
    }

    for (const listener of listeners) {
      listener(event);
    }
  }

  /** Remove todos os listeners de todos os tipos. */
  clear(): void {
    this.listeners.clear();
  }
}

/** Instância única e compartilhada do EventBus para toda a plataforma. */
export const eventBus = new EventBus();
