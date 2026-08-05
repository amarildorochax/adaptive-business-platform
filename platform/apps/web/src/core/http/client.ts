import { ApiClient } from "./ApiClient.js";
import { resolveApiClientConfig } from "./config.js";

/** Instância única do cliente HTTP para toda a aplicação — todo `clients/*.ts` importa exclusivamente esta instância, nunca constrói a sua própria. */
export const apiClient = new ApiClient(resolveApiClientConfig());
