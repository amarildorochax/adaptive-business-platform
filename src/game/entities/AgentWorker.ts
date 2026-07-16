import * as Phaser from "phaser";
import {
  FRAME_HEIGHT,
  makeAnims,
  type Direction,
} from "../config/animations";
import {
  EMOTE_SHEET_KEY,
  EMOTE_ANIMS,
  STATUS_EMOTE_MAP,
} from "../config/emotes";
import { buildSpriteFrames } from "../utils/MapHelpers";
import type { AgentStatus } from "@/types/state";

const EMOTE_Y_OFFSET = 0.7;

export class AgentWorker {
  sprite: Phaser.GameObjects.Sprite;
  readonly seatId: string;
  readonly spriteKey: string;

  private scene: Phaser.Scene;
  private nameTag: Phaser.GameObjects.Text;
  private statusDot: Phaser.GameObjects.Arc;
  private emoteSprite: Phaser.GameObjects.Sprite | null = null;
  private currentEmoteKey: string | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    spriteKey: string,
    seatId: string,
    agentName: string,
    agentIcon: string,
    facing: Direction = "down",
  ) {
    console.log("=================================");
    console.log("[AgentWorker] NOVO AGENTE");

    console.log(
      "[POSIÇÃO]",
      "nome =", agentName,
      "| sprite =", spriteKey,
      "| seat =", seatId,
      "| x =", x,
      "| y =", y,
      "| facing =", facing
    );

    this.scene = scene;
    this.seatId = seatId;
    this.spriteKey = spriteKey;

    console.log("[1] ensureAnims");

    this.ensureAnims(scene, spriteKey);

    console.log(
      "[2] texture existe?",
      scene.textures.exists(spriteKey)
    );

    this.sprite = scene.add.sprite(
      x,
      y,
      spriteKey,
      0
    );

    console.log("[3] sprite criado");

    console.log("[SPRITE]", {
      x: this.sprite.x,
      y: this.sprite.y,
      visible: this.sprite.visible,
      alpha: this.sprite.alpha,
      depth: this.sprite.depth,
      frame: this.sprite.frame.name,
    });

    this.sprite.setDepth(15);

    console.log(
      "[4] animação:",
      `${spriteKey}:idle-${facing}`
    );

    this.sprite.anims.play(
      `${spriteKey}:idle-${facing}`
    );

    console.log("[5] animação aplicada");

    console.log(
      "[ANIMAÇÃO]",
      this.sprite.anims.currentAnim?.key
    );

    const nameY = y + FRAME_HEIGHT / 2 + 2;

    this.nameTag = scene.add
      .text(
        x,
        nameY,
        `${agentIcon} ${agentName}`,
        {
          fontFamily:
            '"ArkPixel","Press Start 2P",monospace',
          fontSize: "8px",
          color: "#e0e0e0",
          backgroundColor: "rgba(0,0,0,.7)",
          padding: {
            x: 4,
            y: 2,
          },
        }
      )
      .setOrigin(0.5, 0)
      .setDepth(20);

    console.log("[6] nome criado");

    this.statusDot = scene.add.circle(
      x - this.nameTag.width / 2 - 6,
      nameY + 4,
      3,
      0x888888
    );

    this.statusDot.setDepth(20);

    console.log("[7] status criado");

    this.initEmoteSprite();

    console.log("[8] fim constructor");
    console.log("=================================");
  }

  private ensureAnims(
    scene: Phaser.Scene,
    spriteKey: string
  ) {
    if (
      scene.anims.exists(
        `${spriteKey}:idle-down`
      )
    )
      return;

    buildSpriteFrames(scene, spriteKey);

    const idleAnims = makeAnims(
      spriteKey,
      "idle",
      1,
      8
    );

    const walkAnims = makeAnims(
      spriteKey,
      "walk",
      2,
      10
    );

    for (const anim of [
      ...idleAnims,
      ...walkAnims,
    ]) {
      const frames: Phaser.Types.Animations.AnimationFrame[] = [];

      for (let i = anim.start; i <= anim.end; i++) {
        frames.push({
          key: spriteKey,
          frame: i,
        });
      }

      scene.anims.create({
        key: anim.key,
        frames,
        frameRate: anim.frameRate,
        repeat: anim.repeat,
      });
    }
  }

  private initEmoteSprite() {
    if (!this.scene.textures.exists(EMOTE_SHEET_KEY))
      return;

    this.emoteSprite = this.scene.add.sprite(
      this.sprite.x,
      this.sprite.y - FRAME_HEIGHT * EMOTE_Y_OFFSET,
      EMOTE_SHEET_KEY,
      0
    );

    this.emoteSprite.setDepth(22);
    this.emoteSprite.setVisible(false);

    for (const def of EMOTE_ANIMS) {
      if (this.scene.anims.exists(def.key))
        continue;

      this.scene.anims.create({
        key: def.key,
        frames: def.frames.map((f) => ({
          key: EMOTE_SHEET_KEY,
          frame: f,
        })),
        frameRate: def.frameRate,
        repeat: def.repeat,
      });
    }
  }

  setStatus(status: AgentStatus) {
    const colors = {
      idle: 0x888888,
      working: 0xfacc15,
      delivering: 0x3b82f6,
      done: 0x22c55e,
      checkpoint: 0xf59e0b,
    };

    this.statusDot.setFillStyle(colors[status]);

    const emote = STATUS_EMOTE_MAP[status];

    if (emote) {
      this.showEmote(emote);
    } else {
      this.hideEmote();
    }
  }

  showEmote(emoteKey: string) {
    if (!this.emoteSprite) return;

    if (this.currentEmoteKey === emoteKey)
      return;

    this.currentEmoteKey = emoteKey;

    this.emoteSprite.setVisible(true);
    this.emoteSprite.play(emoteKey);
  }

  hideEmote() {
    if (!this.emoteSprite) return;

    this.emoteSprite.stop();
    this.emoteSprite.setVisible(false);
    this.currentEmoteKey = null;
  }

  destroy() {
    this.emoteSprite?.destroy();
    this.sprite.destroy();
    this.nameTag.destroy();
    this.statusDot.destroy();
  }
}