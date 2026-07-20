# CRM Domain Blueprint

**Adaptive Business Platform · Documento Técnico Oficial**

---

## 1. Introdução

Este documento define o domínio do CRM dentro da Adaptive Business Platform, aplicando integralmente os princípios já estabelecidos em `BUSINESS_HUB_ARCHITECTURE.md` — Bounded Context, Domain Ownership, comunicação exclusiva por Evento — ao domínio específico de relacionamento. Ele não é uma implementação nem uma especificação técnica: é o contrato arquitetural que um futuro `CRM_HUB.md`, e qualquer código construído a partir dele, deve obedecer integralmente, sem exceção.

CRM significa Customer Relationship Management, mas o nome, tomado ao pé da letra, sub-representa o que este domínio realmente cobre. CRM não é um cadastro de clientes — é o domínio responsável por gerenciar relacionamento entre a Empresa e toda entidade externa com a qual ela mantém vínculo comercial ou institucional relevante, o que inclui não apenas Cliente, mas Lead, Organização, Fornecedor e Parceiro, cada um com sua própria natureza de relacionamento, detalhada no Capítulo 7. Tratar CRM como "apenas cadastro" é o mesmo erro que trataria o Branding Hub como "apenas troca de logo", já rejeitado em `BRANDING_HUB.md`, Capítulo 3 — uma redução que ignora a profundidade real do domínio.

Este Hub é desenhado para ser adaptável a qualquer segmento de negócio, consumindo o Business Profile Engine já detalhado em `BUSINESS_PROFILE_ENGINE.md` para calibrar vocabulário, prioridade de Estágio e Segmentação de forma diferente para uma Clínica e para uma Loja de Moda, sem que o Domain Model descrito neste documento precise de nenhuma variação estrutural entre um segmento e outro — a adaptação acontece inteiramente na camada de configuração já estabelecida em `SAAS_ARCHITECTURE.md`, nunca na modelagem do domínio em si.

Uma Clínica, por exemplo, pode configurar seu Pipeline com Estágios como "Triagem", "Consulta agendada" e "Tratamento em curso", enquanto uma Loja de Moda configura o mesmo mecanismo de Pipeline com Estágios como "Primeiro contato", "Prova agendada" e "Venda fechada" — ambos consumindo exatamente o mesmo Aggregate Opportunity e o mesmo conceito de Stage já descrito no Capítulo 7, apenas com rótulo e critério de progressão diferentes, resolvidos por Configuration, nunca por uma implementação separada de Pipeline para cada segmento. É essa mesma disciplina — vocabulário adaptável sobre uma estrutura de domínio única — que sustenta a promessa central de Adaptive Experience já registrada em `PLATFORM_MANIFESTO.md`, aplicada aqui especificamente ao relacionamento comercial.

---

## 2. Missão

A missão do CRM é gerenciar relacionamentos entre a organização e todas as entidades externas com as quais ela mantém vínculo comercial ou institucional — Lead, Cliente, Organização parceira, Fornecedor —, preservando o histórico completo de cada relacionamento, organizando a progressão de uma Oportunidade comercial, e servindo como fonte única de verdade sobre quem a Empresa conhece e como ela se relaciona com cada um.

---

## 3. Problema que Resolve

Contatos espalhados surgem quando informação de relacionamento vive dispersa entre planilha, caderno de anotações e memória individual de um vendedor, sem nenhum repositório central reconhecido como oficial.

Histórico perdido acontece quando a interação com um Cliente específico nunca é registrada de forma centralizada, de modo que uma nova pessoa assumindo aquele relacionamento não tem como saber o que já foi conversado ou prometido anteriormente.

Múltiplas planilhas produzem o mesmo problema de múltiplas versões já diagnosticado para conhecimento em `KNOWLEDGE_HUB.md`, Capítulo 3, aqui aplicado a relacionamento — cada vendedor mantendo sua própria cópia parcial e divergente de quem são os Clientes ativos.

Relacionamento descentralizado surge quando diferentes áreas da Empresa — vendas, atendimento, financeiro — cada uma mantém sua própria noção parcial de um mesmo Cliente, sem nenhuma visão consolidada.

Falta de visão 360° é a consequência direta do problema anterior: ninguém na Empresa consegue ver, em um único lugar, o histórico completo de um relacionamento — todo Lead, toda Oportunidade, toda Atividade, toda interação.

Duplicidade de clientes acontece quando o mesmo Cliente é cadastrado mais de uma vez, por pessoas diferentes, em momentos diferentes, sem que nenhum mecanismo detecte ou previna essa duplicação.

Perda de oportunidades surge quando uma Oportunidade comercial em andamento não tem acompanhamento sistemático, e esfria ou é esquecida sem que ninguém perceba a tempo de agir.

