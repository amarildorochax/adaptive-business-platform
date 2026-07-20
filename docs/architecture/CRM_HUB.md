# CRM Hub — Arquitetura de Referência

**Adaptive Business Platform · Documento Técnico Oficial**

---

## 1. Introdução

Este documento é a referência arquitetural oficial do CRM Hub — a implementação técnica do domínio de relacionamento já definido em `CRM_DOMAIN_BLUEPRINT.md`. Aquele documento é o proprietário exclusivo do domínio: suas Entidades, seu Bounded Context, seus Eventos, suas Regras de negócio. Este documento não redefine nenhum desses conceitos — ele descreve exclusivamente como o CRM Hub é arquitetado para operar sobre esse domínio: seus componentes internos, seus Commands e Queries, seus fluxos operacionais, sua integração técnica com o restante da plataforma, e suas garantias de segurança, observabilidade e escala.

A relação entre os dois documentos é direta: `CRM_DOMAIN_BLUEPRINT.md` responde "o que é o CRM e o que ele modela"; este documento responde "como o CRM Hub é construído para servir esse modelo". Onde qualquer conceito de domínio — Lead, Customer, Opportunity, Timeline, os dezoito Eventos já catalogados, as doze Regras de negócio já fixadas — é mencionado aqui, ele é citado por referência ao Blueprint, nunca redefinido. Da mesma forma, onde um conceito de arquitetura geral já foi definido em `BUSINESS_HUB_ARCHITECTURE.md` — Bounded Context, Domain Ownership, Aggregate, Anti-Corruption Layer — ele é aplicado aqui, não reexplicado.

Um leitor que já conhece o Blueprint reconhecerá, ao longo deste documento, cada Entidade e cada Evento como velhos conhecidos — o que muda, deste ponto em diante, é a lente: não mais "o que uma Opportunity significa para o negócio", mas "qual componente cria, valida, transiciona e persiste uma Opportunity, e através de qual Comando isso acontece". Essa mudança de lente, do domínio para a arquitetura, é a própria razão de existir deste documento como um artefato separado do Blueprint, em vez de um capítulo adicional dentro dele.

---

## 2. Missão

A missão operacional do CRM Hub é executar, com confiabilidade e em escala, tudo o que o domínio de relacionamento já definido no Blueprint exige: capturar Lead sem perda, qualificar e converter com rastreabilidade completa, organizar Opportunity através de Pipeline configurável, preservar Timeline de forma imutável, e expor tudo isso a Usuário humano e a Hub consumidor através de um conjunto estável de Commands, Queries e Eventos — sem jamais assumir responsabilidade que pertence a outro domínio, conforme já delimitado na tabela de Boundaries do Blueprint, Capítulo 4.

Confiabilidade, aqui, não é um adjetivo genérico — significa especificamente que nenhum Lead capturado é perdido por falha técnica, que nenhuma Opportunity muda de Estágio sem deixar rastro, e que nenhuma Timeline, uma vez escrita, pode divergir do que de fato aconteceu. Escala significa que essas mesmas garantias permanecem válidas independentemente de a Empresa consumidora ter dez Relationships ativos ou dez milhões, e independentemente de quantas outras Empresas operam simultaneamente sobre a mesma infraestrutura compartilhada da plataforma, conforme detalhado no Capítulo 17.

---

## 3. Papel dentro da Plataforma

O CRM Hub é um Business Hub, na categorização já estabelecida em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 1 — uma capacidade de negócio reconhecível pelo cliente, não um serviço técnico transversal nem um componente de Adaptive Intelligence.

```
                    POSIÇÃO DO CRM HUB NA PLATAFORMA
   ┌───────────────────────────────────────────────────────────┐
   │  Platform Services                                            │
   │  (AI Hub · Identity Hub · Knowledge Hub · Integration Hub)     │
   │            consumidos pelo CRM Hub — Capítulo 13                │
   ├───────────────────────────────────────────────────────────┤
   │  Adaptive Intelligence                                          │
   │  (Business Profile Engine · Branding Hub · Automation Engine)   │
   │            consumidos pelo CRM Hub — Capítulo 13                  │
   ├───────────────────────────────────────────────────────────┤
   │  Business Hubs                                                   │
   │  ┌─────────┐  ┌───────────┐  ┌──────────┐  ┌───────────┐        │
   │  │ CRM Hub │  │Finance Hub│  │Growth Hub│  │Communica- │        │
   │  │ (este    │  │           │  │          │  │tion Hub   │        │
   │  │ documento)│  └───────────┘  └──────────┘  └───────────┘        │
   │  └─────────┘        colaboram exclusivamente por Evento             │
   │            — Capítulo 14                                            │
   └───────────────────────────────────────────────────────────┘
```

O CRM Hub consome todo Platform Service e todo componente de Adaptive Intelligence exatamente como qualquer outro Business Hub já descrito em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 14 — nenhuma dessas integrações recebe tratamento especial aqui além do detalhamento técnico específico apresentado no Capítulo 13 deste documento. E o CRM Hub colabora com os demais Business Hubs — Finance, Growth, Communication, Analytics — exclusivamente por Evento, nunca por chamada direta, conforme já estabelecido naquele mesmo documento e detalhado no Capítulo 14 aqui.

---

## 4. Filosofia

Relationship First. Toda decisão de arquitetura do CRM Hub parte do relacionamento como unidade central, nunca de uma conveniência técnica de armazenamento ou de consulta que depois se tenta justificar como modelo de negócio.

Customer 360. A capacidade de reconstruir, em um único ponto de consulta, toda a história de um relacionamento é tratada como requisito arquitetural de primeira classe, não como um relatório acessório construído depois que o domínio já existia.

Single Relationship Source. Existe exatamente uma implementação técnica de cada Relationship — nenhum componente interno do CRM Hub mantém sua própria cópia paralela de Customer, Lead, ou qualquer outra Entidade já definida no Blueprint.

Events First. Toda mudança de estado relevante dentro do CRM Hub produz um Evento antes de qualquer outra forma de comunicação ser considerada — a arquitetura interna é desenhada em torno da publicação de Evento como resultado natural de cada Command processado, não como uma notificação adicionada depois.

Business Capabilities. O CRM Hub é internamente organizado por Capacidade de Negócio, já catalogadas no Blueprint, Capítulo 6, e detalhadas arquiteturalmente no Capítulo 8 deste documento — nunca por conveniência técnica de camada que ignora essa divisão de negócio.

Independent Evolution. O CRM Hub pode evoluir sua implementação interna — reestruturar um componente, otimizar uma consulta, mudar como um Aggregate é reconstruído — sem exigir mudança coordenada em nenhum outro Hub, desde que seus Eventos e Queries publicados permaneçam estáveis ou sejam versionados.

Explicit Ownership. Toda responsabilidade arquitetural interna é atribuída a um componente específico, nunca implícita ou compartilhada de forma ambígua entre dois componentes.

Low Coupling. Nenhum componente interno do CRM Hub depende da implementação interna de outro além do contrato que ele expõe — a mesma disciplina de baixo acoplamento já aplicada entre Hubs em `SYSTEM_BLUEPRINT.md` é aplicada aqui internamente, entre os componentes do próprio Hub.

High Cohesion. Todo componente relacionado a uma mesma Capacidade de Negócio vive próximo, logicamente coeso, dentro da arquitetura interna do CRM Hub.

---

## 5. Design Principles

**Command-Query Separation.** Toda operação sobre o CRM Hub é, de forma explícita, um Command — que muda estado — ou uma Query — que lê estado sem alterá-lo. Nenhuma operação mistura as duas responsabilidades.

**Event-Sourced Timeline.** A Timeline de um Relationship, já definida no Blueprint, é arquiteturalmente reconstruível a partir da sequência de Eventos já publicados por aquele Relationship — a Timeline não é um log acessório, é a própria fonte de verdade de história de um Relationship.

**Idempotent Commands.** Todo Command processado pelo CRM Hub é desenhado para que sua execução repetida, com o mesmo dado de entrada e o mesmo identificador de operação, nunca produza efeito colateral duplicado.

**Read Model Optimization.** Toda Query de alto volume, como Customer 360 e Pipeline Summary, é resolvida contra um Read Model otimizado especificamente para leitura, nunca reconstruída a partir do zero, em tempo real, a cada consulta.

**Validation at the Boundary.** Todo Command é validado antes de alcançar qualquer Domain Service interno — nenhuma regra de Validation é aplicada tardiamente, depois que uma mudança de estado já começou a ser processada.

**Deduplication as a First-Class Concern.** A detecção de Lead ou Customer duplicado, já exigida como Regra de negócio no Blueprint, Capítulo 12, é tratada como uma capacidade arquitetural dedicada — o Deduplication Engine descrito no Capítulo 7 —, não uma verificação improvisada dentro do fluxo geral de captura.

**Merge as an Explicit Operation.** A fusão de dois registros identificados como duplicados é sempre uma operação explícita e auditável, nunca uma consequência automática e silenciosa de uma detecção de duplicidade.

**Ownership Transfer is Auditable.** Toda mudança de Account Manager responsável por um Relationship produz registro auditável, nunca uma atualização silenciosa de campo.

**Timeline Immutability by Construction.** A imutabilidade da Timeline, já exigida como Regra de negócio no Blueprint, é garantida arquiteturalmente pelo Timeline Manager — nenhum componente do CRM Hub possui capacidade técnica de editar ou remover um Timeline Event já registrado.

