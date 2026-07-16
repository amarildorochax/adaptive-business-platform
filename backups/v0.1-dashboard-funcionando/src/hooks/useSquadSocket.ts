import { useEffect, useRef } from "react";
import { useSquadStore } from "@/store/useSquadStore";
import type { WsMessage } from "@/types/state";

const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30000;

export function useSquadSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectDelayRef = useRef(RECONNECT_BASE_MS);

  // React 19 + Zustand
  const setConnected = useSquadStore((s) => s.setConnected);
  const setSnapshot = useSquadStore((s) => s.setSnapshot);
  const setSquadActive = useSquadStore((s) => s.setSquadActive);
  const updateSquadState = useSquadStore((s) => s.updateSquadState);
  const setSquadInactive = useSquadStore((s) => s.setSquadInactive);

  useEffect(() => {
    let disposed = false;
    let reconnectTimer: ReturnType<typeof setTimeout>;

    function connect() {
      if (disposed) return;

      const protocol =
        window.location.protocol === "https:" ? "wss:" : "ws:";

      const ws = new WebSocket(
        `${protocol}//${window.location.host}/__squads_ws`
      );

      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[CLIENTE] WebSocket conectado");

        setConnected(true);

        reconnectDelayRef.current = RECONNECT_BASE_MS;
      };

      ws.onmessage = (event) => {
        try {
          const msg: WsMessage = JSON.parse(event.data);

          console.log("[CLIENTE] Mensagem recebida:", msg.type);

          switch (msg.type) {
            case "SNAPSHOT": {
              console.log("[CLIENTE] SNAPSHOT", msg);

              setSnapshot(
                msg.squads,
                msg.activeStates
              );

              console.log(
                "[STORE APÓS SNAPSHOT]",
                useSquadStore.getState()
              );

              break;
            }

            case "SQUAD_ACTIVE":
              console.log("[CLIENTE] SQUAD_ACTIVE", msg.squad);

              setSquadActive(
                msg.squad,
                msg.state
              );

              break;

            case "SQUAD_UPDATE":
              console.log("[CLIENTE] SQUAD_UPDATE", msg.squad);

              updateSquadState(
                msg.squad,
                msg.state
              );

              break;

            case "SQUAD_INACTIVE":
              console.log("[CLIENTE] SQUAD_INACTIVE", msg.squad);

              setSquadInactive(
                msg.squad
              );

              break;

            default:
              console.warn(
                "[CLIENTE] Mensagem desconhecida",
                msg
              );
          }
        } catch (err) {
          console.error(
            "[CLIENTE] Erro ao processar mensagem",
            err
          );
        }
      };

      ws.onclose = () => {
        console.log("[CLIENTE] WebSocket desconectado");

        setConnected(false);

        if (!disposed) {
          reconnectTimer = setTimeout(() => {
            reconnectDelayRef.current = Math.min(
              reconnectDelayRef.current * 2,
              RECONNECT_MAX_MS
            );

            connect();
          }, reconnectDelayRef.current);
        }
      };

      ws.onerror = (err) => {
        console.error("[CLIENTE] WebSocket erro", err);

        ws.close();
      };
    }

    connect();

    return () => {
      disposed = true;

      clearTimeout(reconnectTimer);

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [
    setConnected,
    setSnapshot,
    setSquadActive,
    updateSquadState,
    setSquadInactive,
  ]);
}