Ausência de histórico é o problema mais grave de todos: sem uma Timeline central e preservada, a Empresa perde, com o tempo, a própria memória institucional de cada relacionamento — o mesmo risco já descrito para conhecimento em geral em `KNOWLEDGE_HUB.md`, Capítulo 3, aqui aplicado especificamente a relacionamento comercial.

O CRM resolve essas oito categorias de problema centralizando todo relacionamento em um único Domain Model, com Timeline imutável e Ownership explícito, consumido de forma uniforme por toda a plataforma.

---

## 4. Boundaries (Bounded Context)

### Pertence ao CRM

| Conceito | Por que pertence |
|---|---|
| Lead | Relacionamento em estágio inicial, ainda não qualificado como Cliente — o ponto de entrada de todo relacionamento comercial. |
| Customer | Relacionamento já estabelecido e reconhecido pela Empresa, o núcleo do domínio. |
| Organization | Entidade coletiva — uma empresa-cliente, distinta de um Contact individual dentro dela. |
| Contact | Pessoa individual associada a um Customer ou a uma Organization. |
| Supplier | Relacionamento com quem fornece à Empresa, de natureza distinta de Customer, mas ainda um relacionamento externo gerido pelo mesmo domínio. |
| Partner | Relacionamento de colaboração comercial, com potencial de gerar Oportunidade conjunta. |
| Opportunity | Possibilidade de negócio em progressão, associada a um Customer ou Organization. |
| Pipeline | Estrutura que organiza múltiplas Opportunities por natureza ou por processo comercial. |
| Stage | Etapa específica dentro de um Pipeline, pela qual uma Opportunity progride. |
| Activity | Ação realizada como parte de um relacionamento — uma ligação, uma reunião. |
| Task | Trabalho pendente associado a um relacionamento, atribuído a um responsável. |
| Timeline | Registro cronológico e imutável de tudo o que aconteceu em um relacionamento. |
| Relationship | O vínculo em si, a Entidade central que conecta a Empresa a uma parte externa. |
| Consent | O consentimento dado por uma parte externa, na medida em que afeta como a Empresa pode se relacionar com ela — distinto do Consent Manager geral já descrito em `IDENTITY_HUB.md`, que trata de consentimento de dado pessoal de Usuário da plataforma, não de relacionamento comercial externo. |
| Tags | Rótulo livre aplicado a um relacionamento para organização flexível. |
| Custom Fields | Campo adicional configurável por Empresa, sem exigir alteração de Domain Model. |
| Address | Endereço físico associado a um relacionamento. |
| Communication Preference | Preferência de canal e de frequência de contato de uma parte externa. |
| Account Manager | O Ownership de um relacionamento — quem, na Empresa, é responsável por ele. |
| Customer Status | O estado atual de um relacionamento — ativo, inativo, em risco. |
| Lifecycle Stage | O estágio de maturidade de um relacionamento ao longo do tempo. |
| Interaction History | Sinônimo operacional de Timeline, aplicado especificamente a interação registrada. |
| Customer Notes | Anotação qualitativa associada a um relacionamento. |
| Customer Segments | Agrupamento de relacionamento por característica compartilhada. |
| Customer Ownership | O princípio de que todo relacionamento tem um responsável único e claro. |

### NÃO pertence ao CRM

| Conceito | Proprietário correto |
|---|---|
| Invoices | Finance Hub — ciclo de vida financeiro, já antecipado como exemplo de Domain Ownership em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 9. |
| Payments | Finance Hub — conciliação de pagamento. |
| Financial Accounts | Finance Hub — saúde financeira do relacionamento, distinta da natureza comercial gerida pelo CRM. |
| Messages | Communication Hub — conteúdo e histórico de mensagem, também já exemplificado em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 9. |
| Email Delivery | Integration Hub, via Connector de e-mail já descrito em `INTEGRATION_HUB.md`. |
| WhatsApp Delivery | Integration Hub, via Connector WhatsApp Business já descrito em `INTEGRATION_HUB.md`. |
| Campaign Execution | Growth Hub — gestão de campanha, Aggregate Campaign já exemplificado em `BUSINESS_HUB_ARCHITECTURE.md`. |
| Analytics | Analytics Hub — indicador agregado, nunca calculado pelo CRM. |
| Authentication | Identity Hub — autenticação e Permissão, já detalhado em `IDENTITY_HUB.md`. |
| Automation | Automation Engine — orquestração de Workflow, já detalhado em `AUTOMATION_ENGINE.md`. |
| Knowledge | Knowledge Hub — conhecimento não estruturado, já detalhado em `KNOWLEDGE_HUB.md`. |
| External APIs | Integration Hub — única via de comunicação externa, já detalhado em `INTEGRATION_HUB.md`. |
| Branding | Branding Hub — identidade visual e tom, já detalhado em `BRANDING_HUB.md`. |
| Permissions | Identity Hub — RBAC e ABAC, já detalhado em `IDENTITY_HUB.md`. |
| AI Decision | AI Hub — toda inteligência artificial, já detalhado em `AI_HUB.md`. |
| Metrics | Analytics Hub — indicador consolidado, mesmo princípio já estabelecido em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 9. |

