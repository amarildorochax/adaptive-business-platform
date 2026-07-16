export const FRAME_WIDTH = 48;
export const FRAME_HEIGHT = 96;
export const SHEET_COLUMNS = 56;

const FRAMES_PER_DIR = 6;

export interface AnimDef {
  key: string;
  start: number;
  end: number;
  frameRate: number;
  repeat: number;
}

export interface WorkerSpriteConfig {
  key: string;
  path: string;
}

export const WORKER_SPRITES: WorkerSpriteConfig[] = [
  { key: "character_01", path: "/characters/Premade_Character_48x48_01.png" },
  { key: "character_02", path: "/characters/Premade_Character_48x48_02.png" },
  { key: "character_03", path: "/characters/Premade_Character_48x48_03.png" },
  { key: "character_04", path: "/characters/Premade_Character_48x48_04.png" },
  { key: "character_05", path: "/characters/Premade_Character_48x48_05.png" },
  { key: "character_06", path: "/characters/Premade_Character_48x48_06.png" },
  { key: "character_09", path: "/characters/Premade_Character_48x48_09.png" },
];

const directions = ["right", "up", "left", "down"] as const;
export type Direction = (typeof directions)[number];

export function makeAnims(spriteKey: string, prefix: string, row: number, frameRate: number): AnimDef[] {
  return directions.map((dir, i) => ({
    key: `${spriteKey}:${prefix}-${dir}`,
    start: row * SHEET_COLUMNS + i * FRAMES_PER_DIR,
    end: row * SHEET_COLUMNS + i * FRAMES_PER_DIR + FRAMES_PER_DIR - 1,
    frameRate,
    repeat: -1,
  }));
}

export function getSpriteKeyForIndex(index: number): string {
  return WORKER_SPRITES[index % WORKER_SPRITES.length].key;
}
