import { Suspense, lazy, useEffect, useRef } from "react";
import { useSquadStore } from "@/store/useSquadStore";
import { ArtifactPanel } from "@/components/ArtifactPanel";

const PhaserGame = lazy(() => import("@/game/PhaserGame"));

export function SceneArea() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (wrapperRef.current) {
      console.log(
        "[SceneArea] Wrapper:",
        wrapperRef.current.clientWidth,
        wrapperRef.current.clientHeight
      );
    }
  }, []);

  const selectedSquad = useSquadStore((s) => s.selectedSquad);

  const squadInfo = useSquadStore((s) =>
    s.selectedSquad ? s.squads.get(s.selectedSquad) : undefined
  );

  const artifacts = useSquadStore((s) => {
    if (!s.selectedSquad) return null;
    return s.activeStates.get(s.selectedSquad)?.artifacts ?? null;
  });

  if (!selectedSquad) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          color: "#94A3B8",
        }}
      >
        Selecione uma Squad
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      {squadInfo && (
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            zIndex: 10,
            background: "rgba(15,23,42,.85)",
            color: "#fff",
            padding: "6px 10px",
            borderRadius: 8,
            display: "flex",
            gap: 8,
          }}
        >
          <span>{squadInfo.icon}</span>
          <strong>{squadInfo.name}</strong>
        </div>
      )}

      <Suspense fallback={<div>Carregando cenário...</div>}>
        <PhaserGame />
      </Suspense>

      {!!artifacts?.length && (
        <ArtifactPanel
          artifacts={artifacts}
          squadCode={selectedSquad}
        />
      )}
    </div>
  );
}