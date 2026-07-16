import * as Phaser from "phaser";

const ZOOM_MIN = 0.4;
const ZOOM_MAX = 2.0;
const ZOOM_SENSITIVITY = 0.001;
const DRAG_THRESHOLD = 3;

export class CameraController {
  private scene: Phaser.Scene;
  private mapWidth: number;
  private mapHeight: number;
  private dragging = false;

  constructor(scene: Phaser.Scene, mapWidth: number, mapHeight: number) {
    this.scene = scene;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
  }

  init() {
    const cam = this.scene.cameras.main;
    cam.setBackgroundColor("#1a1814");
    cam.setRoundPixels(true);

    this.autoFrame();
    this.scene.scale.on("resize", () => this.autoFrame());
    this.initWheel(cam);
    this.initDrag(cam);
  }

  autoFrame() {
    const cam = this.scene.cameras.main;
    const zoomX = cam.width / this.mapWidth;
    const zoomY = cam.height / this.mapHeight;
    const zoom = Math.min(zoomX, zoomY) * 0.95;
    cam.setZoom(Phaser.Math.Clamp(zoom, ZOOM_MIN, ZOOM_MAX));
    cam.centerOn(this.mapWidth / 2, this.mapHeight / 2);
    this.updateBounds();
  }

  private updateBounds() {
    const cam = this.scene.cameras.main;
    const viewW = cam.width / cam.zoom;
    const viewH = cam.height / cam.zoom;
    const mw = this.mapWidth;
    const mh = this.mapHeight;

    const bx = viewW > mw ? -(viewW - mw) / 2 : 0;
    const by = viewH > mh ? -(viewH - mh) / 2 : 0;
    const bw = viewW > mw ? viewW : mw;
    const bh = viewH > mh ? viewH : mh;
    cam.setBounds(bx, by, bw, bh);
  }

  private initWheel(cam: Phaser.Cameras.Scene2D.Camera) {
    const canvas = this.scene.game.canvas;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.ctrlKey ? e.deltaY * 3 : e.deltaY;
      const oldZoom = cam.zoom;
      const newZoom = Phaser.Math.Clamp(oldZoom - delta * ZOOM_SENSITIVITY, ZOOM_MIN, ZOOM_MAX);
      if (newZoom === oldZoom) return;

      const sx = e.offsetX / cam.scaleManager.displayScale.x;
      const sy = e.offsetY / cam.scaleManager.displayScale.y;
      const worldBefore = cam.getWorldPoint(sx, sy);
      cam.setZoom(newZoom);
      this.updateBounds();
      const worldAfter = cam.getWorldPoint(sx, sy);
      cam.scrollX += worldBefore.x - worldAfter.x;
      cam.scrollY += worldBefore.y - worldAfter.y;
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    this.scene.events.once("shutdown", () => canvas.removeEventListener("wheel", onWheel));
  }

  private initDrag(cam: Phaser.Cameras.Scene2D.Camera) {
    let lastX = 0;
    let lastY = 0;

    this.scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        this.dragging = true;
        lastX = pointer.x;
        lastY = pointer.y;
      }
    });

    this.scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (!this.dragging || !pointer.leftButtonDown()) return;
      const dx = lastX - pointer.x;
      const dy = lastY - pointer.y;
      lastX = pointer.x;
      lastY = pointer.y;
      if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
        cam.scrollX += dx / cam.zoom;
        cam.scrollY += dy / cam.zoom;
      }
    });

    this.scene.input.on("pointerup", () => {
      this.dragging = false;
    });
  }
}
