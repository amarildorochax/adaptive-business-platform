import type { Credential } from './Credential';
import type { Identity } from './Identity';

/** Contrato de persistência de Credential — apenas o contrato. Sem `update` — uma troca de credencial é sempre uma nova Credential, nunca uma edição da existente (mesma disciplina de Immutable Transactions já aplicada a registros sensíveis em toda Sprint anterior). */
export interface CredentialRepository {
  create(credential: Credential): Promise<Credential>;
  listByIdentity(identity: Identity): Promise<Credential[]>;
}
