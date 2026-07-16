import * as Phaser from "phaser";

export class OfficeScene extends Phaser.Scene {
  constructor() {
    super({ key: "OfficeScene" });
  }

  preload() {}

  create() {
    this.cameras.main.setBackgroundColor("#1e40af");

    this.add.text(80, 80, "PHASER OK", {
      color: "#ffffff",
      fontSize: "32px",
    });

    console.log("[TESTE] OfficeScene mínima criada");
  }

  update() {}
}