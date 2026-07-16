import { eventBus } from "./EventBus";

let initialized = false;

export function startEventBusTest(): void {
  if (initialized) {
    return;
  }

  initialized = true;

  eventBus.subscribe("TASK_CREATED", (event) => {
    console.log("[EventBus]", event.type, event.payload);
  });

  eventBus.subscribe("TASK_ASSIGNED", (event) => {
    console.log("[EventBus]", event.type, event.payload);
  });

  eventBus.subscribe("TASK_STARTED", (event) => {
    console.log("[EventBus]", event.type, event.payload);
  });

  eventBus.subscribe("TASK_COMPLETED", (event) => {
    console.log("[EventBus]", event.type, event.payload);
  });

  eventBus.subscribe("TASK_FAILED", (event) => {
    console.log("[EventBus]", event.type, event.payload);
  });

  eventBus.subscribe("TASK_CANCELLED", (event) => {
    console.log("[EventBus]", event.type, event.payload);
  });
}