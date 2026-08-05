# Conversation Core Migration Report

**Adaptive Business Platform · Documento de Implementação**

Status: Approved · Sprint: IMP-003 — Conversation Hub Migration (Fase 1 — Conversation Core)

---

## Nota de Posicionamento Documental

Esta Sprint é qualitativamente diferente da IMP-002. Para o CRM, existiam duas árvores legadas reais para extrair e adaptar. Para Conversation, a auditoria desta Sprint — feita por varredura de arquivo, não por suposição, per a própria instrução "nunca presumir implementação" — confirma que **nenhuma das duas árvores legadas contém qualquer implementação de Conversation, Message, Participant, Attachment, Channel ou Conversation Assignment**: `src/core/conversation/` não existe; nenhum dos 28 diretórios de `src/core/` trata de conversação ou mensageria; nenhum dos 14 diretórios de `src/app/features/` tampouco. `platform/packages/conversation-hub/` também não existe — o pacote real é `platform/packages/communication-hub/`, exatamente como `CONVERSATION_HUB_ARCHITECTURE.md` já havia estabelecido (Conversation Hub = Communication Hub, mesmo Bounded Context).

Isso significa que **Extrair → Adaptar → Portar** não tinha, nesta Sprint, nada de substancial para extrair do código — apenas do próprio pacote de contrato `@abp/communication-hub`, que já continha 25 arquivos de tipo (Conversation, Message, Participant, Attachment, Channel, Channel Account, Conversation Assignment, Delivery, Thread, Read Receipt, Reaction, Broadcast, Template, Notification, Webhook Event, Communication Policy), todos type-only, e já com notas de reconciliação próprias registrando divergências entre a prosa de `COMMUNICATION_HUB.md` e seus próprios catálogos enumerados (15 Events, não 18; 34 componentes, não 33; 12 Regras, não 10) — diligência já feita antes desta Sprint, aqui apenas herdada e respeitada.

Uma busca adicional encontrou `src/core/notifications/` — um módulo real e funcional (`NotificationManager`, `NotificationService`, `NotificationRecord`, `NotificationChannel`, `NotificationDelivery`) — e dois arquivos `WhatsAppProvider.ts` (em `src/core/marketing/` e em `src/core/notifications/`), ambos stubs auto-declarados como não implementados. Nenhum dos três está no escopo desta Sprint (Notification/Broadcast e integração de canal são explicitamente Sprints futuras) — registrados aqui como achados de inventário, não migrados.

---

## Resumo Executivo

Esta Sprint construiu o núcleo do domínio de conversação — Conversation, Message, Participant, Attachment, Conversation Assignment, Delivery — diretamente sobre os contratos de tipo já existentes em `platform/packages/communication-hub`, sem nenhuma lógica legada para herdar. O domínio não conhece nenhum canal externo — `channelId` é sempre um identificador opaco, e nenhuma importação de WhatsApp, Instagram, Messenger, Telegram ou e-mail existe em nenhum arquivo criado. A integração conceitual com o CRM (Etapa 8) é satisfeita inteiramente por `Participant.referenceId`, uma string opaca — `@abp/communication-hub` não depende de `@abp/crm-hub` no `package.json`, nem nunca precisou depender. `pnpm typecheck`, `pnpm build`, `pnpm lint` e `pnpm test` completam sem erro, com 18 testes novos (38 no total do workspace).

---

## Inventário e Classificação

