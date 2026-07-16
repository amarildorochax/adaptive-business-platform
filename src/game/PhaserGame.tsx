"use client";

import { useEffect, useRef } from "react";
import type * as PhaserTypes from "phaser";
import { useEventBridge } from "./hooks/useEventBridge";

export default function PhaserGame() {
  const gameRef = useRef<PhaserTypes.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEventBridge();

  useEffect(() => {
    let mounted = true;

    async function initGame() {
      if (!containerRef.current) return;

      const { gameConfig } = await import("./config");
      const Phaser = await import("phaser");

      if (!mounted) return;

      const game = new Phaser.Game({
        ...gameConfig,
        parent: containerRef.current,
      });
      gameRef.current = game;
    }

    initGame().catch((err) => {
      console.error("[PhaserGame] init failed:", err);
    });

    return () => {
      mounted = false;
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        imageRendering: "pixelated",
      }}
    />
  );
}
