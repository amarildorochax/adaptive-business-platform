/**
 * Configuration Load Failure — declaração formal de que toda falha do Configuration Loader
 * é relatada exclusivamente através da categoria já existente "ConfigurationLoadFailure".
 * Estrutura, regras e invariantes definidas em CONFIGURATION_CONCRETE_STRUCTURE.md.
 */
import type { PlatformError } from "./Error.js";

export type ConfigurationLoadFailure = PlatformError & {
  readonly category: "ConfigurationLoadFailure";
};