| Conceito | Origem | Classificação | Evidência |
|---|---|---|---|
| Conversation, Message, Participant, Attachment, Channel, ChannelAccount, ConversationAssignment, Delivery, Thread, ReadReceipt | `platform/packages/communication-hub/src/*.ts` | Reutilizar integralmente (contrato) | 25 arquivos já existentes, type-only, confirmados por leitura completa |
| Conversation/Message/Participant/etc. em `src/core` | — | **Inexistente** | `find src/core/conversation` vazio; nenhum dos 28 diretórios de `src/core/` corresponde |
| Conversation/Message/Participant/etc. em `src/app` | — | **Inexistente** | Nenhum dos 14 diretórios de `src/app/features/` corresponde |
| `platform/packages/conversation-hub/` | — | **Inexistente** — o pacote real é `communication-hub` | `ls platform/packages/` confirma |
| `ConversationMetadata` (solicitado pela Etapa 2) | — | **Inexistente** — nem contrato, nem implementação, em nenhuma fonte lida | Não encontrado em nenhum dos 25 arquivos do pacote nem em `CONVERSATION_HUB_ARCHITECTURE.md` |
| `src/core/notifications/*` (NotificationManager, real e funcional) | `src/core/notifications/` | Reutilizável, fora de escopo | Módulo real, mas Notification/Broadcast não estão no escopo desta Sprint (Conversation Core) |
| `WhatsAppProvider.ts` (marketing e notifications) | `src/core/{marketing,notifications}/WhatsAppProvider.ts` | Fora de escopo, explicitamente proibido | Ambos stubs auto-declarados "nenhum WhatsApp é enviado nesta Sprint" |

---

## Componentes Migrados

Nenhuma Entidade foi "migrada" no sentido de portar lógica de outro lugar — todas já existiam como contrato e foram, pela primeira vez, dotadas de comportamento real (Repository + Service), exatamente como a coluna "Classificação" acima já registra.

## Componentes Criados

**Repositórios** (contratos apenas, per Etapa 7): `ConversationRepository.ts`, `MessageRepository.ts` (sem `update` — Message é imutável), `AttachmentRepository.ts`, `ParticipantRepository.ts`, `ConversationAssignmentRepository.ts`, `DeliveryRepository.ts` (sem `update` — cada tentativa é um novo registro).

**Serviços de domínio**: `ConversationService.ts`, `MessageService.ts`, `AttachmentService.ts`, `ParticipantService.ts`, `ConversationAssignmentService.ts`, `DeliveryService.ts`.

**Orquestrador**: `CommunicationManager.ts` — implementa, pela primeira vez, o componente "Communication Manager" já catalogado em `CommunicationHubComponent.ts`. Expõe `startConversation`, `assignConversation`, `transferConversation`, `closeConversation`, `updateConversationStatus`, `sendMessage`, `receiveMessage`, `uploadAttachment`, `retryDelivery`, `addParticipant` — oito dos treze Commands já aprovados foram efetivamente exercitados (`StartConversation`, `AssignConversation`, `TransferConversation`, `CloseConversation`, `UpdateConversationStatus`, `SendMessage`, `UploadAttachment`, `RetryDelivery`); `CreateTemplate`, `UpdateTemplate`, `SendBroadcast`, `RegisterWebhook`, `ChangeCommunicationPreference` ficam para uma Sprint futura de Template/Broadcast/Webhook, por serem mais próximos de canal e de marketing do que do núcleo de conversação.

## Componentes Reutilizados

O padrão de retorno `{result, command?, events}` — incluindo a decisão de que `command` fica `undefined` quando nenhum Command aprovado cobre a operação — foi reutilizado diretamente de `CRMManager` (IMP-002), preservando consistência entre os dois primeiros domínios migrados.

## Componentes Ausentes

`ConversationMetadata` — solicitado pela Sprint, não encontrado em nenhuma fonte, não inventado. Broadcast, Template, Notification, WebhookEvent, Reaction — todos já têm contrato no pacote, mas nenhum Service/Repository foi construído para eles nesta Sprint, por estarem fora do núcleo de conversação propriamente dito.

---

## Lacunas Arquiteturais

