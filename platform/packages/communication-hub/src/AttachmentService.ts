import type { Attachment } from './Attachment';
import type { AttachmentRepository } from './AttachmentRepository';

/** Campos aceitos por `AttachmentService.create()`. */
export type UploadAttachmentInput = Pick<Attachment, 'fileType' | 'fileSize'>;

/**
 * AttachmentService — regra de negócio de Attachment, que nunca existe sem uma Message associada
 * (regra `AttachmentRequiresMessage`, já catalogada em `CommBusinessRule.ts`). Inexistente em
 * `src/core` ou `src/app` (IMP-003, Etapa 1); construído diretamente sobre o contrato já existente.
 */
export class AttachmentService {
  constructor(private readonly repository: AttachmentRepository) {}

  async upload(input: UploadAttachmentInput, messageId: string): Promise<Attachment> {
    const attachment: Attachment = {
      attachmentId: crypto.randomUUID(),
      messageId,
      ...input,
    };

    return this.repository.create(attachment);
  }

  async listByMessage(messageId: string): Promise<readonly Attachment[]> {
    return this.repository.listByMessage(messageId);
  }
}
