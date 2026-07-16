import { SceneArea } from "@/components/scene/SceneArea";
import styles from "./ScenePanel.module.css";

export function ScenePanel() {
  return (
    <main className={styles.container}>
      <div className={styles.scene}>
        <SceneArea />
      </div>
    </main>
  );
}