**Nenhum Command `AddParticipant`/`RemoveParticipant` existe no catálogo já aprovado** (13 Commands em `CommCommand.ts`). `CommunicationManager.addParticipant()` existe e funciona, mas retorna `command: undefined` e nenhum Event — não porque a operação seja inválida, mas porque não há vocabulário aprovado para tagueá-la. Idêntico ao caso de `CreateOrganization`/`CreateContact` já registrado em `CRM_CORE_MIGRATION_REPORT.md`.

**Nenhum Event `ParticipantAdded`/`ParticipantRemoved`/`ConversationTransferred`/`ConversationArchived` existe no catálogo já aprovado** (15 Events em `CommEvent.ts`). `transferConversation` reutiliza deliberadamente `ConversationAssigned` (decisão de design registrada no próprio código); não existe, em nenhuma forma, um conceito de "arquivamento" de Conversation — apenas os três estados já declarados em `ConversationStatus` (`Open`/`InProgress`/`Closed`). O texto da própria Sprint, ao citar "ArchiveConversation"/"ParticipantAdded"/"ParticipantRemoved"/"ConversationArchived" como exemplos, não corresponde ao vocabulário já Frozen — tratado como ilustrativo, não normativo, mesma resolução já aplicada a "UpdateLead"/"TimelineEventAdded" na IMP-002.

**`ReceiveMessage` nunca foi um Command aprovado** — apenas `MessageReceived` é um Event aprovado. `receiveMessage()` no `CommunicationManager` reflete isso: nunca produz `CommCommand`, apenas o Event, tratando o recebimento como constatação de fato externo, não como uma intenção de mudança de estado.

---

## Riscos

Os mesmos riscos já registrados por `AI_CODEBASE_RECONCILIATION.md` e `CRM_CORE_MIGRATION_REPORT.md` se aplicam aqui: nenhum Event Bus real existe, então todo `CommEvent` retornado por `CommunicationManager` é coletado, nunca publicado, até que uma Sprint de Infrastructure conecte isso a um `EventPublisher` real. Um risco específico desta Sprint: como não existe nenhuma implementação legada para comparar, não há como validar esta implementação contra um comportamento já em produção — toda a superfície testada (38 testes) é a única fonte de verdade sobre o comportamento esperado até que uma integração de canal real force novos casos de uso.

---

## Recomendações

Priorizar Template/Broadcast/Webhook como a próxima extensão do domínio, antes da integração de canal real — ambos já têm contrato pronto e nenhuma lógica ainda. Resolver, como item de governança, a mesma lacuna de Command/Event para Participant já identificada no CRM (Organization/Contact) e agora repetida aqui (AddParticipant/RemoveParticipant) — o padrão se repetindo duas vezes sugere que pode ser uma lacuna sistemática do processo de definição de Command/Event, não um acaso isolado de cada domínio, e merece atenção na próxima revisão de `DOMAIN_OWNERSHIP_MATRIX.md` ou de `CRM_HUB.md`/`COMMUNICATION_HUB.md`. Ao integrar o primeiro canal real (WhatsApp Business Cloud API, per o objetivo desta Sprint), implementar um Adapter que traduz o payload do canal para `CreateMessageInput` e chama `receiveMessage()` — nunca alterar `CommunicationManager` para conhecer o formato de nenhum provedor específico.

---

## Conclusão

Diferente do CRM, este domínio não tinha conhecimento maduro em nenhuma árvore legada para preservar — apenas um contrato de tipo já cuidadosamente pensado, com suas próprias notas de reconciliação já resolvidas antes mesmo desta Sprint começar. O trabalho aqui não foi salvar algo que já funcionava; foi dar a primeira forma executável a um domínio que, até este momento, só existia como promessa de arquitetura. A independência de canal, exigida como princípio central desta Sprint, não precisou ser imposta com esforço — surgiu naturalmente do próprio desenho do Blueprint, no qual `Channel` sempre foi um conceito abstrato e `channelId` sempre foi opaco. O núcleo agora existe; a Meta, o WhatsApp e todo o resto do omnichannel têm, pela primeira vez, algo real para se conectar.
