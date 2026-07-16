import { useEffect } from "react";
import { useSquadStore } from "@/store/useSquadStore";
import { eventBridge } from "../EventBridge";
import { findAgent } from "@/lib/normalizeState";

function pushCurrentState() {
  const state = useSquadStore.getState();

  const squad = state.selectedSquad;

  const squadState = squad
    ? state.activeStates.get(squad)
    : undefined;

  console.log("[STORE]", state);
  console.log("[SELECTED]", squad);
  console.log("[SQUAD STATE]", squadState);
  console.log("[HAS STATE]", !!squadState);

  if (squadState) {
    eventBridge.emit(
      "squad-changed",
      squadState.agents,
      squadState.status
    );
  }
}

export function useEventBridge() {
  useEffect(() => {
    // When the Phaser scene finishes creating, send it the current store state
    const unsubReady = eventBridge.on("scene-ready", () => {
      pushCurrentState();
    });

    // Also push immediately in case the scene is already ready
    pushCurrentState();

    const unsub = useSquadStore.subscribe((state, prev) => {
      const squad = state.selectedSquad;

      const squadState = squad
        ? state.activeStates.get(squad)
        : undefined;

      const prevSquad = prev.selectedSquad;

      const prevState = prevSquad
        ? prev.activeStates.get(prevSquad)
        : undefined;

      if (!squadState) {
        if (prevState || squad !== prevSquad) {
          eventBridge.emit("squad-cleared");
        }

        return;
      }

      const agentsChanged =
        squad !== prevSquad ||
        !prevState ||
        squadState.updatedAt !== prevState.updatedAt;

      if (agentsChanged) {
        eventBridge.emit(
          "squad-changed",
          squadState.agents,
          squadState.status
        );

        if (
          squadState.handoff &&
          squadState.handoff !== prevState?.handoff
        ) {
          const from = findAgent(
            squadState,
            squadState.handoff.from
          );

          const to = findAgent(
            squadState,
            squadState.handoff.to
          );

          if (from && to) {
            eventBridge.emit(
              "handoff",
              from,
              to,
              squadState.handoff.message
            );
          }
        }
      }
    });

    return () => {
      unsubReady();
      unsub();
    };
  }, []);
}