---

## 5. Responsabilidades

O CRM é responsável por capturar todo novo Lead, independentemente do canal de origem, e mantê-lo como registro único desde o primeiro contato. É responsável por qualificar um Lead e decidir, com base em Regra de negócio própria, sua conversão em Customer. É responsável por manter o registro central de toda Organization, Contact, Supplier e Partner com os quais a Empresa se relaciona. É responsável por organizar e acompanhar a progressão de toda Opportunity através de um Pipeline configurável. É responsável por registrar toda Activity e todo Task associado a um relacionamento. É responsável por manter a Timeline completa e imutável de cada relacionamento, do primeiro contato até o presente. É responsável por administrar Ownership — quem, na Empresa, é responsável por cada relacionamento — e por refletir mudança de responsável de forma auditável. É responsável por manter Consent relacionado à forma como a Empresa pode se comunicar com uma parte externa, e por manter Segmentação e Tag para organização flexível de sua base de relacionamento.

O CRM não é responsável por enviar a mensagem em si, por processar pagamento, por executar automação, por calcular indicador agregado, ou por qualquer das demais responsabilidades já atribuídas a outro Hub na tabela do Capítulo 4 — sua responsabilidade termina em manter o relacionamento e publicar Evento sobre ele, nunca em executar a ação que outro domínio decide tomar em resposta.

Essa distinção entre "manter o relacionamento" e "agir sobre o relacionamento" é a linha mais importante que este documento traça, e a mais fácil de violar por conveniência de implementação. É tentador, por exemplo, imaginar que o CRM deveria "enviar um e-mail de boas-vindas" quando um Lead é convertido — mas essa ação pertence ao Communication Hub, disparada por um Workflow do Automation Engine que reage ao evento `LeadConverted` já descrito no Capítulo 10. O CRM cumpriu integralmente sua responsabilidade no momento em que publicou esse evento; tudo o que acontece depois é responsabilidade de outro domínio, mesmo que, do ponto de vista de quem usa a plataforma no dia a dia, a sequência inteira pareça uma única funcionalidade coesa de "boas-vindas automáticas". A coesão percebida pelo usuário final é um resultado da colaboração entre Hubs através de Evento — nunca uma justificativa para que um único Hub absorva responsabilidade que pertence a outro.

---

## 6. Capacidades de Negócio

Lead Management cobre captura, qualificação e conversão de Lead. Customer Management cobre o ciclo de vida completo de um Cliente já convertido. Contact Management cobre pessoa individual associada a Customer ou Organization. Relationship Management é a capacidade transversal que sustenta todas as demais — a manutenção do vínculo em si. Supplier Management cobre relacionamento com fornecedor. Partner Management cobre relacionamento de colaboração comercial. Opportunity Management cobre possibilidade de negócio em progressão. Pipeline Management cobre a estrutura de Estágio pela qual uma Opportunity avança. Activity Tracking cobre o registro de ação realizada. Task Management cobre trabalho pendente atribuído a um responsável. Timeline cobre o histórico cronológico e imutável de um relacionamento. Customer Segmentation cobre agrupamento por característica compartilhada. Consent Management cobre consentimento de comunicação de uma parte externa. Customer Lifecycle cobre o estágio de maturidade de um relacionamento ao longo do tempo. Ownership cobre a atribuição e a transferência de responsabilidade sobre um relacionamento. Custom Fields cobre a extensibilidade de campo adicional por Empresa, sem alteração de Domain Model.

```
                    CAPACIDADES DE NEGÓCIO DO CRM
   ┌───────────────────────────────────────────────────────────┐
   │  Aquisição:     Lead Management                                │
   │  Relacionamento: Customer · Contact · Supplier · Partner        │
   │                  Management · Relationship Management            │
   │  Comercial:      Opportunity Management · Pipeline Management      │
   │  Operação:       Activity Tracking · Task Management                │
   │  Memória:        Timeline                                             │
   │  Organização:    Customer Segmentation · Ownership · Custom Fields    │
   │  Consentimento:  Consent Management                                      │
   │  Progressão:     Customer Lifecycle                                        │
   └───────────────────────────────────────────────────────────┘
```

