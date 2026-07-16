import type { Plugin, ViteDevServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import type { Server, IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import type { Artifact, SquadInfo, SquadState, WsMessage } from "../types/state";

function resolveSquadsDir(): string {
  const candidates = [
    path.resolve(process.cwd(), "../squads"),  // started from dashboard/
    path.resolve(process.cwd(), "squads"),     // started from project root
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return path.resolve(process.cwd(), "../squads"); // default (will be created on demand)
}

function discoverSquads(squadsDir: string): SquadInfo[] {
  if (!fs.existsSync(squadsDir)) return [];

  const entries = fs.readdirSync(squadsDir, { withFileTypes: true });
  const squads: SquadInfo[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith(".") || entry.name.startsWith("_")) continue;

    const yamlPath = path.join(squadsDir, entry.name, "squad.yaml");
    if (fs.existsSync(yamlPath)) {
      try {
        const raw = fs.readFileSync(yamlPath, "utf-8");
        const parsed = parseYaml(raw);
        // Support both flat YAML (name: ...) and wrapped YAML (squad: { name: ... })
        const s = parsed?.squad ?? parsed;
        if (s && typeof s === "object") {
          const displayName = typeof s.display_name === "string" ? s.display_name : undefined;
          squads.push({
            code: typeof s.code === "string" ? s.code : (typeof s.name === "string" ? s.name : entry.name),
            name: displayName ?? (typeof s.name === "string" ? s.name : entry.name),
            description: typeof s.description === "string" ? s.description.trim() : "",
            icon: typeof s.icon === "string" ? s.icon : "\u{1F4CB}",
            agents: Array.isArray(s.agents) ? (s.agents as unknown[]).filter((a): a is string => typeof a === "string") : [],
          });
          continue;
        }
      } catch {
        // Fall through to default
      }
    }

    // No squad.yaml or invalid YAML — use directory name as fallback
    squads.push({
      code: entry.name,
      name: entry.name,
      description: "",
      icon: "\u{1F4CB}",
      agents: [],
    });
  }

  return squads;
}

function artifactType(filename: string): Artifact["type"] {
  const ext = path.extname(filename).toLowerCase();
  if ([".mp4", ".webm", ".mov", ".avi"].includes(ext)) return "video";
  if ([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"].includes(ext)) return "image";
  if ([".md", ".markdown"].includes(ext)) return "markdown";
  if ([".json", ".csv", ".tsv", ".xml", ".yaml", ".yml"].includes(ext)) return "data";
  if ([".pdf"].includes(ext)) return "pdf";
  if ([".txt", ".log"].includes(ext)) return "text";
  return "file";
}

function collectArtifacts(squadDir: string): Artifact[] {
  const outputDir = path.join(squadDir, "output");
  if (!fs.existsSync(outputDir)) return [];

  const artifacts: Artifact[] = [];

  // Find the most recent run folder
  let runFolders: string[] = [];
  try {
    runFolders = fs.readdirSync(outputDir)
      .filter((e) => !e.startsWith("."))
      .sort()
      .reverse(); // most recent first
  } catch {
    return [];
  }

  // Collect files from most recent run
  const runFolder = runFolders[0];
  if (!runFolder) return [];

  const runPath = path.join(outputDir, runFolder);
  try {
    const walk = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith(".")) continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
        } else {
          const rel = path.relative(runPath, full);
          const stat = fs.statSync(full);
          artifacts.push({
            name: entry.name,
            path: rel,
            type: artifactType(entry.name),
            size: stat.size,
          });
        }
      }
    };
    walk(runPath);
  } catch {
    // ignore
  }

  return artifacts;
}

function isValidState(data: unknown): data is SquadState {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.status === "string" &&
    d.step != null && typeof d.step === "object" &&
    Array.isArray(d.agents)
  );
}

function readActiveStates(squadsDir: string): Record<string, SquadState> {
  const states: Record<string, SquadState> = {};
  if (!fs.existsSync(squadsDir)) return states;

  const entries = fs.readdirSync(squadsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const statePath = path.join(squadsDir, entry.name, "state.json");
    if (!fs.existsSync(statePath)) continue;

    try {
      const raw = fs.readFileSync(statePath, "utf-8");
      const parsed = JSON.parse(raw);
      if (isValidState(parsed)) {
        parsed.artifacts = collectArtifacts(path.join(squadsDir, entry.name));
        states[entry.name] = parsed;
      }
    } catch {
      // Skip invalid JSON
    }
  }

  return states;
}

