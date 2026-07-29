/**
 * Logging Configuration Source — declaração formal de que a capacidade de Logging
 * consulta o ConfigurationLoader já implementado para resolver destino e verbosidade.
 * Estrutura, regras e invariantes definidas em LOGGING_CONCRETE_STRUCTURE.md.
 */
import type { ConfigurationLoader } from "./ConfigurationLoader.js";

export interface LoggingConfigurationSource {
  /** Referência ao mecanismo de Configuration já implementado, consultado por esta capacidade. */
  readonly configuration: ConfigurationLoader;
}