---

## 7. Modelo Conceitual

Lead representa um relacionamento em estágio inicial, capturado através de qualquer canal, ainda não confirmado como Customer. Sua responsabilidade central é acumular sinal suficiente — origem, interesse declarado, comportamento inicial — para que uma decisão de Qualificação seja tomada.

Customer representa um relacionamento já reconhecido e ativo. É a Entidade central do domínio, e todo Opportunity, Activity e Timeline eventualmente se conecta a ela, direta ou indiretamente através de uma Organization.

Organization representa uma entidade coletiva — tipicamente uma empresa-cliente —, distinta de um Customer individual, permitindo que múltiplos Contact se relacionem com a mesma Organization sem que cada um seja tratado como um Customer isolado.

Contact representa uma pessoa individual, associada a um Customer ou a uma Organization, com sua própria informação de contato e preferência.

Supplier representa um relacionamento de fornecimento à Empresa — uma natureza de relacionamento distinta de Customer, mas gerida pelo mesmo domínio porque compartilha a mesma necessidade de Timeline, Activity e Ownership.

Partner representa um relacionamento de colaboração comercial, com potencial de originar Opportunity conjunta, detalhado no Capítulo 9.

Relationship é o conceito estrutural que conecta a Empresa a qualquer uma das partes externas acima — Customer, Organization, Supplier, Partner —, cada Relationship carregando seu próprio Status, Lifecycle Stage e Ownership, independentemente de qual tipo de parte externa ele conecta.

Opportunity representa uma possibilidade de negócio em progressão, sempre associada a um Customer ou a uma Organization, nunca a um Lead ainda não convertido nem a um Supplier ou Partner isolado — quando um Partner origina uma possibilidade de negócio conjunto, essa possibilidade ainda é modelada como Opportunity associada ao Customer final envolvido, com o Partner referenciado como parte colaboradora, não como o titular direto da Opportunity.

Pipeline organiza um conjunto de Stage pelos quais uma Opportunity progride, configurável por Empresa sem exigir alteração de Domain Model.

Stage representa uma etapa específica dentro de um Pipeline, com critério de entrada e de saída que pode ser regra determinística ou, quando aplicável, assistida por recomendação do AI Hub, sempre uma decisão que o CRM aplica, nunca uma inteligência que o CRM implementa internamente, conforme já detalhado no Capítulo 11.

Activity representa uma ação já realizada como parte de um relacionamento — uma ligação feita, uma reunião ocorrida — registrada de forma factual, sempre em passado, nunca como intenção futura.

Task representa trabalho pendente, ainda não realizado, atribuído a um responsável específico — distinto de Activity por sua natureza prospectiva, não retrospectiva.

Timeline Event é a unidade individual que compõe a Timeline de um Relationship — cada Activity concluída, cada mudança de Stage, cada Task criada, produz um Timeline Event, tornando a Timeline a agregação cronológica completa de tudo o que já foi registrado.

Address representa um endereço físico associado a um Relationship, podendo haver mais de um por Relationship quando aplicável.

Consent representa o consentimento de comunicação dado por uma parte externa, versionado conforme já detalhado no Capítulo 12.

Segment representa um agrupamento de Relationship por característica compartilhada, usado tanto para organização quanto como insumo de Segmentação consumido pelo Growth Hub.

Tag representa um rótulo livre, de menor formalidade que Segment, aplicável a qualquer Relationship para organização ad hoc.

Custom Field representa um campo adicional configurado por uma Empresa específica, através da Configuration já descrita em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 7, sem exigir alteração do Domain Model central do CRM.

Communication Preference representa a preferência de canal e de frequência de contato de uma parte externa, consumida pelo Communication Hub no momento de decidir como e quando contatá-la, conforme detalhado no Capítulo 11.

Account Manager representa a atribuição concreta de Ownership sobre um Relationship específico — a pessoa responsável.

Lifecycle Stage representa o estágio de maturidade de um Relationship ao longo do tempo — por exemplo, novo, ativo, em risco, recuperado — distinto do Stage de uma Opportunity, que mede progressão comercial pontual, não maturidade de relacionamento como um todo.

Status representa o estado operacional imediato de um Relationship — ativo, inativo, arquivado.

---

## 8. Relacionamentos

```
                              Relationship
                     (conecta a Empresa a uma parte externa)
                                 │
              ┌──────────┬───────┴───────┬──────────┐
              ▼          ▼               ▼          ▼
          Customer  Organization     Supplier    Partner
              │          │
              │          └──► Contact (um ou mais, associados
              │                à Organization)
              ▼
          Contact (associado diretamente ao Customer,
                    quando não há Organization)

   Todo Relationship possui:
     Status · Lifecycle Stage · Account Manager (Ownership) ·
     Address · Communication Preference · Consent · Tags ·
     Custom Fields · Timeline
```