**Search as a Dedicated Capability.** A busca sobre Lead, Customer e demais Entidades é resolvida por um Search Manager dedicado, com seu próprio índice otimizado, nunca por consulta direta e não otimizada contra o armazenamento transacional primário.

**Soft Delete over Hard Delete.** Nenhum registro de relacionamento é fisicamente removido — Archive é sempre a operação aplicada, preservando a Timeline consultável, conforme já detalhado no Capítulo 15.

**Configuration-Driven Pipeline.** A estrutura de Pipeline e Stage de cada Empresa é resolvida inteiramente por Configuration, nunca por implementação de código específica por Empresa, aplicação direta do princípio já estabelecido em `SAAS_ARCHITECTURE.md`.

**Explicit Event Contracts.** Todo Evento publicado pelo CRM Hub segue exatamente o Contrato já catalogado no Blueprint, Capítulo 10 — nenhum componente interno introduz um Evento novo sem que ele seja formalmente adicionado àquele catálogo primeiro.

**Graceful Handling of Partial Failure.** Um Command que afeta múltiplos componentes internos — por exemplo, criar uma Opportunity e simultaneamente registrar um Timeline Event — garante que ambas as mudanças aconteçam de forma atômica dentro do mesmo Aggregate, ou nenhuma delas acontece, nunca um estado parcialmente aplicado.

**Read Independent of Write Path.** A falha ou lentidão do caminho de escrita nunca compromete a disponibilidade do caminho de leitura — um Read Model já materializado continua consultável mesmo durante uma degradação momentânea do processamento de Command.

---

## 6. Arquitetura Conceitual

```
                              Usuários
                        (equipe comercial, atendimento)
                                 │
                                 ▼
                            CRM Hub
              (CRM Manager orquestra os componentes
               internos descritos no Capítulo 7)
                                 │
                                 ▼
                       Business Capabilities
              (Lead Management, Customer Management, Pipeline
               Management, e as demais já catalogadas no
               Blueprint, Capítulo 6 — detalhadas no Capítulo 8)
                                 │
                                 ▼
                          Domain Services
              (lógica de negócio que não pertence a uma única
               Entidade — Validation, Deduplication, Merge)
                                 │
                                 ▼
                              Events
              (publicados conforme o catálogo já definido no
               Blueprint, Capítulo 10)
                                 │
                                 ▼
                            Other Hubs
              (consomem o Evento de forma independente,
               cada um em seu próprio tempo — Capítulo 14)
```

A arquitetura interna que processa cada solicitação segue o padrão de separação entre Command e Query já estabelecido no Capítulo 5:

```
                    Usuário ou Hub consumidor
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
          Command                          Query
    (muda estado — Capítulo 10)      (lê estado — Capítulo 11)
              │                               │
              ▼                               ▼
      Validation Engine                  Read Model
              │                       (já materializado a
              ▼                        partir de Eventos
      Domain Service /                 anteriores)
      Aggregate correspondente               │
              │                               ▼
              ▼                          Resposta
      Event Publisher
              │
              ▼
           Evento
    (publicado no Event Bus;
     também atualiza o Read
     Model correspondente,
     incluindo a Timeline)
```

Nenhum Command retorna diretamente um resultado construído a partir de leitura simultânea de estado — sua responsabilidade termina em processar a mudança e publicar o Evento resultante. Toda leitura subsequente, incluindo a confirmação do próprio resultado ao Usuário que emitiu o Command, é resolvida por uma Query contra o Read Model já atualizado, mantendo a separação estrita entre as duas responsabilidades.

---

## 7. Componentes Internos

### CRM Manager

O CRM Manager é o ponto de entrada e orquestrador central do CRM Hub, equivalente em função ao Knowledge Manager e ao Integration Manager já descritos em seus respectivos documentos. Ele recebe todo Command e toda Query, direciona-os ao componente especializado correspondente, e não contém, ele mesmo, nenhuma lógica de negócio específica de Capacidade.

### Lead Manager

O Lead Manager administra o ciclo de vida de um Lead — criação, atualização de sinal de qualificação, conversão — delegando Validation ao Validation Engine e Deduplicação ao Deduplication Engine antes de confirmar qualquer criação.

### Customer Manager

O Customer Manager administra o ciclo de vida de um Customer já convertido, incluindo atualização de atributo e transição de Status, publicando os Eventos correspondentes já catalogados no Blueprint.

### Contact Manager

O Contact Manager administra Contact associado a Customer ou Organization, garantindo que a Regra de associação única por vez, já fixada no Blueprint, Capítulo 12, seja respeitada em toda operação de criação ou de atualização.

### Organization Manager

O Organization Manager administra o ciclo de vida de Organization, e a associação de múltiplos Contact a uma mesma Organization.

### Supplier Manager

O Supplier Manager administra o ciclo de vida de Supplier como natureza de Relationship distinta de Customer, conforme já estabelecido no Blueprint, Capítulo 12.

### Partner Manager

O Partner Manager administra o ciclo de vida de Partner, incluindo sua associação como colaborador visível em uma Opportunity de um Customer final, nunca como titular direto dela.

### Relationship Manager

O Relationship Manager administra o Aggregate central Relationship — Status, Lifecycle Stage, Account Manager — que conecta a Empresa a qualquer uma das partes externas descritas acima, servindo como componente comum consultado por Customer Manager, Supplier Manager e Partner Manager para a porção estrutural compartilhada de cada um.

### Pipeline Manager

O Pipeline Manager administra a estrutura configurável de Pipeline de uma Empresa, resolvendo, para cada nova Opportunity, qual Pipeline se aplica, conforme o princípio Configuration-Driven Pipeline já descrito no Capítulo 5.

### Opportunity Manager

O Opportunity Manager administra o ciclo de vida de uma Opportunity, desde sua criação até seu encerramento como Won ou Lost, sempre associada a um Customer ou Organization conforme já exigido no Blueprint, Capítulo 12.

### Stage Manager

O Stage Manager administra a progressão de uma Opportunity entre Estágios de um Pipeline, garantindo que toda mudança de Stage produza o Timeline Event correspondente, conforme a Regra de negócio já fixada no Blueprint.

### Activity Manager

O Activity Manager administra o registro de Activity já realizada, associada a exatamente um Relationship, conforme a Regra já fixada no Blueprint, Capítulo 12.

### Task Manager

O Task Manager administra Task pendente, sua atribuição a um responsável, e sua conclusão, publicando `TaskAssigned` e `TaskCompleted` já catalogados no Blueprint.

### Timeline Manager

O Timeline Manager é o guardião da imutabilidade da Timeline, já descrita como princípio arquitetural no Capítulo 5 — nenhum outro componente do CRM Hub possui capacidade técnica de gravar diretamente um Timeline Event; todos delegam essa gravação exclusivamente ao Timeline Manager, que a trata como uma operação de apenas-anexar, nunca de edição ou remoção.

### Consent Manager

O Consent Manager, neste contexto específico do CRM Hub, administra o consentimento de comunicação de uma parte externa, versionado conforme já exigido no Blueprint — distinto do Consent Manager mais amplo já descrito em `IDENTITY_HUB.md`, que trata de consentimento de dado pessoal de Usuário da própria plataforma, não de parte externa em relacionamento comercial.

### Segment Manager

O Segment Manager administra a Segmentação de Relationship por característica compartilhada, publicando `SegmentUpdated` já catalogado no Blueprint.

### Tag Manager

O Tag Manager administra o vocabulário de Tag aplicável a um Relationship, de menor formalidade que Segment.

### Custom Field Manager

O Custom Field Manager administra campo adicional configurado por Empresa, aplicando o princípio Configuration-Driven já descrito no Capítulo 5, sem exigir alteração do Domain Model central do CRM Hub para nenhuma Empresa específica.

### Ownership Manager

O Ownership Manager administra a atribuição e a transferência de Account Manager responsável por um Relationship, garantindo unicidade de responsável em qualquer momento, conforme a Regra já fixada no Blueprint, e produzindo registro auditável a cada transferência, conforme o princípio Ownership Transfer is Auditable já descrito no Capítulo 5.

### Search Manager

O Search Manager expõe a capacidade de busca sobre Lead, Customer, Organization e demais Entidades, mantendo seu próprio índice otimizado, atualizado a partir dos mesmos Eventos que atualizam os demais Read Models do CRM Hub.

### Validation Engine

O Validation Engine verifica que um Command respeita toda Regra de negócio já fixada no Blueprint antes de permitir seu processamento, aplicação direta do princípio Validation at the Boundary já descrito no Capítulo 5.

### Deduplication Engine

O Deduplication Engine identifica correspondência provável entre um novo Lead ou Customer e um registro já existente, com base em Contact — e-mail, telefone — sinalizando o caso para revisão em vez de mesclar automaticamente, conforme já detalhado no Blueprint, caso de uso "Duplicidade detectada".

### Merge Engine

O Merge Engine executa a fusão de dois registros já confirmados como duplicados, preservando a Timeline de ambos como histórico consolidado do registro resultante, nunca descartando nenhuma das duas histórias, aplicação do princípio Merge as an Explicit Operation já descrito no Capítulo 5.

### Import Manager

O Import Manager processa a entrada em lote de Lead ou Customer, tipicamente originada de uma migração de sistema externo através do Integration Hub, submetendo cada registro ao mesmo Validation Engine e Deduplication Engine usado para captura individual, nunca por um caminho de exceção que os contorne.

