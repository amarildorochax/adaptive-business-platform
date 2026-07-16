import { AgentSimulator } from "../simulation/AgentSimulator";

let simulator: AgentSimulator | null = null;

export function startPlatform(): void {
  if (simulator) {
    return;
  }

  simulator = new AgentSimulator();

  simulator.start("blog-agent");
}