```
                              Customer/Organization
                                 │
                                 ▼
                              Opportunity
                     (associada a um Customer ou Organization,
                      nunca a um Lead não convertido)
                                 │
                                 ▼
                              Pipeline
                                 │
                                 ▼
                    Stage (etapa atual dentro do Pipeline)
                                 │
                                 ▼
                    Activity / Task (associadas à Opportunity
                    ou diretamente ao Relationship)
                                 │
                                 ▼
                              Timeline
                    (todo Activity, Task e mudança de Stage
                     produz um Timeline Event)
```

```
                                Lead
                                 │
                          (Qualificação — Capítulo 9)
                                 │
                                 ▼
                             Customer
                     (Lead deixa de existir como registro
                      independente; sua história prévia é
                      preservada como Timeline Event herdado
                      pelo novo Relationship)
```

---

## 9. Fluxos

```
Lead
   │  capturado por qualquer canal (Landing Page, Communication Hub)
   ▼
Qualificação
   │  Regra de negócio, ou assistência do AI Hub, avalia se o Lead
   │  atende ao critério mínimo de conversão
   ▼
Customer
   │  Relationship criado, Lead original arquivado com referência
   ▼
Relacionamento
   │  Timeline acumula Activity e Task ao longo do tempo
   ▼
Opportunity
   │  uma possibilidade de negócio específica é aberta dentro
   │  do Relationship já estabelecido
   ▼
Won/Lost
   Opportunity é encerrada, com resultado registrado na Timeline
```

```
Supplier
   │  registrado como Relationship de natureza de fornecimento
   ▼
Relationship
   │  Ownership atribuído, Communication Preference registrada
   ▼
Activity
   Toda interação com o Supplier é registrada como Activity,
   compondo a mesma Timeline que qualquer outro Relationship
```

```
Partner
   │  registrado como Relationship de natureza de colaboração
   ▼
Opportunity
   │  uma possibilidade de negócio conjunta é identificada,
   │  associada ao Customer final, com o Partner referenciado
   ▼
Joint Business
   A Opportunity avança pelo mesmo Pipeline padrão, com o
   Partner visível como parte colaboradora em sua Timeline
```

---

## 10. Eventos do Domínio

`LeadCreated` é publicado no momento em que um novo Lead é registrado, independentemente do canal de origem.

`LeadQualified` é publicado quando um Lead atende ao critério mínimo de conversão, antes da própria conversão em Customer acontecer.

`LeadConverted` é publicado no momento em que um Lead se torna Customer, já introduzido em `SYSTEM_BLUEPRINT.md`, Capítulo 7.

`CustomerCreated` é publicado quando um novo Customer é registrado, seja por conversão de Lead, seja por cadastro direto.

`CustomerUpdated` é publicado sempre que um atributo relevante de um Customer é alterado.

`CustomerArchived` é publicado quando um Relationship é encerrado, preservando sua Timeline de forma consultável mesmo após o arquivamento.

`SupplierRegistered` é publicado quando um novo Supplier é registrado como Relationship.

`PartnerRegistered` é publicado quando um novo Partner é registrado como Relationship.

`OpportunityCreated` é publicado quando uma nova Opportunity é aberta dentro de um Relationship já existente.

`OpportunityWon` é publicado quando uma Opportunity é encerrada com resultado positivo, tipicamente consumido pelo Finance Hub para iniciar faturamento.

`OpportunityLost` é publicado quando uma Opportunity é encerrada sem resultado, preservando o motivo registrado na Timeline.

`TaskAssigned` é publicado quando um Task é atribuído a um responsável.

`TaskCompleted` é publicado quando um Task é concluído.

`ActivityLogged` é publicado quando uma nova Activity é registrada em um Relationship.

`ConsentUpdated` é publicado quando o Consent de comunicação de uma parte externa é alterado, consumido imediatamente pelo Communication Hub para respeitar a nova preferência.

`RelationshipChanged` é publicado quando o Status, o Lifecycle Stage, ou o Account Manager de um Relationship é alterado.

`SegmentUpdated` é publicado quando a Segmentação de um Relationship muda, consumido pelo Growth Hub para ajustar Campanha relevante.

`TimelineUpdated` é publicado a cada novo Timeline Event registrado, permitindo que qualquer consumidor interessado reaja em tempo próximo ao momento real de uma interação.

---

## 11. Integração com outros Hubs

