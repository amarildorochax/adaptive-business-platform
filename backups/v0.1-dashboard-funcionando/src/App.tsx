import { useSquadSocket } from "@/hooks/useSquadSocket";
import { useEventBridge } from "@/game/hooks/useEventBridge";
import { DashboardPage } from "@/pages/DashboardPage";

export function App() {
  console.log("[APP] Renderizou");

  useSquadSocket();
  useEventBridge();

  return <DashboardPage />;
}