### Export Manager

O Export Manager disponibiliza o dado de relacionamento de uma Empresa em formato consultável e exportável, útil tanto para uso fora da plataforma quanto para auditoria externa.

### CRM Analytics

O CRM Analytics agrega dado operacional interno do CRM Hub — volume de Lead capturado, taxa de conversão, tempo médio de progressão por Estágio — consumido pelo Analytics Hub já descrito em `SYSTEM_BLUEPRINT.md`, sem que o CRM Hub calcule, ele mesmo, um indicador de negócio mais amplo que dependa de dado de outro Hub.

### History Manager

O History Manager preserva o registro cronológico de mudança relevante de qualquer Entidade do CRM Hub, sustentando tanto a reconstrução de Read Model quanto investigação futura, complementar e distinto do Timeline Manager — History cobre toda mudança de estado técnico, enquanto Timeline cobre especificamente a história de negócio de um Relationship.

### Audit Manager

O Audit Manager preserva o registro imutável de toda operação sensível — transferência de Ownership, Merge de registro, Archive de Customer —, alinhado ao mesmo padrão de auditoria imutável já estabelecido em toda a plataforma.

### Lifecycle Manager

O Lifecycle Manager administra a transição de Lifecycle Stage de um Relationship ao longo do tempo, conforme já definido no Blueprint, Capítulo 7, aplicando regra configurável de quando um relacionamento é considerado em risco ou recuperado.

### Configuration Manager

O Configuration Manager administra os parâmetros específicos de cada Empresa — estrutura de Pipeline, campo customizado, vocabulário de Estágio —, aplicando o princípio Configuration-Driven Pipeline já descrito no Capítulo 5.

### Notification Publisher

O Notification Publisher aciona notificação a um Usuário responsável — por exemplo, ao receber um Task atribuído —, consumindo o Notification Engine já descrito em `AUTOMATION_ENGINE.md`, nunca implementando lógica de envio própria.

### Event Publisher

O Event Publisher é o componente técnico responsável por publicar todo Evento de domínio já catalogado no Blueprint no Event Bus descrito em `SYSTEM_BLUEPRINT.md`, garantindo que todo Command bem-sucedido produza o Evento correspondente antes de considerar a operação concluída.

### Reporting Adapter

O Reporting Adapter expõe o Read Model do CRM Hub em formato consumível por relatório gerado através do Document Branding já descrito em `BRANDING_HUB.md`, sem que o CRM Hub implemente sua própria lógica de formatação de documento.

Cada um destes componentes tem um limite estrito de responsabilidade, e nenhum deles acumula lógica de outro componente vizinho — a mesma disciplina de modularidade interna já aplicada em todos os documentos anteriores desta série se aplica, com o mesmo rigor, aqui.

Os trinta e três componentes descritos acima se organizam em cinco categorias funcionais, cada uma com uma natureza distinta de responsabilidade dentro da arquitetura do CRM Hub:

```
                CATEGORIAS DE COMPONENTES INTERNOS DO CRM HUB
   ┌───────────────────────────────────────────────────────────┐
   │  Orquestração                                                 │
   │    CRM Manager                                                  │
   │                                                                │
   │  Gestão de Entidade (um Manager por Entidade do domínio)         │
   │    Lead · Customer · Contact · Organization · Supplier ·           │
   │    Partner · Relationship · Pipeline · Opportunity · Stage ·         │
   │    Activity · Task · Timeline · Consent · Segment · Tag ·              │
   │    Custom Field · Ownership                                              │
   │                                                                │
   │  Qualidade e Integridade de Dado                                  │
   │    Validation Engine · Deduplication Engine · Merge Engine           │
   │                                                                │
   │  Movimento de Dado                                                  │
   │    Import Manager · Export Manager · Search Manager                   │
   │                                                                │
   │  Suporte Transversal                                                  │
   │    CRM Analytics · History Manager · Audit Manager ·                   │
   │    Lifecycle Manager · Configuration Manager ·                           │
   │    Notification Publisher · Event Publisher · Reporting Adapter            │
   └───────────────────────────────────────────────────────────┘
```

Essa categorização não introduz nenhuma nova camada de acoplamento entre componentes — ela é puramente descritiva, útil para orientar onde uma nova capacidade futura deveria ser adicionada. Um componente de Gestão de Entidade nunca invoca diretamente outro componente de Gestão de Entidade sem passar pelo CRM Manager ou por um Domain Service explícito quando a operação exige coordenação entre Aggregates distintos — por exemplo, a criação de um Customer a partir de um Lead já qualificado, já detalhada no fluxo de Conversão do Capítulo 9, coordena Lead Manager e Customer Manager através do CRM Manager, nunca por uma chamada direta e implícita de um componente ao outro.

---

## 8. Business Capabilities

As dezesseis Capacidades de Negócio do CRM Hub já foram catalogadas e definidas em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 6. Este capítulo detalha, para cada uma, qual conjunto de componentes internos, já descritos no Capítulo 7, a implementa arquiteturalmente.

Lead Management é implementada pelo Lead Manager, com suporte do Validation Engine e do Deduplication Engine. Customer Management é implementada pelo Customer Manager, com suporte do Relationship Manager para a porção estrutural comum. Contact Management é implementada pelo Contact Manager. Relationship Management é implementada pelo Relationship Manager, servindo como base comum consultada por Customer Manager, Supplier Manager e Partner Manager. Supplier Management é implementada pelo Supplier Manager. Partner Management é implementada pelo Partner Manager. Opportunity Management é implementada pelo Opportunity Manager, com suporte do Pipeline Manager e do Stage Manager. Pipeline Management é implementada pelo Pipeline Manager, consumindo o Configuration Manager para resolver a estrutura específica de cada Empresa. Activity Tracking é implementada pelo Activity Manager. Task Management é implementada pelo Task Manager, com suporte do Notification Publisher para alertar o responsável atribuído. Timeline é implementada exclusivamente pelo Timeline Manager, conforme já detalhado no Capítulo 7. Customer Segmentation é implementada pelo Segment Manager. Consent Management é implementada pelo Consent Manager. Customer Lifecycle é implementada pelo Lifecycle Manager. Ownership é implementada pelo Ownership Manager, com suporte do Audit Manager para toda transferência. Custom Fields é implementada pelo Custom Field Manager, consumindo o Configuration Manager.

```
              MAPEAMENTO DE CAPACIDADE PARA COMPONENTE (resumo)
   ┌───────────────────────────────────────────────────────────┐
   │  Lead Management        → Lead Manager                        │
   │  Customer Management    → Customer Manager                     │
   │  Contact Management     → Contact Manager                       │
   │  Relationship Mgmt      → Relationship Manager                    │
   │  Supplier Management    → Supplier Manager                          │
   │  Partner Management     → Partner Manager                            │
   │  Opportunity Mgmt       → Opportunity Manager                          │
   │  Pipeline Management    → Pipeline Manager                               │
   │  Activity Tracking      → Activity Manager                                 │
   │  Task Management        → Task Manager                                       │
   │  Timeline               → Timeline Manager (exclusivo)                         │
   │  Customer Segmentation  → Segment Manager                                        │
   │  Consent Management     → Consent Manager                                          │
   │  Customer Lifecycle     → Lifecycle Manager                                          │
   │  Ownership              → Ownership Manager                                            │
   │  Custom Fields          → Custom Field Manager                                           │
   └───────────────────────────────────────────────────────────┘
```

Nenhuma Capacidade de Negócio é implementada por mais de um componente principal — quando um componente precisa de suporte de outro, como Opportunity Management consultando Pipeline Manager, essa relação é uma dependência interna explícita dentro do mesmo Bounded Context do CRM Hub, nunca uma sobreposição de responsabilidade.

Vale notar que este mapeamento de um-para-um entre Capacidade e componente principal não impede que múltiplas Capacidades compartilhem um componente de suporte transversal, já descrito no Capítulo 7 — o Validation Engine, por exemplo, é consultado por praticamente toda Capacidade que processa um Command, e o Audit Manager é consultado por toda Capacidade que produz uma mudança sensível a rastrear. A diferença entre um componente principal de Capacidade e um componente de suporte transversal é que o primeiro possui um Domain Model próprio e uma razão de negócio específica para existir — a razão de existir do Lead Manager é, precisamente, a Capacidade Lead Management —, enquanto o segundo existe para servir qualquer Capacidade que dele necessite, sem possuir, ele mesmo, nenhuma razão de negócio isolada além de garantir uma propriedade transversal — consistência de dado, rastreabilidade, configuração — a toda a arquitetura do Hub.

---

## 9. Fluxos Operacionais

**Novo Lead.** O Lead Manager recebe um Command `CreateLead`, delega ao Validation Engine e ao Deduplication Engine, cria o Aggregate correspondente, e o Event Publisher publica `LeadCreated`.

**Lead Qualification.** O Lead Manager processa um Command `QualifyLead`, avaliando Regra própria ou consumindo sugestão do AI Hub através da integração já detalhada no Capítulo 13, e o Event Publisher publica `LeadQualified`.

**Conversão.** O Lead Manager processa `ConvertLead`, o Customer Manager cria o novo Aggregate Customer e o Relationship Manager cria o Relationship correspondente, o Lead original é arquivado com referência preservada, e o Event Publisher publica `LeadConverted` e `CustomerCreated`.