O AI Hub é consumido pelo CRM para gerar sugestão de resposta a um Lead ou Customer, para assistir a decisão de Qualificação, e para sugerir priorização de Opportunity — através do contrato já detalhado em `AI_HUB.md`; o CRM nunca implementa lógica de inteligência própria.

O Automation Engine consome eventos do CRM — `LeadCreated`, `OpportunityWon`, entre outros — para disparar Workflow, já exemplificado em `AUTOMATION_ENGINE.md`, Capítulo 19; o CRM nunca implementa sua própria lógica de automação condicional.

O Knowledge Hub é consultado pelo CRM quando uma resposta a Cliente se beneficia de Procedimento ou FAQ já documentado, através do contrato já detalhado em `KNOWLEDGE_HUB.md`.

O Identity Hub autentica e autoriza toda operação sobre Relationship, Opportunity e demais Entidades do CRM, através do modelo RBAC/ABAC já detalhado em `IDENTITY_HUB.md`.

O Integration Hub é a única via pela qual o CRM captura Lead de canal externo ou notifica sistema externo, através do contrato já detalhado em `INTEGRATION_HUB.md`.

O Communication Hub consome `ConsentUpdated` e `RelationshipChanged` para respeitar preferência de contato, e publica `MessageReceived`, consumido pelo CRM para atualizar Timeline — o CRM nunca envia mensagem diretamente, apenas registra que uma comunicação aconteceu.

O Finance Hub consome `OpportunityWon` para iniciar faturamento, e publica evento de pagamento, consumido pelo CRM para refletir Status de relacionamento — o CRM nunca acessa Invoice diretamente, mantendo apenas referência mínima através de Anti-Corruption Layer já descrita em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 10.

O Growth Hub consome `SegmentUpdated` e `LeadCreated` para calibrar Campanha, e publica evento de Campanha, consumido pelo CRM para atribuir origem a um novo Lead.

O Analytics Hub consome todo evento publicado pelo CRM para calcular indicador consolidado — o CRM nunca calcula, ele mesmo, um indicador agregado sobre sua própria base de relacionamento além do que é inerente à sua operação transacional direta.

---

## 12. Regras de Negócio

Todo Customer possui um Relationship — nenhum Customer existe sem o vínculo estrutural que o conecta à Empresa, mesmo antes de qualquer Opportunity ser aberta.

Lead pode ou não virar Customer — a Qualificação é uma decisão, nunca uma garantia automática de progressão.

Opportunity pertence a um Customer ou Organization — nunca a um Lead ainda não convertido, nem diretamente a um Supplier ou Partner isolado, conforme já detalhado no Capítulo 7.

Timeline nunca é apagada — mesmo quando um Relationship é arquivado, sua Timeline permanece consultável integralmente, aplicação do mesmo princípio de History já estabelecido em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 7.

Consentimento é versionado — toda mudança de Consent produz uma nova versão preservável, nunca uma sobrescrita silenciosa, mesmo princípio de versionamento já estabelecido em toda a plataforma.

Supplier não é Customer automaticamente — as duas naturezas de Relationship são distintas, e uma parte externa que é simultaneamente Fornecedor e Cliente da Empresa é modelada como dois Relationship distintos, cada um com sua própria Timeline, conectados apenas por referência a uma mesma Organization ou Contact subjacente quando aplicável.

Partner pode gerar Opportunities — mas sempre associadas ao Customer final, nunca ao Partner como titular direto, conforme já detalhado no Capítulo 7.

Customer Ownership é único — um Relationship tem exatamente um Account Manager responsável em um dado momento, nunca responsabilidade compartilhada e ambígua entre múltiplas pessoas simultaneamente, ainda que a transferência de Ownership seja permitida e registrada como Timeline Event.

Nenhuma Opportunity muda de Stage sem que essa mudança produza um Timeline Event correspondente — progressão comercial sem rastro auditável nunca é aceita como estado válido do domínio.

Todo Lead capturado por canal externo é registrado antes de qualquer tentativa de deduplicação — a verificação de duplicidade acontece como etapa de Validation subsequente à captura, nunca como pré-condição que poderia descartar silenciosamente um Lead legítimo por falso positivo.

Um Contact pode estar associado a apenas um Customer ou a apenas uma Organization por vez, nunca a ambos simultaneamente de forma ambígua — quando uma mesma pessoa atua em nome de uma Organization e, separadamente, mantém relacionamento pessoal como Customer individual, essas são modeladas como duas associações de Contact distintas, cada uma clara sobre em qual capacidade aquela pessoa está sendo referenciada em um contexto específico.

Toda Activity e todo Task devem estar associados a exatamente um Relationship — nenhuma Activity solta, sem vínculo a um Lead, Customer, Organization, Supplier ou Partner específico, é aceita como estado válido, porque uma Activity sem Relationship associado não tem como compor nenhuma Timeline coerente.

