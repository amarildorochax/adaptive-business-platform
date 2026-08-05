import type { CommCommand, CommCommandType } from './CommCommand';
import type { CommEvent, CommEventType } from './CommEvent';
import type { Attachment } from './Attachment';
import { AttachmentService, type UploadAttachmentInput } from './AttachmentService';
import type { Conversation, ConversationStatus } from './Conversation';
import { ConversationService, type CreateConversationInput } from './ConversationService';
import type { ConversationAssignment } from './ConversationAssignment';
import { ConversationAssignmentService } from './ConversationAssignmentService';
import type { Delivery, DeliveryStatus } from './Delivery';
import { DeliveryService } from './DeliveryService';
import type { Message } from './Message';
import { MessageService, type CreateMessageInput } from './MessageService';
import type { Participant, ParticipantType } from './Participant';
import { ParticipantService } from './ParticipantService';

export interface CommunicationManagerDependencies {
  readonly conversations: ConversationService;
  readonly messages: MessageService;
  readonly attachments: AttachmentService;
  readonly participants: ParticipantService;
  readonly assignments: ConversationAssignmentService;
  readonly deliveries: DeliveryService;
}

/** Resultado de uma operação de CommunicationManager, mesmo formato já usado por `CRMManager` (IMP-002). */
export interface CommOperationResult<TEntity> {
  readonly result: TEntity;
  readonly command?: CommCommand;
  readonly events: readonly CommEvent[];
}

/**
 * CommunicationManager — o componente "Communication Manager" já catalogado em
 * `CommunicationHubComponent.ts`, implementado pela primeira vez nesta Sprint (IMP-003, Conversation
 * Core). Orquestra os Services de cada Entidade em escopo; nunca conhece Canal externo específico
 * (WhatsApp, Instagram, Messenger, Telegram, e-mail) — todo `channelId` recebido por este Manager é
 * um identificador opaco de `Channel`/`ChannelAccount`, já genérico por desenho no Blueprint, nunca
 * um SDK ou uma credencial de provedor.
 *
 * Não publica em nenhum Event Bus — mesmo padrão "Domain Events coletados, despachados pela
 * infraestrutura" já usado por `CRMManager`, porque nenhuma implementação real de `EventPublisher`
 * (`@abp/core`) existe ainda nesta plataforma.
 */
export class CommunicationManager {
  constructor(private readonly deps: CommunicationManagerDependencies) {}

  async startConversation(
    input: CreateConversationInput,
    initialParticipants: ReadonlyArray<{ type: ParticipantType; referenceId: string }>,
  ): Promise<CommOperationResult<{ conversation: Conversation; participants: readonly Participant[] }>> {
    const conversation = await this.deps.conversations.create(input);

    const participants = await Promise.all(
      initialParticipants.map((p) =>
        this.deps.participants.add(conversation.conversationId, p.type, p.referenceId),
      ),
    );

    return {
      result: { conversation, participants },
      command: this.command('StartConversation'),
      events: [this.event('ConversationStarted', conversation.conversationId)],
    };
  }

  async assignConversation(
    conversationId: string,
    assigneeId: string,
  ): Promise<CommOperationResult<ConversationAssignment>> {
    const assignment = await this.deps.assignments.assign(conversationId, assigneeId);

    return {
      result: assignment,
      command: this.command('AssignConversation'),
      events: [this.event('ConversationAssigned', conversationId)],
    };
  }

  /**
   * Transfere a Conversation para um novo responsável. Produz, estruturalmente, o mesmo efeito de
   * `assignConversation` — um novo Conversation Assignment —, mas tagueado com o Command
   * `TransferConversation`, per o vocabulário já Frozen. Reutiliza deliberadamente o Event
   * `ConversationAssigned`, já que nenhum Evento dedicado a transferência (`ConversationTransferred`)
   * existe no catálogo já aprovado (ver CONVERSATION_CORE_MIGRATION_REPORT.md).
   */
  async transferConversation(
    conversationId: string,
    newAssigneeId: string,
  ): Promise<CommOperationResult<ConversationAssignment>> {
    const assignment = await this.deps.assignments.assign(conversationId, newAssigneeId);

    return {
      result: assignment,
      command: this.command('TransferConversation'),
      events: [this.event('ConversationAssigned', conversationId)],
    };
  }

