import { Header } from "@/components/header/Header";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { ScenePanel } from "@/components/center/ScenePanel";
import { RightPanel } from "@/components/rightpanel/RightPanel";
import { BottomPanel } from "@/components/bottom/BottomPanel";
import { KpiCards } from "@/components/cards/KpiCards";

import styles from "./DashboardLayout.module.css";

export function DashboardLayout() {
  return (
    <div className={styles.layout}>
      <Header />

      <KpiCards />

      <div className={styles.content}>
        <Sidebar />

        <ScenePanel />

        <RightPanel />
      </div>

      <BottomPanel />
    </div>
  );
}