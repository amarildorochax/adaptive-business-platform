import * as Phaser from "phaser";
import { WORKER_SPRITES, getSpriteKeyForIndex } from "../config/animations";
import { EMOTE_SHEET_KEY, EMOTE_SHEET_PATH, EMOTE_FRAME_SIZE } from "../config/emotes";
import { buildSpriteFrames, parseSpawns, renderTileObjectLayer, type SeatDef } from "../utils/MapHelpers";
import { CameraController } from "../systems/CameraController";
import { AgentWorker } from "../entities/AgentWorker";
import { eventBridge } from "../EventBridge";
import type { Agent, AgentStatus } from "@/types/state";

type QueuedMoveAction =
  | { type: "move"; x: number; y: number }
  | { type: "wait"; duration: number };

type AgentAction =
  | { type: "move"; seatId: string }
  | { type: "status"; status: AgentStatus }
  | { type: "handoff"; from: Agent; to: Agent }
  | { type: "checkpoint"; x: number; y: number }
  | { type: "focus" }
  | { type: "highlight" }
  | { type: "wait"; duration: number };

export class OfficeScene extends Phaser.Scene {
  private cameraController!: CameraController;
  private seats: SeatDef[] = [];
  private workers = new Map<string, AgentWorker>();
  private cleanups: (() => void)[] = [];

  constructor() {
    super({ key: "OfficeScene" });
  }

  // Scene lifecycle

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

  update() {
    // Minimal — agents are stationary, emotes auto-animate
  }

  // Agent Management

  private getWorker(agentId: string): AgentWorker | undefined {
    return this.workers.get(agentId);
  }

  private hasWorker(agentId: string): boolean {
    return this.workers.has(agentId);
  }

  private getSeatPosition(seatId: string): { x: number; y: number } | undefined {
    const seat = this.seats.find((s) => s.seatId === seatId);
    return seat ? { x: seat.x, y: seat.y } : undefined;
  }

  private getWorkerPosition(agentId: string): { x: number; y: number } | undefined {
    const worker = this.getWorker(agentId);
    return worker ? worker.getPosition() : undefined;
  }

  updateAgentStatus(agentId: string, status: AgentStatus): void {
    const worker = this.getWorker(agentId);
    if (!worker) {
      this.debug(`updateAgentStatus: worker não encontrado para ${agentId}`);
      return;
    }
    worker.setStatus(status);
  }

  highlightAgent(agentId: string): void {
    const worker = this.getWorker(agentId);
    if (!worker) {
      this.debug(`highlightAgent: worker não encontrado para ${agentId}`);
      return;
    }

    this.tweens.add({
      targets: worker.sprite,
      scale: 1.08,
      duration: 150,
      yoyo: true,
      ease: "Sine.easeInOut",
    });
  }

  focusAgent(agentId: string): void {
    const position = this.getWorkerPosition(agentId);
    if (!position) {
      this.debug(`focusAgent: worker não encontrado para ${agentId}`);
      return;
    }

    this.cameras.main.centerOn(position.x, position.y);
  }

  async executeAgentAction(agentId: string, action: AgentAction): Promise<void> {
    switch (action.type) {
      case "move":
        await this.moveAgent(agentId, action.seatId);
        break;
      case "status":
        this.updateAgentStatus(agentId, action.status);
        break;
      case "handoff":
        await this.playHandoff(action.from, action.to);
        break;
      case "checkpoint":
        await this.moveAgentToCheckpoint(agentId, { x: action.x, y: action.y });
        break;
      case "focus":
        this.focusAgent(agentId);
        break;
      case "highlight":
        this.highlightAgent(agentId);
        break;
      case "wait":
        await this.wait(action.duration);
        break;
    }
  }

  // Movement