function buildSnapshot(squadsDir: string): WsMessage {
  return {
    type: "SNAPSHOT",
    squads: discoverSquads(squadsDir),
    activeStates: readActiveStates(squadsDir),
  };
}

function broadcast(wss: WebSocketServer, msg: WsMessage) {
  const data = JSON.stringify(msg);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

export function squadWatcherPlugin(): Plugin {
  return {
    name: "squad-watcher",
    configureServer(server: ViteDevServer) {
      const squadsDir = resolveSquadsDir();
      server.config.logger.info(`[squad-watcher] squads dir: ${squadsDir}`);

      // Create WebSocket server with noServer to avoid intercepting Vite's HMR
      const wss = new WebSocketServer({ noServer: true });
      (server.httpServer as Server).on("upgrade", (req: IncomingMessage, socket: Duplex, head: Buffer) => {

        console.log("[UPGRADE]", req.url);
        
        if (req.url === "/__squads_ws") {
          wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit("connection", ws, req);
          });
        }
        // Let Vite handle all other upgrade requests (HMR)
      });

      // Send snapshot on new connection
      wss.on("connection", (ws) => {

  console.log("[WS] Sending snapshot");

  ws.send(JSON.stringify(buildSnapshot(squadsDir)));

  ws.on("close", () => {
    console.log("[WS] Client disconnected");
  });

  ws.on("error", (err) => {
    console.error("[WS] Client error", err);
  });

});

      // Ensure squads directory exists
      if (!fs.existsSync(squadsDir)) {
        fs.mkdirSync(squadsDir, { recursive: true });
      }

      // Watch state.json files using Vite's built-in chokidar watcher
      const stateGlob = path.join(squadsDir, "*/state.json").replace(/\\/g, "/");
      server.watcher.add(stateGlob);

      // Debounce timers per squad to avoid reading partial writes
      const changeTimers = new Map<string, ReturnType<typeof setTimeout>>();

      // Also watch for new squad.yaml files
      const yamlGlob = path.join(squadsDir, "*/squad.yaml").replace(/\\/g, "/");
      server.watcher.add(yamlGlob);

      server.watcher.on("add", (filePath: string) => {
        if (filePath.endsWith("state.json")) {
          const squadName = extractSquadName(filePath, squadsDir);
          if (!squadName) return;
          clearTimeout(changeTimers.get(squadName));
          changeTimers.set(squadName, setTimeout(() => {
            try {
              const raw = fs.readFileSync(filePath, "utf-8");
              const state: SquadState = JSON.parse(raw);
              state.artifacts = collectArtifacts(path.join(squadsDir, squadName));
              broadcast(wss, { type: "SQUAD_ACTIVE", squad: squadName, state });
            } catch { /* skip */ }
          }, 50));
        } else if (filePath.endsWith("squad.yaml")) {
          broadcast(wss, buildSnapshot(squadsDir));
        }
      });

      server.watcher.on("change", (filePath: string) => {
        if (filePath.endsWith("state.json")) {
          const squadName = extractSquadName(filePath, squadsDir);
          if (!squadName) return;
          clearTimeout(changeTimers.get(squadName));
          changeTimers.set(squadName, setTimeout(() => {
            try {
              const raw = fs.readFileSync(filePath, "utf-8");
              const state: SquadState = JSON.parse(raw);
              state.artifacts = collectArtifacts(path.join(squadsDir, squadName));
              broadcast(wss, { type: "SQUAD_UPDATE", squad: squadName, state });
            } catch { /* skip */ }
          }, 50));
        } else if (filePath.endsWith("squad.yaml")) {
          broadcast(wss, buildSnapshot(squadsDir));
        }
      });

      server.watcher.on("unlink", (filePath: string) => {
        if (filePath.endsWith("state.json")) {
          const squadName = extractSquadName(filePath, squadsDir);
          if (!squadName) return;
          clearTimeout(changeTimers.get(squadName));
          changeTimers.delete(squadName);
          broadcast(wss, { type: "SQUAD_INACTIVE", squad: squadName });
        } else if (filePath.endsWith("squad.yaml")) {
          broadcast(wss, buildSnapshot(squadsDir));
        }
      });
    },
  };
}

function extractSquadName(filePath: string, squadsDir: string): string | null {
  const normalized = filePath.replace(/\\/g, "/");
  const normalizedBase = squadsDir.replace(/\\/g, "/");
  const relative = normalized.replace(normalizedBase + "/", "");
  const parts = relative.split("/");
  return parts.length >= 2 ? parts[0] : null;
}
