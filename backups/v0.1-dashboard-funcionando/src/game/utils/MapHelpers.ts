import * as Phaser from "phaser";
import { FRAME_WIDTH, FRAME_HEIGHT, SHEET_COLUMNS, type Direction } from "../config/animations";

export interface SeatDef {
  seatId: string;
  x: number;
  y: number;
  facing: Direction;
  index: number;
}

export function buildSpriteFrames(scene: Phaser.Scene, key: string) {
  const tex = scene.textures.get(key);
  if (!tex.source.length) return;
  const rows = Math.floor(tex.source[0].height / FRAME_HEIGHT);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < SHEET_COLUMNS; col++) {
      tex.add(
        row * SHEET_COLUMNS + col,
        0,
        col * FRAME_WIDTH,
        row * FRAME_HEIGHT,
        FRAME_WIDTH,
        FRAME_HEIGHT,
      );
    }
  }
}

export function parseSpawns(map: Phaser.Tilemaps.Tilemap): SeatDef[] {
  const spawnsLayer = map.getObjectLayer("spawns");
  if (!spawnsLayer || spawnsLayer.objects.length === 0) return [];

  const getFacing = (obj: Phaser.Types.Tilemaps.TiledObject): Direction => {
    const props = obj.properties as Array<{ name: string; value: string }> | undefined;
    const fp = props?.find((p) => p.name === "facing");
    return (fp?.value as Direction) ?? "down";
  };

  return spawnsLayer.objects
    .map((obj, index) => ({
      seatId: obj.name || `seat-${index}`,
      x: obj.x!,
      y: obj.y!,
      facing: getFacing(obj),
      index,
    }))
    .sort((a, b) => a.y - b.y || a.x - b.x);
}

export interface AnimatedProp {
  tilesetName: string;
  anchorLocalId: number;
  skipLocalIds: Set<number>;
  spriteKey: string;
  frameWidth: number;
  frameHeight: number;
  endFrame: number;
  frameRate: number;
}

export function renderTileObjectLayer(
  scene: Phaser.Scene,
  map: Phaser.Tilemaps.Tilemap,
  layerName: string,
  tilesets: Phaser.Tilemaps.Tileset[],
  depth: number,
  animatedProps?: AnimatedProp[],
) {
  const objectLayer = map.getObjectLayer(layerName);
  if (!objectLayer) return;

  for (const obj of objectLayer.objects) {
    if (!obj.gid) continue;

    let tileset: Phaser.Tilemaps.Tileset | null = null;
    for (let i = tilesets.length - 1; i >= 0; i--) {
      if (obj.gid >= tilesets[i].firstgid) {
        tileset = tilesets[i];
        break;
      }
    }
    if (!tileset) continue;

    const localId = obj.gid - tileset.firstgid;

    const anim = animatedProps?.find(
      (a) => a.tilesetName === tileset!.name && a.skipLocalIds.has(localId),
    );

    if (anim) {
      if (localId === anim.anchorLocalId) {
        const animKey = `${anim.spriteKey}-anim`;
        if (!scene.anims.exists(animKey)) {
          scene.anims.create({
            key: animKey,
            frames: scene.anims.generateFrameNumbers(anim.spriteKey, {
              start: 0,
              end: anim.endFrame,
            }),
            frameRate: anim.frameRate,
            repeat: -1,
          });
        }
        const tileH = tileset.tileHeight;
        scene.add
          .sprite(obj.x!, obj.y! - anim.frameHeight + tileH, anim.spriteKey)
          .setOrigin(0, 0)
          .setDepth(depth)
          .play(animKey);
      }
      continue;
    }

    const tileW = tileset.tileWidth;
    const tileH = tileset.tileHeight;
    const srcX = (localId % tileset.columns) * tileW;
    const srcY = Math.floor(localId / tileset.columns) * tileH;

    const frameKey = `${tileset.name}_${localId}`;
    if (!scene.textures.exists(frameKey)) {
      const baseTexture = scene.textures.get(tileset.name);
      baseTexture.add(localId, 0, srcX, srcY, tileW, tileH);
    }

    scene.add
      .image(obj.x!, obj.y! - tileH, tileset.name, localId)
      .setOrigin(0, 0)
      .setDepth(depth);
  }
}
