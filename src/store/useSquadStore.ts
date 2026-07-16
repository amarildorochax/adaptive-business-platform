import { create } from "zustand";
import type { LogEntry, SquadInfo, SquadState } from "@/types/state";

interface SquadStore {
  squads: Map<string, SquadInfo>;
  activeStates: Map<string, SquadState>;
  squadLogs: Map<string, LogEntry[]>;
  selectedSquad: string | null;
  isConnected: boolean;

  selectSquad: (name: string | null) => void;
  setConnected: (connected: boolean) => void;
  setSnapshot: (
    squads: SquadInfo[],
    activeStates: Record<string, SquadState>
  ) => void;
  setSquadActive: (squad: string, state: SquadState) => void;
  updateSquadState: (squad: string, state: SquadState) => void;
  setSquadInactive: (squad: string) => void;
}

function mergeLog(
  existing: LogEntry[],
  incoming: LogEntry[] | undefined
): LogEntry[] {
  if (!incoming || incoming.length === 0) return existing;

  const seen = new Set(
    existing.map((e) => `${e.ts}|${e.agent}|${e.msg}`)
  );

  const appended = incoming.filter(
    (e) => !seen.has(`${e.ts}|${e.agent}|${e.msg}`)
  );

  const merged = [...existing, ...appended];

  return merged.length > 200
    ? merged.slice(merged.length - 200)
    : merged;
}

export const useSquadStore = create<SquadStore>((set) => ({
  squads: new Map(),
  activeStates: new Map(),
  squadLogs: new Map(),
  selectedSquad: null,
  isConnected: false,

  selectSquad: (name) =>
    set({
      selectedSquad: name,
    }),

  setConnected: (connected) =>
    set({
      isConnected: connected,
    }),

  setSnapshot: (squads, activeStates) =>
    set((prev) => {
      const nextLogs = new Map(prev.squadLogs);

      for (const [code, state] of Object.entries(activeStates)) {
        nextLogs.set(
          code,
          mergeLog(
            nextLogs.get(code) ?? [],
            state.log
          )
        );
      }

      const squadsMap = new Map(
        squads.map((s) => [s.code, s])
      );

      const statesMap = new Map(
        Object.entries(activeStates)
      );

      let selectedSquad = prev.selectedSquad;

      if (!selectedSquad && statesMap.size > 0) {
        selectedSquad = Array.from(statesMap.keys())[0];

        console.log(
          "[STORE] AUTO SELECT:",
          selectedSquad
        );
      }

      return {
        squads: squadsMap,
        activeStates: statesMap,
        squadLogs: nextLogs,
        selectedSquad,
      };
    }),

  setSquadActive: (squad, state) =>
    set((prev) => {
      const nextLogs = new Map(prev.squadLogs);

      nextLogs.set(
        squad,
        mergeLog(
          nextLogs.get(squad) ?? [],
          state.log
        )
      );

      return {
        activeStates: new Map(prev.activeStates).set(
          squad,
          state
        ),
        squadLogs: nextLogs,
      };
    }),

  updateSquadState: (squad, state) =>
    set((prev) => {
      const nextLogs = new Map(prev.squadLogs);

      nextLogs.set(
        squad,
        mergeLog(
          nextLogs.get(squad) ?? [],
          state.log
        )
      );

      return {
        activeStates: new Map(prev.activeStates).set(
          squad,
          state
        ),
        squadLogs: nextLogs,
      };
    }),

  setSquadInactive: (squad) =>
    set((prev) => {
      const next = new Map(prev.activeStates);

      next.delete(squad);

      return {
        activeStates: next,
        selectedSquad:
          prev.selectedSquad === squad
            ? null
            : prev.selectedSquad,
      };
    }),
}));