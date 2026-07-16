import * as Phaser from "phaser";
import { WORKER_SPRITES, getSpriteKeyForIndex } from "../config/animations";
import { EMOTE_SHEET_KEY, EMOTE_SHEET_PATH, EMOTE_FRAME_SIZE } from "../config/emotes";
import { buildSpriteFrames, parseSpawns, renderTileObjectLayer, type SeatDef } from "../utils/MapHelpers";
import { CameraController } from "../systems/CameraController";
import { AgentWorker } from "../entities/AgentWorker";
import { eventBridge } from "../EventBridge";
import type { Agent } from "@/types/state";

export class OfficeScene extends Phaser.Scene {
  private cameraController!: CameraController;
  private seats: SeatDef[] = [];
  private workers = new Map<string, AgentWorker>();
  private cleanups: (() => void)[] = [];

  constructor() {
    super({ key: "OfficeScene" });
  }

  preload() {
    this.load.tilemapTiledJSON("office", "/maps/office2.json");

    this.load.once("filecomplete-tilemapJSON-office", () => {
      const cached = this.cache.tilemap.get("office");
      if (!cached?.data?.tilesets) return;
      for (const ts of cached.data.tilesets) {
        const basename = (ts.image as string).split("/").pop()!;
        this.load.image(ts.name, `/tilesets/${basename}`);
      }
    });

    for (const ws of WORKER_SPRITES) {
      this.load.image(ws.key, ws.path);
    }

    this.load.spritesheet(EMOTE_SHEET_KEY, EMOTE_SHEET_PATH, {
      frameWidth: EMOTE_FRAME_SIZE,
      frameHeight: EMOTE_FRAME_SIZE,
    });

    this.load.spritesheet("anim-door", "/sprites/animated_door_big_4_48x48.png", {
      frameWidth: 48,
      frameHeight: 144,
    });
  }

  create() {
    for (const ws of WORKER_SPRITES) {
      buildSpriteFrames(this, ws.key);
    }

    const map = this.make.tilemap({ key: "office" });

    const allTilesets: Phaser.Tilemaps.Tileset[] = [];
    for (const ts of map.tilesets) {
      const added = map.addTilesetImage(ts.name, ts.name);
      if (added) allTilesets.push(added);
    }
    if (allTilesets.length === 0) {
      console.error("[OfficeScene] No tilesets loaded");
      return;
    }

    map.createLayer("floor", allTilesets);
    map.createLayer("walls", allTilesets);
    map.createLayer("ground", allTilesets);
    map.createLayer("furniture", allTilesets);
    map.createLayer("objects", allTilesets);

    renderTileObjectLayer(this, map, "props", allTilesets, 5);
    renderTileObjectLayer(this, map, "props-over", allTilesets, 11);

    const overheadLayer = map.createLayer("overhead", allTilesets);
    if (overheadLayer) overheadLayer.setDepth(10);

    this.seats = parseSpawns(map);

    this.cameraController = new CameraController(this, map.widthInPixels, map.heightInPixels);
    this.cameraController.init();

    // Subscribe to EventBridge
    this.cleanups.push(
      eventBridge.on("squad-changed", (agents) => this.syncAgents(agents)),
      eventBridge.on("squad-cleared", () => this.clearAgents()),
      eventBridge.on("handoff", (from, to) => this.animateHandoff(from, to)),
    );

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup());
    this.events.once(Phaser.Scenes.Events.DESTROY, () => this.cleanup());

    eventBridge.emit("scene-ready");
  }

  private syncAgents(agents: Agent[]) {
    const sorted = [...agents].sort((a, b) => {
      if (a.desk.row !== b.desk.row) return a.desk.row - b.desk.row;
      return a.desk.col - b.desk.col;
    });

    const activeIds = new Set<string>();

    for (let i = 0; i < sorted.length; i++) {
      const agent = sorted[i];
      activeIds.add(agent.id);

      if (i >= this.seats.length) {
        console.warn(`[OfficeScene] No seat for agent ${agent.id} (index ${i})`);
        continue;
      }

      const seat = this.seats[i];
      let worker = this.workers.get(agent.id);

      if (!worker) {
        const spriteKey = getSpriteKeyForIndex(i);
        worker = new AgentWorker(
          this,
          seat.x,
          seat.y,
          spriteKey,
          seat.seatId,
          agent.name,
          agent.icon,
          seat.facing,
        );
        this.workers.set(agent.id, worker);
      }

      worker.setStatus(agent.status);
    }

    // Remove workers for agents no longer present
    for (const [id, worker] of this.workers) {
      if (!activeIds.has(id)) {
        worker.destroy();
        this.workers.delete(id);
      }
    }
  }

  private clearAgents() {
    for (const worker of this.workers.values()) {
      worker.destroy();
    }
    this.workers.clear();
  }

  private animateHandoff(from: Agent, to: Agent) {
    const fromWorker = this.workers.get(from.id);
    const toWorker = this.workers.get(to.id);
    if (!fromWorker || !toWorker) return;

    const envelope = this.add
      .text(fromWorker.sprite.x, fromWorker.sprite.y - 40, "✉️", { fontSize: "16px" })
      .setOrigin(0.5)
      .setDepth(25);

    this.tweens.add({
      targets: envelope,
      x: toWorker.sprite.x,
      y: toWorker.sprite.y - 40,
      duration: 600,
      ease: "Cubic.easeInOut",
      onComplete: () => {
        envelope.destroy();
        toWorker.showEmote("emote:alert");
      },
    });
  }

  private cleanup() {
    for (const unsub of this.cleanups) unsub();
    this.cleanups = [];
    this.clearAgents();
  }

  update() {
    // Minimal — agents are stationary, emotes auto-animate
  }
}