A Qualificação de um Lead é sempre uma decisão explícita e registrada, nunca uma inferência silenciosa — mesmo quando o AI Hub sugere que um Lead está pronto para conversão, essa sugestão é apresentada como recomendação, e a mudança de estado de Lead para Customer só acontece mediante confirmação, explícita ou por regra automática já configurada e conhecida pela Empresa, nunca por decisão unilateral e opaca de um sistema de inteligência.

---

## 13. Casos de Uso

**Novo Lead.** Um visitante preenche um formulário em uma Landing Page. O Integration Hub recebe a submissão, o CRM cria o Lead e publica `LeadCreated`. O Business Profile Engine já informou o Segmento da Empresa, calibrando qual informação adicional é solicitada no formulário.

**Conversão.** O Lead demonstra sinal suficiente de interesse — reconhecido por Regra própria ou por sugestão do AI Hub. O CRM publica `LeadQualified`, e em seguida, mediante confirmação, `LeadConverted`, criando o Customer e o Relationship correspondente.

**Cliente recorrente.** Um Customer já existente inicia uma nova Opportunity. O CRM cria a Opportunity associada ao Relationship já existente, sem exigir nova captura de Lead, preservando toda a Timeline anterior como contexto imediatamente disponível.

**Fornecedor.** Uma Empresa registra um novo Supplier. O CRM cria o Relationship de natureza de fornecimento, distinto de Customer, com sua própria Timeline dedicada a interação de fornecimento.

**Parceiro.** Uma Empresa registra um Partner e, através dele, identifica uma Opportunity conjunta com um Customer final já existente. O CRM associa a Opportunity ao Customer, referenciando o Partner como colaborador visível na Timeline daquela Opportunity específica.

**Pipeline comercial.** Um Gerente configura um Pipeline com Estágios customizados para seu processo comercial específico. O CRM aplica esse Pipeline a toda nova Opportunity criada a partir desse momento, sem exigir nenhuma alteração de Domain Model.

**Segmentação.** O CRM aplica Segment a um conjunto de Relationship com base em critério compartilhado, publicando `SegmentUpdated`, consumido pelo Growth Hub para calibrar uma Campanha direcionada.

**Equipe comercial.** Um Administrador atribui múltiplos Account Manager a diferentes Relationship dentro do mesmo Workspace, cada atribuição respeitando o princípio de Ownership único por Relationship individual.

**Mudança de responsável.** Um Relationship muda de Account Manager. O CRM publica `RelationshipChanged`, registra a mudança como Timeline Event, e o novo responsável herda acesso à Timeline completa, sem perda de contexto histórico.

**Histórico completo.** Um Usuário consulta a Timeline de um Customer específico, vendo, em ordem cronológica, todo Lead original, toda Opportunity, todo Activity, todo Task e toda mudança de Stage já ocorrida — a visão 360° que resolve diretamente o problema já descrito no Capítulo 3.

**Duplicidade detectada.** Um segundo formulário é submetido pela mesma pessoa, através de um canal diferente do primeiro contato. O CRM registra o novo Lead normalmente, conforme já estabelecido no Capítulo 12, e a etapa de Validation subsequente identifica a duplicidade provável com base em correspondência de Contact — e-mail ou telefone já associado a um Relationship existente — sinalizando o caso para revisão humana em vez de mesclar automaticamente os dois registros sem confirmação, preservando a Timeline de ambos até que a fusão seja explicitamente confirmada.

---

## 14. Decisões Arquiteturais

**ADR-001 — O CRM é o único proprietário de Lead, Customer, Organization, Contact, Supplier, Partner, Opportunity e Relationship.** Nenhum outro Hub cria ou altera essas Entidades diretamente. Contexto: aplicação direta do princípio Domain Ownership já estabelecido em `BUSINESS_HUB_ARCHITECTURE.md`, ADR-001.

**ADR-002 — O CRM nunca envia mensagem diretamente.** Toda comunicação com Lead ou Customer é executada pelo Communication Hub; o CRM apenas registra que a comunicação aconteceu, através de evento consumido. Contexto: preservar o Bounded Context já delimitado no Capítulo 4.

**ADR-003 — O CRM nunca processa pagamento.** Toda transação financeira pertence ao Finance Hub; o CRM consome `PaymentReceived` apenas para refletir Status de relacionamento. Contexto: mesma fronteira já estabelecida na tabela do Capítulo 4.

**ADR-004 — O CRM publica evento para toda mudança de estado relevante, nunca chama outro Hub diretamente.** Contexto: aplicação do princípio Events over Direct Calls já estabelecido em `BUSINESS_HUB_ARCHITECTURE.md`, ADR-002.