  async closeConversation(conversationId: string): Promise<CommOperationResult<Conversation>> {
    const conversation = await this.deps.conversations.updateStatus(conversationId, 'Closed');

    return {
      result: conversation,
      command: this.command('CloseConversation'),
      events: [this.event('ConversationClosed', conversationId)],
    };
  }

  /**
   * Atualização genérica de status. Quando o destino é `Closed`, emite o mesmo Event
   * `ConversationClosed` já emitido por `closeConversation` — ambos os caminhos convergem para o
   * mesmo fato de negócio, apenas com Command de origem diferente. Para qualquer outra transição
   * (Open ↔ InProgress), nenhum Event dedicado existe no catálogo já aprovado.
   */
  async updateConversationStatus(
    conversationId: string,
    status: ConversationStatus,
  ): Promise<CommOperationResult<Conversation>> {
    const conversation = await this.deps.conversations.updateStatus(conversationId, status);

    return {
      result: conversation,
      command: this.command('UpdateConversationStatus'),
      events: status === 'Closed' ? [this.event('ConversationClosed', conversationId)] : [],
    };
  }

  async sendMessage(
    conversationId: string,
    input: CreateMessageInput,
  ): Promise<CommOperationResult<Message>> {
    const message = await this.deps.messages.create(input, conversationId);
    await this.deps.deliveries.recordAttempt(message.messageId, 'Pending');

    return {
      result: message,
      command: this.command('SendMessage'),
      events: [this.event('MessageSent', conversationId)],
    };
  }

  /**
   * Registra uma Message recebida de uma parte externa. Nunca invocado por um Command — receber
   * uma mensagem é a constatação de um fato já ocorrido fora da plataforma (per um Canal externo
   * ainda não integrado nesta Sprint), não uma intenção de mudança de estado; por isso `command`
   * fica ausente, mesmo padrão já usado por Organization/Contact em `CRMManager` (IMP-002) para
   * operações sem Command aprovado correspondente.
   */
  async receiveMessage(
    conversationId: string,
    input: CreateMessageInput,
  ): Promise<CommOperationResult<Message>> {
    const message = await this.deps.messages.create(input, conversationId);

    return {
      result: message,
      events: [this.event('MessageReceived', conversationId)],
    };
  }

  async uploadAttachment(
    conversationId: string,
    messageId: string,
    input: UploadAttachmentInput,
  ): Promise<CommOperationResult<Attachment>> {
    const attachment = await this.deps.attachments.upload(input, messageId);

    return {
      result: attachment,
      command: this.command('UploadAttachment'),
      events: [this.event('AttachmentUploaded', conversationId)],
    };
  }

  async retryDelivery(
    conversationId: string,
    messageId: string,
    status: DeliveryStatus,
  ): Promise<CommOperationResult<Delivery>> {
    const delivery = await this.deps.deliveries.recordAttempt(messageId, status);

    return {
      result: delivery,
      command: this.command('RetryDelivery'),
      events: [this.event('DeliveryRetried', conversationId)],
    };
  }

  /**
   * Adiciona um Participant a uma Conversation já existente. Nenhum Command (`AddParticipant`) nem
   * Event (`ParticipantAdded`) existe no catálogo já aprovado (13 Commands, 15 Events) — `command`
   * fica ausente e nenhum Event é emitido, registrado como lacuna arquitetural em
   * CONVERSATION_CORE_MIGRATION_REPORT.md, nunca preenchido por invenção unilateral desta Sprint.
   */
  async addParticipant(
    conversationId: string,
    type: ParticipantType,
    referenceId: string,
  ): Promise<CommOperationResult<Participant>> {
    const participant = await this.deps.participants.add(conversationId, type, referenceId);

    return { result: participant, events: [] };
  }

  private command(type: CommCommandType): CommCommand {
    return { operationId: crypto.randomUUID(), type, requestedAt: new Date() };
  }

  private event(type: CommEventType, conversationId?: string): CommEvent {
    return { eventId: crypto.randomUUID(), type, conversationId, occurredAt: new Date() };
  }
}
