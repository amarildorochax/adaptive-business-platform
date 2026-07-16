import * as Phaser from "phaser";
import { OfficeScene } from "./scenes/OfficeScene";

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  scene: [OfficeScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.NO_CENTER,
  },
};