**Pipeline.** O Pipeline Manager resolve a estrutura de Estágio configurada pela Empresa, consumindo o Configuration Manager, no momento em que uma nova Opportunity é criada.

**Opportunity.** O Opportunity Manager processa `CreateOpportunity`, associando-a a um Customer ou Organization já existente, e o Event Publisher publica `OpportunityCreated`.

**Won.** O Stage Manager processa a transição para o Estágio final de sucesso, o Opportunity Manager encerra o Aggregate com resultado positivo, o Timeline Manager registra o Timeline Event correspondente, e o Event Publisher publica `OpportunityWon`, consumido pelo Finance Hub conforme detalhado no Capítulo 14.

**Lost.** Fluxo equivalente ao anterior, com resultado negativo e motivo registrado, publicando `OpportunityLost`.

**Customer Lifecycle.** O Lifecycle Manager avalia periodicamente, ou em reação a Evento de inatividade consumido de outro Hub, se um Relationship deve transitar de Lifecycle Stage, publicando `RelationshipChanged` quando aplicável.

**Partner Collaboration.** O Partner Manager registra um Partner, e o Opportunity Manager associa uma Opportunity ao Customer final com o Partner referenciado como colaborador, conforme já detalhado no Blueprint.

**Supplier Management.** O Supplier Manager registra um Supplier, o Relationship Manager cria a estrutura comum de Relationship, e o Activity Manager registra toda interação subsequente, compondo a mesma Timeline que qualquer outro Relationship.

```
              FLUXO OPERACIONAL — CONVERSÃO DE LEAD (exemplo)
   ┌───────────────────────────────────────────────────────────┐
   │  Command ConvertLead                                          │
   │       │                                                        │
   │       ▼                                                        │
   │  Validation Engine (confirma elegibilidade)                      │
   │       │                                                        │
   │       ▼                                                        │
   │  Lead Manager (encerra o Lead) ──► Customer Manager               │
   │       │                              (cria o Customer)              │
   │       │                                     │                        │
   │       │                                     ▼                        │
   │       │                            Relationship Manager                │
   │       │                              (cria o Relationship)               │
   │       ▼                                     │                             │
   │  Timeline Manager ◄─────────────────────────┘                              │
   │  (registra o Timeline Event de conversão, herdando                          │
   │   a história prévia do Lead original)                                         │
   │       │                                                                       │
   │       ▼                                                                        │
   │  Event Publisher ──► LeadConverted, CustomerCreated                             │
   └───────────────────────────────────────────────────────────┘
```

```
              FLUXO OPERACIONAL — WON/LOST (exemplo)
   ┌───────────────────────────────────────────────────────────┐
   │  Command MoveOpportunity (para Estágio final)                  │
   │       │                                                        │
   │       ▼                                                        │
   │  Validation Engine (confirma transição de Estágio válida)         │
   │       │                                                        │
   │       ▼                                                        │
   │  Stage Manager (aplica a transição)                               │
   │       │                                                        │
   │       ▼                                                        │
   │  Opportunity Manager (encerra o Aggregate com resultado)             │
   │       │                                                        │
   │       ▼                                                        │
   │  Timeline Manager (registra o Timeline Event de encerramento)          │
   │       │                                                        │
   │       ▼                                                        │
   │  Event Publisher ──► OpportunityWon ou OpportunityLost                  │
   │       │                                                        │
   │       ▼                                                        │
   │  Consumido pelo Finance Hub (Won) ou apenas pelo Analytics Hub           │
   │  (Lost), conforme detalhado no Capítulo 14                                  │
   └───────────────────────────────────────────────────────────┘
```

O paralelismo entre os dois fluxos acima — Conversão e Won/Lost — não é acidental: ambos seguem exatamente a mesma sequência estrutural de Validation, mudança de Aggregate, registro de Timeline Event e publicação de Evento, porque essa sequência é a própria definição arquitetural de um fluxo operacional dentro do CRM Hub, aplicada de forma consistente a qualquer Command que produza uma transição de estado relevante, independentemente de qual Capacidade de Negócio o originou.

---

## 10. Comandos

Create Lead cria um novo registro de Lead a partir de dado capturado por qualquer canal, processado pelo Lead Manager.

Convert Lead transiciona um Lead qualificado para Customer, processado em conjunto pelo Lead Manager e pelo Customer Manager, conforme o fluxo já descrito no Capítulo 9.

Create Customer cria um Customer diretamente, sem passar por Lead prévio, quando aplicável — por exemplo, importação de base já existente através do Import Manager.

Update Customer altera atributo de um Customer já existente, processado pelo Customer Manager, sempre validado pelo Validation Engine antes de aplicação.

Assign Owner atribui ou transfere o Account Manager responsável por um Relationship, processado pelo Ownership Manager, sempre produzindo registro auditável.

Create Opportunity abre uma nova possibilidade de negócio associada a um Customer ou Organization já existente, processado pelo Opportunity Manager.

Move Opportunity transiciona uma Opportunity entre Estágios de um Pipeline, processado pelo Stage Manager, sempre produzindo o Timeline Event correspondente.

Create Task cria um novo Task pendente associado a um Relationship, atribuído a um responsável, processado pelo Task Manager.

Complete Task marca um Task como concluído, processado pelo Task Manager, publicando `TaskCompleted`.

Merge Customer funde dois registros já confirmados como duplicados, processado pelo Merge Engine, preservando a Timeline consolidada de ambos.

Archive Customer encerra um Relationship como Soft Delete, processado pelo Relationship Manager, preservando integralmente sua Timeline consultável.

```
                              COMANDOS
   ┌───────────────────────────────────────────────────────────┐
   │  Aquisição:      CreateLead · ConvertLead                      │
   │  Relacionamento: CreateCustomer · UpdateCustomer ·              │
   │                  AssignOwner · MergeCustomer · ArchiveCustomer   │
   │  Comercial:      CreateOpportunity · MoveOpportunity              │
   │  Operação:       CreateTask · CompleteTask                          │
   └───────────────────────────────────────────────────────────┘
```

Todo Comando listado acima segue o princípio Idempotent Commands já descrito no Capítulo 5 — cada um é identificado por um identificador de operação único, garantindo que uma reenvio acidental do mesmo Comando, por exemplo por retry de rede, nunca produza um segundo Lead, uma segunda Opportunity, ou qualquer outro efeito duplicado.

Nem todo Comando tecnicamente possível é exposto igualmente a todo Perfil de Usuário — a autorização granular já detalhada em `IDENTITY_HUB.md` se aplica a cada um dos onze Comandos listados de forma independente. Um Perfil Atendimento, por exemplo, tipicamente tem Permissão para `CreateTask` e `CompleteTask`, mas não para `MergeCustomer` ou `ArchiveCustomer`, operações reservadas a Perfis de maior autoridade administrativa, conforme o modelo de Perfis já estabelecido em `SAAS_ARCHITECTURE.md`, Capítulo 11. O CRM Manager verifica essa autorização granular antes de encaminhar qualquer Comando ao componente especializado correspondente, conforme já detalhado no Capítulo 13 deste documento — nenhum Comando alcança seu Manager de destino sem que essa verificação já tenha sido aplicada com sucesso.

---

## 11. Consultas

Customer 360 recupera a visão consolidada de um Relationship — dado estrutural, Opportunity em andamento, Timeline resumida — resolvida contra um Read Model dedicado, mantido atualizado pelo Timeline Manager e pelo Customer Manager em conjunto.

Timeline recupera o histórico cronológico completo de um Relationship específico, resolvida diretamente contra o Read Model mantido pelo Timeline Manager.

Open Opportunities recupera toda Opportunity ainda não encerrada, filtrável por Pipeline, por Estágio ou por Account Manager responsável.

Active Leads recupera todo Lead ainda não convertido nem descartado, resolvida contra o Read Model mantido pelo Lead Manager.

Pipeline Summary recupera a distribuição agregada de Opportunity por Estágio dentro de um Pipeline específico, uma visão consolidada usada tipicamente por Gestor para acompanhamento de funil comercial.

Segment Search recupera todo Relationship associado a um Segment específico, resolvida contra o índice mantido pelo Search Manager.

Customer History é sinônimo operacional de Timeline aplicado especificamente à perspectiva de um Customer, distinto de Activity History, que filtra especificamente por tipo Activity dentro dessa mesma Timeline.

Activity History recupera especificamente as Activities associadas a um Relationship, sem incluir demais tipos de Timeline Event, útil quando o consulente precisa apenas do histórico de interação, não da história completa de mudança de Estágio ou de Task.

Relationship View recupera a estrutura completa de um Relationship — Status, Lifecycle Stage, Account Manager, Address, Communication Preference, Consent — sem incluir a Timeline extensa, útil para exibição rápida de painel resumido.

```
                              CONSULTAS
   ┌───────────────────────────────────────────────────────────┐
   │  Visão consolidada:  Customer 360 · Relationship View          │
   │  Histórico:          Timeline · Customer History ·               │
   │                      Activity History                              │
   │  Comercial:          Open Opportunities · Pipeline Summary            │
   │  Aquisição:          Active Leads                                       │
   │  Organização:        Segment Search                                       │
   └───────────────────────────────────────────────────────────┘
```

Toda Query listada acima é resolvida contra um Read Model já materializado, aplicação do princípio Read Model Optimization já descrito no Capítulo 5 — nenhuma delas reconstrói seu resultado a partir de varredura completa do armazenamento transacional primário a cada chamada.

