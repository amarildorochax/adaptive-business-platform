import type { AIProvider } from "./AIProvider";
import { env } from "@/config/env";

// Futuramente
// import { OpenAIProvider } from "@/providers/openai/OpenAIProvider";
// import { ClaudeProvider } from "@/providers/claude/ClaudeProvider";
import { MockAIProvider } from "@/providers/mock/MockAIProvider";

export class AIProviderFactory {
  static create(): AIProvider {
    switch (env.aiProvider.toLowerCase()) {
      case "openai":
        // return new OpenAIProvider();
        return new MockAIProvider();

      case "claude":
        // return new ClaudeProvider();
        return new MockAIProvider();

      default:
        return new MockAIProvider();
    }
  }
}