  moveAgent(agentId: string, seatId: string): Promise<void> {
    const worker = this.getWorker(agentId);
    if (!worker) {
      this.debug(`moveAgent: worker não encontrado para ${agentId}`);
      return Promise.resolve();
    }

    const seatPosition = this.getSeatPosition(seatId);
    if (!seatPosition) {
      this.debug(`moveAgent: seat não encontrada ${seatId}`);
      return Promise.resolve();
    }

    return worker.moveTo(seatPosition.x, seatPosition.y);
  }

  moveAgentToPoint(agentId: string, x: number, y: number): Promise<void> {
    const worker = this.getWorker(agentId);
    if (!worker) {
      this.debug(`moveAgentToPoint: worker não encontrado para ${agentId}`);
      return Promise.resolve();
    }

    return worker.moveTo(x, y);
  }

  moveAgentHome(agentId: string): Promise<void> {
    const worker = this.getWorker(agentId);
    if (!worker) {
      this.debug(`moveAgentHome: worker não encontrado para ${agentId}`);
      return Promise.resolve();
    }

    return worker.moveHome();
  }

  moveAllHome(): Promise<void[]> {
    return Promise.all([...this.workers.values()].map((worker) => worker.moveHome()));
  }

  moveAgents(entries: { agentId: string; seatId: string }[]): Promise<void[]> {
    return Promise.all(
      entries
        .filter((entry) => {
          if (!this.hasWorker(entry.agentId)) {
            this.debug(`moveAgents: worker não encontrado para ${entry.agentId}`);
            return false;
          }
          return true;
        })
        .map((entry) => this.moveAgent(entry.agentId, entry.seatId)),
    );
  }

  moveAgentToCheckpoint(agentId: string, checkpoint: { x: number; y: number }): Promise<void> {
    const worker = this.getWorker(agentId);
    if (!worker) {
      this.debug(`moveAgentToCheckpoint: worker não encontrado para ${agentId}`);
      return Promise.resolve();
    }

    return worker.moveToPoint(checkpoint);
  }

  async queueMovement(agentId: string, actions: QueuedMoveAction[]): Promise<void> {
    const worker = this.getWorker(agentId);
    if (!worker) {
      this.debug(`queueMovement: worker não encontrado para ${agentId}`);
      return;
    }

    for (const action of actions) {
      if (action.type === "move") {
        await worker.moveTo(action.x, action.y);
      } else {
        await this.wait(action.duration);
      }
    }
  }

  async playHandoff(fromAgent: Agent, toAgent: Agent): Promise<void> {
    const fromWorker = this.getWorker(fromAgent.id);
    const toWorker = this.getWorker(toAgent.id);

    if (!fromWorker || !toWorker) {
      this.debug(`playHandoff: worker ausente para ${fromAgent.id} ou ${toAgent.id}`);
      return;
    }

    const fromPosition = fromWorker.getPosition();
    const toPosition = toWorker.getPosition();
    const midX = (fromPosition.x + toPosition.x) / 2;
    const midY = (fromPosition.y + toPosition.y) / 2;

    await Promise.all([
      fromWorker.moveTo(midX, midY),
      toWorker.moveTo(midX, midY),
    ]);

    await this.animateHandoff(fromAgent, toAgent);

    await Promise.all([
      fromWorker.moveHome(),
      toWorker.moveHome(),
    ]);
  }

  // EventBridge

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
      let worker = this.getWorker(agent.id);

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

  private animateHandoff(from: Agent, to: Agent): Promise<void> {
    const fromWorker = this.getWorker(from.id);
    const toWorker = this.getWorker(to.id);

    if (!fromWorker || !toWorker) {
      this.debug(`animateHandoff: worker ausente para ${from.id} ou ${to.id}`);
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
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
          resolve();
        },
      });
    });
  }

  // Helpers

  private debug(...args: unknown[]): void {
    console.warn("[OfficeScene]", ...args);
  }

  private wait(duration: number): Promise<void> {
    return new Promise<void>((resolve) => {
      this.time.delayedCall(duration, () => resolve());
    });
  }

  // Cleanup

  private cleanup() {
    for (const unsub of this.cleanups) unsub();
    this.cleanups = [];
    this.clearAgents();
  }
}