A distinção entre Customer 360 e Relationship View, as duas Queries de visão consolidada listadas acima, merece esclarecimento adicional por serem, à primeira vista, semelhantes. Relationship View é deliberadamente leve — resolve rapidamente a estrutura central de um Relationship para exibição em um painel resumido ou em uma lista de resultado de busca, sem incluir Timeline extensa. Customer 360 é deliberadamente completa — inclui não apenas a estrutura central, mas Opportunity em andamento, resumo de Timeline recente e indicador de Lifecycle Stage, projetada para o momento em que um Usuário efetivamente abre o registro completo de um Relationship específico para trabalhar sobre ele. Manter essas duas Queries distintas, em vez de uma única Query universal que sempre retorna tudo, é uma decisão deliberada de desempenho: a maioria das interações com o CRM Hub — uma lista, uma busca, um painel — se beneficia da resposta rápida de Relationship View, e apenas a minoria de interações que efetivamente exige profundidade completa paga o custo adicional de resolver Customer 360.

---

## 12. Eventos

Este capítulo não redefine nenhum Evento — o catálogo completo dos dezoito Eventos do domínio, com seu Contrato e o momento exato de sua publicação, já está definido em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 10. O que este capítulo descreve é a arquitetura técnica de publicação e consumo desses Eventos dentro do CRM Hub.

Publicação acontece exclusivamente através do Event Publisher já descrito no Capítulo 7 — nenhum outro componente do CRM Hub publica Evento diretamente no Event Bus, garantindo um único ponto de emissão consistente e observável.

Consumo de Evento originado em outro Hub acontece através de um componente de Anti-Corruption Layer específico a cada integração, detalhado no Capítulo 14, garantindo que o Domain Model interno do CRM Hub nunca seja diretamente moldado pela estrutura de dado de outro domínio.

Versionamento de Evento segue o mesmo princípio já estabelecido em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 10 — uma mudança incompatível de Contrato produz uma nova versão, nunca uma alteração silenciosa do formato já esperado por Hub consumidor.

Replay é suportado pelo History Manager já descrito no Capítulo 7, permitindo reconstruir o Read Model de qualquer Capacidade a partir da sequência completa de Eventos já publicados, relevante tanto para recuperação de falha quanto para introdução de um novo Read Model que precisa de histórico completo desde o início da operação daquele Relationship.

Idempotência de consumo garante que o CRM Hub, ao consumir um Evento originado de outro Hub — por exemplo, `PaymentReceived` do Finance Hub —, processe esse Evento de forma segura mesmo que ele seja entregue mais de uma vez pelo Event Bus, nunca produzindo atualização duplicada do Relationship correspondente.

---

## 13. Integração com Platform Services

O Identity Hub autentica e autoriza toda operação de Command e de Query sobre o CRM Hub, através do modelo RBAC e ABAC já detalhado em `IDENTITY_HUB.md` — o CRM Manager verifica Permissão através do Identity Hub antes de encaminhar qualquer Command ao componente especializado correspondente.

O Automation Engine consome Eventos publicados pelo CRM Hub — `LeadCreated`, `OpportunityWon`, e os demais já catalogados no Blueprint — para disparar Workflow, conforme já exemplificado em `AUTOMATION_ENGINE.md`, Capítulo 19; o CRM Hub, por sua vez, invoca o Automation Engine através de uma Action quando um de seus próprios fluxos internos precisa de orquestração condicional que não pertence à sua lógica central de domínio.

O Knowledge Hub é consultado pelo CRM Hub, através do AI Hub conforme detalhado adiante, quando uma sugestão de resposta a um Lead ou Customer se beneficia de conhecimento já documentado, seguindo o padrão de Retrieval-Augmented Generation já detalhado em `KNOWLEDGE_HUB.md`, Capítulo 11 — o CRM Hub nunca consulta o Knowledge Hub diretamente sem essa mediação, respeitando a mesma fronteira já estabelecida naquele documento.

O Integration Hub é a única via pela qual o CRM Hub captura Lead de canal externo ou notifica sistema externo sobre uma mudança de Relationship, através do modelo já detalhado em `INTEGRATION_HUB.md` — o Import Manager e o Export Manager, já descritos no Capítulo 7, consomem exclusivamente esse canal para qualquer entrada ou saída de dado que atravesse a fronteira da plataforma.

O Business Profile Engine informa o CRM Hub sobre o Segmento e a Maturidade da Empresa, consumido pelo Configuration Manager para calibrar vocabulário de Estágio e prioridade de Segmentação, através do evento `ProfileChanged` já descrito em `SYSTEM_BLUEPRINT.md` e detalhado em `BUSINESS_PROFILE_ENGINE.md`.

O Branding Hub informa o Reporting Adapter e o Notification Publisher sobre identidade de marca e tom de voz aplicável a qualquer relatório ou notificação gerada em nome de uma Empresa, através do modelo já detalhado em `BRANDING_HUB.md`.

O AI Hub é consumido pelo Lead Manager para assistir a decisão de Qualificação, pelo Opportunity Manager para sugerir priorização de Opportunity, e pelo Notification Publisher para compor sugestão de resposta a Lead ou Customer — sempre através do contrato já detalhado em `AI_HUB.md`, o CRM Hub nunca implementando lógica de inteligência artificial própria.

```
              INTEGRAÇÃO DO CRM HUB COM PLATFORM SERVICES
                       E ADAPTIVE INTELLIGENCE
   ┌───────────────────────────────────────────────────────────┐
   │  CRM Manager                                                  │
   │       │                                                        │
   │       ├──► Identity Hub          (autenticação, Permissão)       │
   │       ├──► AI Hub                (Qualificação, priorização,      │
   │       │                           sugestão de resposta)             │
   │       ├──► Knowledge Hub          (via AI Hub — Retrieval)             │
   │       ├──► Integration Hub        (captura externa, notificação)        │
   │       ├──► Automation Engine      (Workflow disparado por Evento)         │
   │       ├──► Business Profile Engine (Segmento, Maturidade)                  │
   │       └──► Branding Hub           (tom e identidade em relatório)             │
   └───────────────────────────────────────────────────────────┘
```

Nenhuma dessas sete integrações é implementada como uma dependência bidirecional simétrica — em cada caso, o CRM Hub é sempre o consumidor solicitante, e o Platform Service ou componente de Adaptive Intelligence correspondente decide, internamente, como atender essa solicitação, exatamente conforme o princípio já estabelecido em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 14. Uma eventual falha de disponibilidade em qualquer um desses sete serviços degrada a capacidade específica que ele sustenta — por exemplo, a indisponibilidade momentânea do AI Hub suspende a sugestão assistida de Qualificação, mas nunca impede que um Usuário qualifique um Lead manualmente através do Command padrão já descrito no Capítulo 10, preservando a operação essencial do CRM Hub mesmo sob degradação de uma capacidade de Adaptive Intelligence específica.

---

## 14. Integração com outros Business Hubs

O Communication Hub publica `MessageReceived`, consumido pelo Activity Manager para registrar uma nova Activity na Timeline correspondente, e consome `ConsentUpdated` e `RelationshipChanged`, ambos publicados pelo CRM Hub, para respeitar preferência de contato antes de enviar qualquer mensagem — nenhum dos dois Hubs acessa a Entidade interna do outro diretamente, apenas os Eventos publicados por cada um.

O Finance Hub consome `OpportunityWon` para iniciar faturamento, e publica seu próprio evento de pagamento confirmado, consumido pelo CRM Hub para atualizar Status de Relacionamento através de uma Anti-Corruption Layer dedicada — o CRM Hub mantém apenas referência mínima ao estado financeiro relevante à sua própria operação, nunca uma cópia da Entidade Invoice pertencente ao Finance Hub, conforme já estabelecido no Blueprint, Capítulo 4.

O Growth Hub consome `SegmentUpdated` e `LeadCreated` para calibrar Campanha direcionada, e publica evento de Campanha, consumido pelo CRM Hub para atribuir origem a um novo Lead capturado a partir dela.

O Analytics Hub consome todo Evento publicado pelo CRM Hub para calcular indicador consolidado de negócio, sem nunca ser chamado diretamente pelo CRM Hub para fornecer dado em tempo real a uma decisão em andamento — a mesma regra de consumo exclusivamente assíncrono já estabelecida em `SYSTEM_BLUEPRINT.md`, Capítulo 8.

```
              COLABORAÇÃO ENTRE BUSINESS HUBS (via Evento)
   ┌───────────────────────────────────────────────────────────┐
   │  CRM Hub                                                      │
   │    publica: LeadCreated · LeadConverted · OpportunityWon ·      │
   │             OpportunityLost · SegmentUpdated ·                    │
   │             RelationshipChanged · ConsentUpdated                    │
   │    consome:  MessageReceived (Communication Hub) ·                    │
   │              PaymentConfirmed (Finance Hub) ·                            │
   │              CampaignPublished (Growth Hub)                                │
   └───────────────────────────────────────────────────────────┘
```