**ADR-005 — O CRM nunca executa automação própria.** Toda lógica condicional de reação a um evento do CRM pertence ao Automation Engine. Contexto: preservar a fronteira já estabelecida na tabela do Capítulo 4 e em `AUTOMATION_ENGINE.md`, Capítulo 4.

**ADR-006 — Timeline é imutável.** Nenhum Timeline Event já registrado é editado ou removido, mesmo quando o Relationship associado é arquivado. Contexto: sem essa garantia, a Empresa perderia a própria memória institucional de relacionamento, o problema central descrito no Capítulo 3.

**ADR-007 — Opportunity pertence exclusivamente a Customer ou Organization, nunca a Lead ou a Partner isolado.** Contexto: aplicação da regra de negócio já detalhada no Capítulo 12; evita ambiguidade sobre a quem uma possibilidade de negócio efetivamente se refere.

**ADR-008 — Supplier e Customer são naturezas de Relationship distintas, nunca fundidas em uma única Entidade genérica de "parte externa".** Contexto: preservar clareza de Regra de negócio específica a cada natureza, mesmo quando a mesma Organização subjacente ocupa os dois papéis simultaneamente.

**ADR-009 — Consent é versionado, nunca sobrescrito.** Toda mudança de consentimento produz uma nova versão preservável. Contexto: sustentar auditoria de conformidade e o direito de qualquer parte externa de comprovar, retroativamente, qual era seu consentimento em um momento específico.

**ADR-010 — Ownership de um Relationship é sempre único em um dado momento.** Nenhum Relationship tem dois Account Manager simultaneamente responsáveis. Contexto: prevenir ambiguidade de responsabilidade que historicamente causa relacionamento negligenciado por nenhuma das partes assumir claramente a tarefa.

**ADR-011 — Custom Fields são resolvidos por Configuration, nunca por alteração do Domain Model central.** Contexto: aplicação do princípio Configuration over Code já estabelecido em `SAAS_ARCHITECTURE.md`; permite que cada Empresa estenda seu próprio CRM sem exigir mudança de código compartilhado por toda a plataforma.

**ADR-012 — Deduplicação de Lead acontece como etapa de Validation após a captura, nunca como filtro anterior a ela.** Contexto: aplicação da regra de negócio já detalhada no Capítulo 12; prevenir que uma verificação excessivamente agressiva descarte um Lead legítimo por falso positivo de duplicidade.

---

## 15. Glossário

**Lead** — relacionamento em estágio inicial, ainda não qualificado como Customer.

**Customer** — relacionamento já reconhecido e ativo, a Entidade central do domínio.

**Organization** — entidade coletiva, distinta de um Contact individual associado a ela.

**Relationship** — o vínculo estrutural que conecta a Empresa a uma parte externa, de qualquer natureza.

**Opportunity** — possibilidade de negócio em progressão, associada a um Customer ou Organization.

**Pipeline** — estrutura de Stage configurável pela qual uma Opportunity progride.

**Timeline** — registro cronológico e imutável de tudo o que já aconteceu em um Relationship.

**Ownership** — princípio de responsabilidade única e explícita sobre um Relationship, atribuída a um Account Manager.

**Consent** — consentimento de comunicação dado por uma parte externa, versionado ao longo do tempo.

**Lifecycle Stage** — estágio de maturidade de um Relationship ao longo do tempo, distinto do Stage de uma Opportunity.

**Qualificação** — decisão que determina se um Lead atende ao critério mínimo para se tornar Customer.

**Segment** — agrupamento de Relationship por característica compartilhada.

**Custom Field** — campo adicional configurado por uma Empresa específica, sem alteração de Domain Model.

---

## 16. Conclusão

Este documento define oficialmente o domínio do CRM dentro da Adaptive Business Platform — sua fronteira, suas Entidades, seus Eventos e suas Regras de negócio, aplicando integralmente os princípios já estabelecidos em `BUSINESS_HUB_ARCHITECTURE.md`. O futuro `CRM_HUB.md`, e qualquer implementação técnica derivada dele, deve respeitar integralmente este Blueprint — nenhuma Entidade aqui não descrita pode ser introduzida sem revisão deste documento, e nenhuma responsabilidade aqui atribuída a outro Hub pode ser assumida pelo CRM sem violar o Bounded Context estabelecido no Capítulo 4.

Junto com os onze documentos oficiais já existentes, este Blueprint é o primeiro de uma série de contratos de domínio específico esperados para cada Business Hub da plataforma, começando pelo relacionamento — o domínio mais próximo do cliente final que a Adaptive Business Platform existe para servir.
