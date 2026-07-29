/**
 * Configuração de ambiente da plataforma, lida de variáveis `VITE_*`.
 *
 * Nota de auditoria/segurança (Sprint 0A): `openaiApiKey`/`claudeApiKey`
 * não são referenciados por nenhum código hoje — `AIProviderFactory`
 * sempre retorna `MockAIProvider`, mesmo quando `aiProvider` é
 * "openai"/"claude" (OpenAIProvider/ClaudeProvider ainda não existem).
 * Nenhuma credencial real chega a ser usada em tempo de execução no
 * estado atual do código. Nenhum valor de segredo está hardcoded neste
 * arquivo — ambos os defaults são string vazia.
 */
export const env = {
  aiProvider:
    import.meta.env.VITE_AI_PROVIDER ?? "openai",

  openaiApiKey:
    import.meta.env.VITE_OPENAI_API_KEY ?? "",

  claudeApiKey:
    import.meta.env.VITE_CLAUDE_API_KEY ?? "",
};