Cada Evento consumido pelo CRM Hub, listado acima, atravessa uma Anti-Corruption Layer dedicada antes de afetar qualquer Aggregate interno — o Evento `PaymentConfirmado`, por exemplo, nunca introduz diretamente um conceito do Domain Model do Finance Hub dentro do CRM Hub; ele é traduzido para uma atualização de Status já pertencente ao próprio vocabulário do Relationship, exatamente como já ilustrado no diagrama de Anti-Corruption Layer de `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 10.

---

## 15. Segurança

Permissões sobre toda operação do CRM Hub são verificadas através do Identity Hub, com granularidade que distingue, por exemplo, um Perfil Atendimento com acesso operacional ao CRM Hub de um Perfil Financeiro com acesso apenas de leitura a indicador consolidado, conforme já detalhado em `SAAS_ARCHITECTURE.md`, Capítulo 11.

Auditoria, administrada pelo Audit Manager já descrito no Capítulo 7, preserva o registro imutável de toda operação sensível — transferência de Ownership, Merge de registro, alteração de Consent.

Ownership, já detalhado no Capítulo 7 e no Capítulo 10, é ele mesmo um mecanismo de segurança operacional — ao garantir que todo Relationship tenha exatamente um responsável identificável, o CRM Hub elimina a ambiguidade de responsabilidade que historicamente permite que uma ação inadequada sobre um relacionamento passe despercebida por falta de dono claro para investigá-la.

A conformidade com a LGPD segue o mesmo padrão já estabelecido em todos os documentos anteriores desta série, com atenção específica a Contact e a Consent, ambas potencialmente contendo dado pessoal de parte externa — o direito de exclusão, quando aplicável, é honrado através do Archive já descrito no Capítulo 5, nunca por remoção física que comprometeria a integridade da Timeline de outros Relationship relacionados.

Um caso específico deste Hub que merece esclarecimento é a tensão aparente entre o direito de exclusão de dado pessoal e o princípio de Imutabilidade da Timeline. Quando uma parte externa exerce seu direito de exclusão sobre dado pessoal identificável — por exemplo, um Contact solicitando remoção de seu próprio nome e e-mail —, o CRM Hub não apaga o Timeline Event correspondente, o que violaria a Regra de negócio já fixada no Blueprint; em vez disso, o dado pessoal identificável dentro daquele registro é ofuscado ou desassociado, preservando a existência estrutural do evento histórico — "uma Activity ocorreu nesta data, com este resultado" — sem preservar o dado pessoal específico que uma exclusão legítima exige remover. Essa é a mesma disciplina de "excluir o dado pessoal, preservar o fato estrutural" já aplicada à memória de longa duração do AI Hub em `AI_HUB.md`, Capítulo 17, aplicada aqui à Timeline do CRM Hub.

Consentimento, administrado pelo Consent Manager, é versionado conforme já exigido no Blueprint, sustentando prova retroativa de qual era o consentimento vigente em qualquer momento específico do passado.

Histórico, administrado em conjunto pelo History Manager e pelo Timeline Manager, garante que toda mudança relevante permaneça reconstruível.

Soft Delete, já descrito como princípio no Capítulo 5, garante que Archive nunca implica perda de dado — apenas remoção de visibilidade operacional ativa, preservando integralmente a Timeline consultável para fins de auditoria ou de eventual recuperação.

Imutabilidade da Timeline, garantida arquiteturalmente pelo Timeline Manager conforme já descrito no Capítulo 7, é tratada como a garantia de segurança mais fundamental deste Hub — sem ela, nenhuma auditoria de relacionamento seria confiável, porque o próprio registro histórico poderia ter sido alterado depois do fato.

```
                  CAMADAS DE SEGURANÇA DO CRM HUB
   ┌───────────────────────────────────────────────────────────┐
   │  Autenticação e Autorização (Identity Hub)                     │
   │       │  toda Command e Query verificada antes de encaminhada    │
   │       ▼                                                         │
   │  Ownership (Ownership Manager)                                    │
   │       │  responsabilidade única e explícita por Relationship        │
   │       ▼                                                         │
   │  Validation (Validation Engine)                                     │
   │       │  nenhuma mudança de estado inválida é aplicada                │
   │       ▼                                                         │
   │  Soft Delete (Relationship Manager)                                    │
   │       │  Archive nunca remove dado fisicamente                          │
   │       ▼                                                         │
   │  Imutabilidade da Timeline (Timeline Manager)                             │
   │       │  histórico nunca é alterado após o fato                            │
   │       ▼                                                         │
   │  Auditoria (Audit Manager)                                                  │
   │       toda operação sensível preserva registro imutável                       │
   └───────────────────────────────────────────────────────────┘
