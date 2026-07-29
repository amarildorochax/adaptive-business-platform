/**
 * Configuration Loader — mecanismo abstrato de carregamento de valor de configuração técnica.
 * Estrutura, regras e invariantes definidas em CONFIGURATION_CONCRETE_STRUCTURE.md.
 */
export interface ConfigurationLoader {
  /** Recupera um valor de configuração técnica a partir de uma chave nomeada. */
  load<TValue>(key: string): TValue;
}
