import type { Attachment } from './Attachment';

/**
 * AttachmentRepository — contrato de persistência de Attachment. Interface apenas, per IMP-003,
 * Etapa 7.
 */
export interface AttachmentRepository {
  create(attachment: Attachment): Promise<Attachment>;
  listByMessage(messageId: string): Promise<readonly Attachment[]>;
}