```

Cada uma dessas seis camadas atua de forma independente e complementar — a falha ou o contorno de uma camada isolada não compromete as demais. Um Usuário sem Permissão adequada é bloqueado antes mesmo de chegar à etapa de Validation; uma Command tecnicamente autorizada mas inválida do ponto de vista de Regra de negócio é rejeitada pelo Validation Engine antes de qualquer mudança de estado; e mesmo uma operação autorizada e válida, uma vez aplicada, permanece permanentemente auditável através da Timeline imutável e do Audit Manager, garantindo que nenhuma ação sobre um Relationship jamais desapareça sem rastro.

Logs registram toda execução de Command e de Query, com o mesmo padrão estrutural já estabelecido em `SYSTEM_BLUEPRINT.md`, Capítulo 13.

Tracing conecta o processamento de um Command, a mudança de Aggregate resultante, e o Evento publicado em consequência, permitindo reconstruir exatamente o que o CRM Hub fez em resposta a uma solicitação específica, aplicação do mesmo princípio já detalhado em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 15.

SLIs específicos do CRM Hub incluem tempo de processamento de Convert Lead, taxa de sucesso de Deduplication Engine, e tempo de resolução de Customer 360.

SLOs calibrados especificamente à natureza interativa do CRM Hub — tipicamente mais rigorosos para Query de alto uso direto por Usuário, como Customer 360, do que para operação de menor frequência, como Merge Customer.

KPIs consumidos pelo CRM Analytics já descrito no Capítulo 7 incluem volume de Lead capturado, taxa de conversão, tempo médio de progressão de Pipeline e taxa de retenção de Relationship ao longo do Lifecycle.

Eventos, já descritos no Capítulo 12, são eles mesmos um registro observável de primeira classe — a sequência de Eventos de um Relationship específico reconstrói sua história completa de mudança de estado.

Health Checks reportam a disponibilidade operacional do CRM Hub de forma independente dos demais Business Hubs, permitindo isolar rapidamente se uma degradação percebida se origina neste domínio específico.

Métricas agregam volume de Command processado por tipo, taxa de erro de Validation, e latência de cada Query já catalogada no Capítulo 11.

Um sinal de observabilidade específico deste Hub, sem equivalente direto em nenhum dos Hubs de natureza técnica já documentados nesta série, é a taxa de correspondência sinalizada pelo Deduplication Engine que efetivamente resulta em Merge confirmado, versus a taxa que é revisada e rejeitada como falso positivo. Uma taxa de falso positivo elevada indica que o critério de correspondência usado pelo Deduplication Engine está calibrado de forma excessivamente sensível, gerando revisão manual desnecessária para uma equipe comercial já sobrecarregada; uma taxa de falso positivo muito baixa, por outro lado, pode indicar que o critério está calibrado de forma frouxa demais, deixando passar duplicidade real não detectada. Esse indicador é consultado periodicamente para recalibração do próprio Deduplication Engine, tratado como parte do ciclo de melhoria contínua de qualidade de dado do CRM Hub, não apenas como estatística operacional passiva.

Da mesma forma, o tempo médio de permanência de uma Opportunity em cada Estágio de um Pipeline específico é um indicador observável de negócio, distinto de latência técnica — ele revela onde, dentro do processo comercial de uma Empresa, uma Opportunity tende a estagnar, informação consumida tanto pelo próprio Gestor daquele Pipeline quanto pelo CRM Analytics para composição de indicador consolidado no Analytics Hub.

---

## 17. Escalabilidade

Milhões de clientes e milhões de leads são suportados porque nenhum componente interno do CRM Hub mantém estado compartilhado entre o Relationship de um Tenant e o de outro, aplicação direta do isolamento multiempresa já estabelecido em `SAAS_ARCHITECTURE.md`, Capítulo 6.

Sharding conceitual particiona o volume de Relationship por Tenant, garantindo que o crescimento excepcional de base de relacionamento de uma única Empresa não comprometa o desempenho de consulta de outra Empresa operando simultaneamente sobre a mesma infraestrutura compartilhada.

Busca, através do Search Manager já descrito no Capítulo 7, mantém índice dedicado e escalável horizontalmente, independente do armazenamento transacional primário usado para processamento de Command.

Cache reduz a carga de Query de alta frequência e baixa variabilidade, como Relationship View, sempre com tempo de vida limitado o suficiente para refletir atualização recente sem comprometer a precisão percebida pelo Usuário.

Processamento paralelo permite que múltiplos Commands, dirigidos a Aggregates diferentes, sejam processados simultaneamente sem interferência mútua, mesmo princípio de Failure Isolation já estabelecido em `AUTOMATION_ENGINE.md` e reafirmado para Business Hubs em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 16.

Alta disponibilidade garante que a indisponibilidade momentânea de uma instância de processamento não interrompa a operação do CRM Hub como um todo, seguindo o mesmo princípio geral já estabelecido em `SYSTEM_BLUEPRINT.md`, Capítulo 14.

A separação arquitetural entre caminho de escrita — Commands processados pelos Managers de Entidade — e caminho de leitura — Queries resolvidas contra Read Model — permite que os dois escalem de forma completamente independente um do outro. Uma Empresa cujo padrão de uso é predominantemente de consulta — um painel de Gestor consultado repetidamente ao longo do dia através de Pipeline Summary — pode ter seu caminho de leitura escalado horizontalmente sem qualquer necessidade de escalar proporcionalmente o caminho de escrita, que naquele caso específico permanece com volume comparativamente baixo. O inverso também se aplica: uma Empresa em campanha de captura massiva de Lead, gerando alto volume de escrita através de `CreateLead`, pode escalar seu caminho de escrita sem que isso exija nenhum ajuste no caminho de leitura, que continua servido pelo mesmo conjunto de Read Model já materializado independentemente do pico de captura em andamento.

---

## 18. Casos de Uso

**Novo cliente.** Uma Empresa que está migrando sua operação comercial para a plataforma precisa registrar um Cliente já conhecido, com quem já mantém relacionamento fora de qualquer sistema formal, sem que esse relacionamento tenha passado pelo funil de Lead da própria plataforma. O Administrador emite um Command `CreateCustomer` diretamente, informando o dado já conhecido daquele relacionamento. O Customer Manager cria o Aggregate correspondente; o Relationship Manager cria a estrutura comum de Relationship, já atribuindo um Account Manager inicial através do Ownership Manager; e o Event Publisher publica `CustomerCreated`, consumido pelo Analytics Hub para refletir esse novo Relationship no indicador consolidado de base de Cliente ativa, mesmo sem nenhum Lead correspondente na origem.

**Pipeline comercial.** Um Gestor de vendas de uma Empresa de Prestação de Serviços, cujo ciclo comercial é mais longo e consultivo que o de um Varejo, configura um Pipeline próprio através do Configuration Manager, com Estágios como "Diagnóstico", "Proposta enviada", "Negociação" e "Contrato assinado" — nomes e critérios de progressão específicos ao seu próprio processo comercial, resolvidos inteiramente por Configuration, sem exigir nenhuma alteração ao Domain Model central do CRM Hub. A partir desse momento, toda nova Opportunity criada dentro daquele Workspace é automaticamente resolvida pelo Pipeline Manager contra essa estrutura configurada, e todo Gestor que consulta Pipeline Summary vê a distribuição de Opportunity exatamente nesses termos, não em um vocabulário genérico imposto pela plataforma.

**Cliente recorrente.** Um Customer que já concluiu uma Opportunity anterior com sucesso — um `OpportunityWon` já registrado em sua Timeline — retorna com interesse em uma nova contratação. O vendedor responsável emite `CreateOpportunity`, e o Opportunity Manager, antes de criar o novo Aggregate, consulta o Relationship Manager para confirmar que o Relationship já existe e está ativo, evitando qualquer necessidade de recriar o Customer do zero ou de reprocessar uma nova captura de Lead. A nova Opportunity é aberta já com acesso completo ao histórico anterior daquele Relationship, através da mesma Timeline consultada por Customer 360.

**Fornecedor.** Uma Empresa registra um novo Supplier de matéria-prima através do Supplier Manager. O Relationship Manager cria a estrutura comum de Relationship — distinta, mas arquiteturalmente equivalente à de um Customer, conforme já detalhado no Capítulo 7 —, com seu próprio Account Manager responsável pela relação de fornecimento. Toda negociação de preço, toda entrega e toda reunião de alinhamento são registradas pelo Activity Manager na mesma Timeline, permitindo que a Empresa consulte o histórico completo de relacionamento com aquele Fornecedor exatamente com a mesma profundidade que consultaria o histórico de um Cliente.

**Parceiro.** Uma Agência de marketing, atuando como Partner de uma Empresa de software, identifica um Cliente em comum com potencial de projeto conjunto. O Partner Manager já mantém o registro desse relacionamento de colaboração; quando a possibilidade de negócio se concretiza, o Opportunity Manager cria a Opportunity associada diretamente ao Customer final — nunca ao Partner isoladamente, conforme já exigido no Blueprint —, com o Partner referenciado como colaborador visível em sua Timeline, permitindo que ambas as partes envolvidas na parceria acompanhem o progresso da mesma Opportunity sob a mesma estrutura de Pipeline.

**Importação.** Uma Empresa de médio porte, migrando de uma planilha de controle comercial informal, submete um arquivo com centenas de registros de Cliente já existentes através do Import Manager, mediado pelo Integration Hub. Cada linha do arquivo é processada individualmente, passando pelo mesmo Validation Engine e Deduplication Engine que processariam uma captura manual isolada — nenhum registro entra na plataforma sem essa verificação, mesmo sob volume de importação em lote, prevenindo que a migração introduza, de uma só vez, um grande volume de duplicidade não detectada.

**Deduplicação.** Durante essa mesma importação, o Deduplication Engine identifica que um registro da planilha corresponde, por telefone já cadastrado, a um Lead capturado poucos dias antes através de uma Landing Page. Em vez de criar um segundo registro, o caso é sinalizado para revisão do Administrador responsável pela importação, que confirma a correspondência; o Merge Engine então funde os dois registros, preservando tanto a Timeline do Lead original — sua origem de canal, sua data de primeiro contato — quanto o dado mais completo trazido pela planilha importada, produzindo um único Relationship consolidado e historicamente completo.

**Equipe comercial.** Uma Empresa com dez vendedores ativos opera simultaneamente sobre centenas de Relationships distintos ao longo do dia. Cada Command — criação de Activity, atualização de Opportunity, conclusão de Task — é processado de forma isolada pelo Manager correspondente, dentro da fronteira do Aggregate específico que afeta, sem que a operação concorrente de um vendedor sobre seu próprio conjunto de Relationships jamais bloqueie ou interfira na operação simultânea de outro vendedor sobre um conjunto completamente distinto.

**Mudança de responsável.** Um vendedor deixa a Empresa, e seus Relationships ativos precisam ser redistribuídos entre os demais membros da equipe. Para cada Relationship afetado, um Command `AssignOwner` é processado pelo Ownership Manager, que verifica a unicidade de Ownership já exigida no Blueprint, produz registro auditável através do Audit Manager identificando o responsável anterior e o novo, e o Event Publisher publica `RelationshipChanged` para cada transferência — o novo Account Manager herda acesso imediato à Timeline completa de cada Relationship recebido, sem qualquer perda de contexto histórico da transição.

**Cliente inativo.** O Lifecycle Manager, avaliando periodicamente o tempo decorrido desde a última Activity registrada em cada Relationship, identifica um Customer sem interação há um intervalo configurado — calibrado, conforme já detalhado em `BUSINESS_PROFILE_ENGINE.md`, de acordo com o ciclo de recompra típico do Segmento daquela Empresa. O Lifecycle Manager transiciona o Lifecycle Stage desse Relationship para "em risco" e o Event Publisher publica `RelationshipChanged`, consumido pelo Automation Engine para disparar automaticamente um Workflow de reengajamento, já exemplificado em `AUTOMATION_ENGINE.md`, Capítulo 19 — o CRM Hub identifica e sinaliza o risco; a ação de reengajamento em si é executada por outro domínio, respeitando integralmente a fronteira de responsabilidade já estabelecida neste documento.

---

## 19. Roadmap

No curto prazo, a prioridade é o CRM Manager, o Lead Manager, o Customer Manager, o Relationship Manager e o Timeline Manager operando de ponta a ponta para os Commands e Queries essenciais já descritos nos Capítulos 10 e 11, com o Event Publisher garantindo publicação consistente desde a primeira operação em produção.

No médio prazo, a prioridade é o Opportunity Manager, o Pipeline Manager e o Stage Manager plenamente funcionais, o Deduplication Engine e o Merge Engine cobrindo o fluxo completo de qualidade de dado, e a integração completa com o AI Hub para assistência de Qualificação e de priorização de Opportunity.

No longo prazo, a prioridade é o refinamento contínuo do Search Manager e do CRM Analytics com base em padrão observado entre milhões de Relationships ativos, a maturidade plena do Import Manager para suportar migração de qualquer sistema de CRM externo através do Integration Hub, e a evolução do Lifecycle Manager para antecipar risco de relacionamento antes que se torne evidente através de sinal reativo de inatividade.

```
                    ROADMAP DO CRM HUB
   ┌───────────────────────────────────────────────────────────┐
   │  Curto prazo                                                  │
   │    CRM Manager · Lead Manager · Customer Manager ·               │
   │    Relationship Manager · Timeline Manager · Event Publisher       │
   │    → Commands e Queries essenciais operando de ponta a ponta          │
   │                                                                │
   │  Médio prazo                                                     │
   │    Opportunity Manager · Pipeline Manager · Stage Manager ·         │
   │    Deduplication Engine · Merge Engine · integração com AI Hub         │
   │    → qualidade de dado e assistência inteligente plenamente             │
   │      funcionais                                                          │
   │                                                                │
   │  Longo prazo                                                       │
   │    Search Manager e CRM Analytics refinados por padrão de uso real ·      │
   │    Import Manager maduro para qualquer sistema externo ·                     │
   │    Lifecycle Manager preditivo                                                  │
   │    → operação madura em escala de milhões de Relationships                        │
   └───────────────────────────────────────────────────────────┘
