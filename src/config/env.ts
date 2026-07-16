export const env = {
  aiProvider:
    import.meta.env.VITE_AI_PROVIDER ?? "openai",

  openaiApiKey:
    import.meta.env.VITE_OPENAI_API_KEY ?? "",

  claudeApiKey:
    import.meta.env.VITE_CLAUDE_API_KEY ?? "",
};