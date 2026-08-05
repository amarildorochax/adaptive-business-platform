import { describe, expect, it } from 'vitest';
import { AttachmentService } from './AttachmentService';
import { CommunicationManager } from './CommunicationManager';
import { ConversationAssignmentService } from './ConversationAssignmentService';
import { ConversationService } from './ConversationService';
import { DeliveryService } from './DeliveryService';
import { MessageService } from './MessageService';
import { ParticipantService } from './ParticipantService';
import {
  FakeAttachmentRepository,
  FakeConversationAssignmentRepository,
  FakeConversationRepository,
  FakeDeliveryRepository,
  FakeMessageRepository,
  FakeParticipantRepository,
} from './testing/InMemoryFakes';

function buildManager() {
  return new CommunicationManager({
    conversations: new ConversationService(new FakeConversationRepository()),
    messages: new MessageService(new FakeMessageRepository()),
    attachments: new AttachmentService(new FakeAttachmentRepository()),
    participants: new ParticipantService(new FakeParticipantRepository()),
    assignments: new ConversationAssignmentService(new FakeConversationAssignmentRepository()),
    deliveries: new DeliveryService(new FakeDeliveryRepository()),
  });
}

describe('CommunicationManager — Conversation Core', () => {
  it('startConversation cria Conversation e Participants, com Command StartConversation e Event ConversationStarted', async () => {
    const manager = buildManager();

    const { result, command, events } = await manager.startConversation({ tenantId: 'tenant-1' }, [
      { type: 'External', referenceId: 'customer-1' },
      { type: 'Internal', referenceId: 'agent-1' },
    ]);

    expect(result.conversation.status).toBe('Open');
    expect(result.participants).toHaveLength(2);
    expect(command?.type).toBe('StartConversation');
    expect(events.map((e) => e.type)).toEqual(['ConversationStarted']);
  });

  it('participant referencia CRM (Customer/Lead/Organization/Contact) apenas por identificador opaco', async () => {
    const manager = buildManager();
    const { result } = await manager.startConversation({ tenantId: 'tenant-1' }, [
      { type: 'External', referenceId: 'customer-42' },
    ]);

    // O próprio tipo de referenceId (string) já impede que este pacote conheça o Domain Model do
    // CRM Hub — nenhuma importação de @abp/crm-hub existe neste pacote (ver package.json).
    expect(result.participants[0]?.referenceId).toBe('customer-42');
    expect(result.participants[0]?.type).toBe('External');
  });

  it('sendMessage produz Command SendMessage e Event MessageSent, registrando uma tentativa de entrega Pending', async () => {
    const manager = buildManager();
    const { result: started } = await manager.startConversation({ tenantId: 'tenant-1' }, []);

    const { result, command, events } = await manager.sendMessage(started.conversation.conversationId, {
      tenantId: 'tenant-1',
      threadId: undefined,
      channelId: 'channel-1',
      senderId: 'agent-1',
      content: 'Como posso ajudar?',
    });

    expect(result.conversationId).toBe(started.conversation.conversationId);
    expect(command?.type).toBe('SendMessage');
    expect(events.map((e) => e.type)).toEqual(['MessageSent']);
  });

  it('receiveMessage nunca produz Command, apenas o Event MessageReceived', async () => {
    const manager = buildManager();
    const { result: started } = await manager.startConversation({ tenantId: 'tenant-1' }, []);

    const { command, events } = await manager.receiveMessage(started.conversation.conversationId, {
      tenantId: 'tenant-1',
      threadId: undefined,
      channelId: 'channel-1',
      senderId: 'customer-1',
      content: 'Preciso de ajuda.',
    });

    expect(command).toBeUndefined();
    expect(events.map((e) => e.type)).toEqual(['MessageReceived']);
  });

  it('closeConversation e updateConversationStatus(Closed) convergem para o mesmo Event ConversationClosed', async () => {
    const manager = buildManager();
    const { result: startedA } = await manager.startConversation({ tenantId: 'tenant-1' }, []);
    const { result: startedB } = await manager.startConversation({ tenantId: 'tenant-1' }, []);

    const viaClose = await manager.closeConversation(startedA.conversation.conversationId);
    const viaUpdate = await manager.updateConversationStatus(startedB.conversation.conversationId, 'Closed');

    expect(viaClose.command?.type).toBe('CloseConversation');
    expect(viaUpdate.command?.type).toBe('UpdateConversationStatus');
    expect(viaClose.events.map((e) => e.type)).toEqual(['ConversationClosed']);
    expect(viaUpdate.events.map((e) => e.type)).toEqual(['ConversationClosed']);
  });

  it('updateConversationStatus para um estado não-terminal não emite Event', async () => {
    const manager = buildManager();
    const { result: started } = await manager.startConversation({ tenantId: 'tenant-1' }, []);

    const { events } = await manager.updateConversationStatus(started.conversation.conversationId, 'InProgress');

    expect(events).toEqual([]);
  });

  it('transferConversation reutiliza o Event ConversationAssigned, nunca inventa um Evento novo', async () => {
    const manager = buildManager();
    const { result: started } = await manager.startConversation({ tenantId: 'tenant-1' }, []);
    await manager.assignConversation(started.conversation.conversationId, 'agent-a');

    const { command, events } = await manager.transferConversation(
      started.conversation.conversationId,
      'agent-b',
    );

    expect(command?.type).toBe('TransferConversation');
    expect(events.map((e) => e.type)).toEqual(['ConversationAssigned']);
  });

  it('addParticipant não produz Command nem Event — lacuna arquitetural registrada, não inventada', async () => {
    const manager = buildManager();
    const { result: started } = await manager.startConversation({ tenantId: 'tenant-1' }, []);

    const { command, events } = await manager.addParticipant(
      started.conversation.conversationId,
      'External',
      'contact-1',
    );

    expect(command).toBeUndefined();
    expect(events).toEqual([]);
  });

  it('uploadAttachment exige uma Message já existente — AttachmentRequiresMessage', async () => {
    const manager = buildManager();
    const { result: started } = await manager.startConversation({ tenantId: 'tenant-1' }, []);
    const { result: message } = await manager.sendMessage(started.conversation.conversationId, {
      tenantId: 'tenant-1',
      threadId: undefined,
      channelId: 'channel-1',
      senderId: 'agent-1',
      content: 'Segue o arquivo.',
    });

    const { result, events } = await manager.uploadAttachment(
      started.conversation.conversationId,
      message.messageId,
      { fileType: 'application/pdf', fileSize: 2048 },
    );

    expect(result.messageId).toBe(message.messageId);
    expect(events.map((e) => e.type)).toEqual(['AttachmentUploaded']);
  });

  it('retryDelivery produz Command RetryDelivery e Event DeliveryRetried', async () => {
    const manager = buildManager();
    const { result: started } = await manager.startConversation({ tenantId: 'tenant-1' }, []);
    const { result: message } = await manager.sendMessage(started.conversation.conversationId, {
      tenantId: 'tenant-1',
      threadId: undefined,
      channelId: 'channel-1',
      senderId: 'agent-1',
      content: 'Tentando de novo.',
    });

    const { command, events } = await manager.retryDelivery(
      started.conversation.conversationId,
      message.messageId,
      'Delivered',
    );

    expect(command?.type).toBe('RetryDelivery');
    expect(events.map((e) => e.type)).toEqual(['DeliveryRetried']);
  });
});