```

Cada fase deste roadmap depende estritamente da anterior, pelo mesmo motivo estrutural já estabelecido em `SYSTEM_BLUEPRINT.md`, Capítulo 16, para o roadmap arquitetural geral da plataforma: o Deduplication Engine e o Merge Engine do médio prazo não têm sobre o que operar de forma confiável sem que o Lead Manager e o Customer Manager do curto prazo já estejam maduros e produzindo dado consistente; e o Lifecycle Manager preditivo do longo prazo depende de volume histórico real, acumulado ao longo do tempo, que só existe depois que as fases anteriores já estão em operação estável.

---

## 20. Architecture Decision Records

**ADR-001 — O CRM Hub é o único proprietário técnico dos relacionamentos definidos em CRM_DOMAIN_BLUEPRINT.md.** Nenhum componente interno duplica Entidade já pertencente a outro Hub. Contexto: aplicação direta do princípio Domain Ownership já estabelecido em `BUSINESS_HUB_ARCHITECTURE.md`, ADR-001, e reafirmado no Blueprint deste domínio, ADR-001.

**ADR-002 — Timeline é imutável por construção, garantida exclusivamente pelo Timeline Manager.** Nenhum outro componente interno possui capacidade técnica de editar ou remover um Timeline Event. Contexto: aplicação arquitetural direta da Regra de negócio já fixada no Blueprint, ADR-006.

**ADR-003 — O CRM Hub nunca envia mensagem; toda comunicação é delegada ao Communication Hub.** O Notification Publisher aciona o Notification Engine do Automation Engine, nunca implementa envio próprio. Contexto: preservar o Bounded Context já delimitado no Blueprint, Capítulo 4, e reafirmado no Blueprint, ADR-002.

**ADR-004 — Todo Command bem-sucedido publica o Evento correspondente através do Event Publisher, sem exceção.** Nenhum Command conclui sua execução sem que o Evento já catalogado no Blueprint seja publicado. Contexto: aplicação do princípio Events First já descrito no Capítulo 4.

**ADR-005 — Customer 360 é uma visão composta, resolvida contra Read Model, nunca uma Entidade armazenada isoladamente.** Contexto: aplicação do princípio Read Model Optimization; uma Entidade Customer 360 armazenada diretamente duplicaria dado já mantido por outros componentes, violando Single Relationship Source.

**ADR-006 — Toda Command é idempotente, identificado por operação única.** A reexecução acidental de um Comando nunca produz efeito colateral duplicado. Contexto: aplicação do princípio Idempotent Commands; sem essa garantia, uma falha de rede seguida de retry poderia criar Lead ou Opportunity duplicados silenciosamente.

**ADR-007 — Deduplicação nunca funde registros automaticamente sem confirmação explícita.** O Deduplication Engine apenas sinaliza; o Merge Engine executa somente mediante confirmação. Contexto: aplicação do princípio Merge as an Explicit Operation e da Regra de negócio já fixada no Blueprint, Capítulo 12.

**ADR-008 — Archive é sempre Soft Delete; nenhum registro do CRM Hub é fisicamente removido por operação padrão.** Contexto: preservar a Timeline consultável mesmo após encerramento de um Relationship, aplicação do princípio Soft Delete over Hard Delete.

**ADR-009 — Toda transferência de Ownership é auditável, nunca uma atualização silenciosa de campo.** O Ownership Manager sempre invoca o Audit Manager. Contexto: eliminar ambiguidade de responsabilidade histórica sobre um Relationship.

**ADR-010 — Busca é resolvida por um índice dedicado mantido pelo Search Manager, nunca por consulta direta ao armazenamento transacional primário.** Contexto: aplicação do princípio Search as a Dedicated Capability, preservando desempenho de escrita mesmo sob volume elevado de consulta de busca simultânea.

**ADR-011 — Importação em lote submete cada registro ao mesmo Validation Engine e Deduplication Engine da captura individual.** Nenhum caminho de exceção contorna essas verificações por volume ou por urgência de migração. Contexto: preservar qualidade de dado consistente independentemente da origem do registro.

**ADR-012 — Consultas nunca modificam estado; Comandos nunca retornam leitura construída simultaneamente.** A separação entre Command e Query é absoluta. Contexto: aplicação do princípio Command-Query Separation; misturar as duas responsabilidades historicamente produz efeito colateral inesperado difícil de rastrear.

**ADR-013 — Todo relatório ou notificação gerado em nome de uma Empresa aplica identidade de marca através do Branding Hub, nunca de forma neutra ou genérica.** O Reporting Adapter e o Notification Publisher, ambos descritos no Capítulo 7, consomem exclusivamente o Theme e o Tom de voz já resolvidos por aquele Hub. Contexto: aplicação direta do princípio Single Source of Truth já estabelecido em `BRANDING_HUB.md`, Capítulo 5; um relatório de CRM que ignorasse a identidade de marca da Empresa comprometeria a consistência de experiência já exigida em toda a plataforma.

**ADR-014 — Falha de disponibilidade em um Platform Service ou componente de Adaptive Intelligence consumido nunca impede a operação essencial do CRM Hub, apenas degrada a capacidade específica que ele sustenta.** Contexto: aplicação do princípio Graceful Degradation já estabelecido em `AI_HUB.md` e em `INTEGRATION_HUB.md`; um Usuário deve sempre poder qualificar um Lead ou mover uma Opportunity manualmente, mesmo que a sugestão assistida do AI Hub esteja temporariamente indisponível.

---

## 21. Glossário

**CRM Hub** — implementação técnica do domínio de relacionamento já definido em `CRM_DOMAIN_BLUEPRINT.md`.

**Command** — operação que muda estado dentro do CRM Hub, sempre idempotente.

**Query** — operação de leitura, resolvida contra Read Model, nunca contra estado modificável diretamente.

**Read Model** — representação de dado otimizada para consulta, mantida atualizada a partir de Evento já publicado.

**Event Publisher** — componente técnico responsável por publicar todo Evento de domínio no Event Bus.

**Deduplication Engine** — componente que identifica correspondência provável entre registros, sem fundi-los automaticamente.

**Merge Engine** — componente que executa fusão explícita de registros já confirmados como duplicados.

**Timeline Manager** — componente que garante, arquiteturalmente, a imutabilidade da Timeline de um Relationship.

**Ownership Manager** — componente que administra atribuição e transferência auditável de Account Manager responsável.

**Customer 360** — visão consolidada e composta de um Relationship, resolvida contra Read Model dedicado.

**Anti-Corruption Layer** — camada de tradução, já detalhada em `BUSINESS_HUB_ARCHITECTURE.md`, aplicada aqui a todo Evento consumido de outro Business Hub.

**Idempotent Command** — Comando cuja execução repetida, com o mesmo identificador de operação, nunca produz efeito colateral duplicado.

**Soft Delete** — operação de Archive que preserva integralmente o registro e sua Timeline, sem remoção física.

**Aggregate** — agrupamento de Entidades e Value Objects tratado como unidade única de consistência, já definido em `BUSINESS_HUB_ARCHITECTURE.md` e aplicado neste documento a cada Manager de Entidade descrito no Capítulo 7.

**Bounded Context** — fronteira dentro da qual o Domain Model do CRM Hub é internamente consistente, já definido em `BUSINESS_HUB_ARCHITECTURE.md` e delimitado especificamente para este domínio em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 4.

**Domain Ownership** — princípio segundo o qual toda Entidade de relacionamento pertence exclusivamente ao CRM Hub, sem duplicação por nenhum outro Business Hub.

---

## 22. Conclusão

O CRM Hub é o proprietário oficial, técnico e operacional, do relacionamento entre a organização e todas as entidades externas com as quais ela mantém vínculo comercial ou institucional — Lead, Customer, Organization, Contact, Supplier, Partner —, exatamente como já definido em `CRM_DOMAIN_BLUEPRINT.md`. Este documento descreveu como esse domínio é servido: pelo conjunto de componentes internos do Capítulo 7, pelos Commands e Queries dos Capítulos 10 e 11, pelos Eventos publicados através do Event Publisher, e pelas garantias de segurança, observabilidade e escala descritas nos capítulos seguintes.

O CRM Hub trabalha em conjunto com todo Platform Service, todo componente de Adaptive Intelligence, e todo outro Business Hub, respeitando rigorosamente os limites já definidos em `BUSINESS_HUB_ARCHITECTURE.md` e em `CRM_DOMAIN_BLUEPRINT.md` — nenhuma responsabilidade de outro domínio é assumida internamente, e nenhuma responsabilidade própria deste domínio é delegada externamente. É essa disciplina, aplicada com o mesmo rigor já demonstrado em cada um dos onze documentos anteriores desta série, que permite ao CRM Hub evoluir de forma independente, operar em escala, e permanecer, ao longo de muitos anos, a fonte única e confiável de todo relacionamento que a Adaptive Business Platform gerencia em nome de cada Empresa que a utiliza.

Este documento, junto com `CRM_DOMAIN_BLUEPRINT.md`, estabelece o padrão de par que todo futuro Business Hub da plataforma deve seguir: um Blueprint que define o domínio — suas Entidades, seus Eventos, suas Regras de negócio, seu Bounded Context —, e um documento de arquitetura que define como esse domínio é servido tecnicamente — seus componentes, seus Commands e Queries, suas integrações, suas garantias operacionais. Um Finance Hub, um Growth Hub, um Communication Hub, ou qualquer novo Business Hub antecipado no roadmap de `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 19, deve produzir exatamente esse mesmo par de documentos, na mesma ordem, com a mesma disciplina de cross-reference e de propriedade única de conceito já demonstrada em todo este documento.
