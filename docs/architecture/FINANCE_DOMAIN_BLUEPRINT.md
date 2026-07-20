# Finance Domain Blueprint

**Adaptive Business Platform · Documento Técnico Oficial**

---

## 1. Introdução

Este documento define o domínio Finance dentro da Adaptive Business Platform, aplicando integralmente os princípios já estabelecidos em `BUSINESS_HUB_ARCHITECTURE.md` — Bounded Context, Domain Ownership, comunicação exclusiva por Evento — ao domínio específico de valor econômico. Ele não é uma implementação nem uma especificação técnica: é o contrato arquitetural que um futuro `FINANCE_HUB.md`, e qualquer código construído a partir dele, deve obedecer integralmente, seguindo o mesmo padrão de par Blueprint/Hub já estabelecido por `CRM_DOMAIN_BLUEPRINT.md`/`CRM_HUB.md` e por `COMMUNICATION_DOMAIN_BLUEPRINT.md`/`COMMUNICATION_HUB.md`.

Finance representa toda a movimentação de valor econômico da plataforma — o que é cobrado, o que é pago, o que é devolvido, e o registro contábil imutável que resulta de cada uma dessas movimentações. Esta é a terceira vez que este documento precisa estabelecer, com precisão, uma fronteira entre domínios que frequentemente se confundem na prática: CRM continua sendo o proprietário exclusivo do relacionamento, conforme já definido em `CRM_DOMAIN_BLUEPRINT.md`; Communication continua sendo o proprietário exclusivo da comunicação, conforme já definido em `COMMUNICATION_DOMAIN_BLUEPRINT.md`; e Finance é o proprietário exclusivo do estado financeiro — o que uma Empresa deve, o que já recebeu, o que já pagou, e o histórico contábil que sustenta cada uma dessas afirmações. Um Relationship é sobre quem a Empresa conhece; uma Conversation é sobre o que foi dito; um Invoice é sobre quanto é devido, e um Ledger Entry é sobre o que efetivamente aconteceu financeiramente e não pode mais ser alterado. Os três domínios colaboram intensamente — o Finance Hub consome `OpportunityWon` do CRM Hub e publica evento consumido de volta por ele, conforme já antecipado em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 11 —, mas nunca se confundem.

---

## 2. Missão

A missão do domínio Finance é gerenciar todo o ciclo de vida financeiro da plataforma de forma consistente, auditável, rastreável e desacoplada — garantindo que toda cobrança emitida, todo pagamento processado, todo estorno concedido e todo ajuste aplicado produza um registro contábil imutável, reconstruível a qualquer momento, e que nenhum outro domínio da plataforma precise implementar sua própria lógica de cobrança, de conciliação ou de controle de saldo.

---

## 3. Problema que Resolve

Múltiplas fontes de verdade financeira surgem quando o valor devido por um Cliente, o valor já pago, e o saldo resultante são calculados de forma independente por mais de um sistema ou por mais de uma planilha, sem que nenhum seja reconhecido como definitivo — o mesmo risco de fragmentação já diagnosticado para relacionamento em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 3, e para comunicação em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 3, aqui aplicado ao dado mais sensível de todos: o dinheiro.

Pagamentos inconsistentes acontecem quando o status de uma cobrança — paga, pendente, vencida — diverge entre o que o Provider de pagamento efetivamente processou e o que a Empresa acredita ter recebido, por ausência de rastreamento central e confiável.

Ausência de auditoria surge quando não existe registro imutável de cada movimentação financeira, tornando impossível reconstruir, com certeza, por que um saldo específico chegou a um valor específico em um momento específico do passado.

Dificuldade de conciliação acontece quando comparar o que a plataforma registra como recebido contra o que efetivamente entrou na conta bancária da Empresa exige trabalho manual extenso, sem um processo formal e rastreável que sustente essa comparação.

Mistura entre relacionamento e finanças é um risco estrutural específico deste domínio: sem uma fronteira clara, um Cliente e uma Conta financeira tendem a ser tratados como a mesma Entidade, produzindo exatamente o tipo de acoplamento entre domínios que `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 3, já identificou como fonte de regra inconsistente e de dificuldade de evolução independente.

Acoplamento com gateways surge quando a lógica de cobrança de uma Empresa depende diretamente da implementação técnica de um Provider de pagamento específico, tornando qualquer troca de gateway um projeto de engenharia de alto risco, em vez de uma mudança de configuração.

Ausência de histórico financeiro confiável é a consequência acumulada de todos os problemas anteriores: sem um Ledger central e imutável, a Empresa não tem como responder, com certeza, a perguntas básicas sobre sua própria saúde financeira histórica.

O domínio Finance resolve essas sete categorias de risco centralizando todo estado financeiro em um único Domain Model, com Ledger como fonte de verdade imutável e Balance como derivação sempre recalculável a partir dele, consumido de forma uniforme por toda a plataforma.

---

## 4. Boundaries (Bounded Context)

### Pertence ao Finance

| Conceito | Por que pertence |
|---|---|
| Invoice | Cobrança formal emitida a um Cliente, o ponto de partida da maioria dos fluxos financeiros. |
| Invoice Item | Linha individual dentro de uma Invoice, detalhando o que está sendo cobrado. |
| Payment | Registro de pagamento associado a uma Invoice. |
| Payment Attempt | Tentativa individual de processar um Payment, distinta do Payment em si porque uma mesma cobrança pode exigir múltiplas tentativas. |
| Refund | Devolução de valor já pago, sempre referenciando o Payment original. |
| Credit | Valor a favor de um Cliente, aplicável a cobrança futura. |
| Debit | Valor devido por um Cliente, refletido no Ledger. |
| Wallet | Saldo de valor mantido em nome de um Cliente ou da própria Empresa, disponível para uso futuro. |
| Balance | Saldo consolidado e sempre derivado do Ledger, nunca armazenado como fonte primária independente. |
| Ledger Entry | Unidade atômica e imutável de registro contábil — a fonte de verdade de todo o domínio. |
| Transaction | Agrupamento lógico de um ou mais Ledger Entry relacionados a uma mesma operação financeira. |
| Financial Account | Conta financeira interna que agrupa Ledger Entry e Balance de uma Empresa ou de um Cliente. |
| Account Receivable | Valor a receber, ainda pendente de pagamento. |
| Account Payable | Valor a pagar, ainda pendente de quitação pela Empresa. |
| Subscription | Acordo de cobrança recorrente com um Cliente. |
| Recurring Billing | O motor que gera novas Invoice a partir de uma Subscription ativa. |
| Installment Plan | Estrutura de parcelamento de uma cobrança em múltiplas Invoice ou Payment programados. |
| Payment Method | Meio de pagamento registrado — cartão, boleto, transferência — associado a um Cliente. |
| Payment Intent | Registro de intenção de pagamento, anterior à confirmação de que o Payment foi efetivamente concluído. |
| Settlement | O processo de liquidação financeira entre a plataforma e o Provider de pagamento. |
| Reconciliation | O processo de comparação entre o registro interno do Finance e o extrato externo de um Provider ou de uma conta bancária. |
| Charge | O ato técnico de cobrança processado contra um Payment Method específico. |
| Fee | Taxa aplicada a uma transação, cobrada pela plataforma ou repassada de um Provider externo. |
| Discount | Redução aplicada a uma Invoice antes de seu valor final. |
| Financial Adjustment | Correção manual aplicada ao estado financeiro, sempre registrada como novo Ledger Entry. |
| Financial Document | Representação formal de uma Invoice, um Recibo ou um Comprovante, gerada para consumo humano. |
| Tax Record (conceitual) | Registro de tributo aplicável a uma transação, mantido em nível conceitual neste domínio, sem assumir jurisdição fiscal específica. |
| Currency | A moeda em que uma transação é registrada. |
| Exchange Rate (conceitual) | A taxa de conversão entre moedas, quando aplicável, mantida em nível conceitual. |

### NÃO pertence ao Finance

| Conceito | Proprietário correto |
|---|---|
| Customer | CRM Hub — relacionamento, já detalhado em `CRM_DOMAIN_BLUEPRINT.md`. |
| Lead | CRM Hub — relacionamento em estágio inicial. |
| Opportunity | CRM Hub — possibilidade de negócio em progressão. |
| Conversation | Communication Hub — comunicação, já detalhado em `COMMUNICATION_DOMAIN_BLUEPRINT.md`. |
| Message | Communication Hub — unidade individual de comunicação. |
| Campaign | Growth Hub — estratégia de aquisição, já exemplificado em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 9. |
| Automation | Automation Engine — orquestração de Workflow, já detalhado em `AUTOMATION_ENGINE.md`. |
| Identity | Identity Hub — autenticação e Permissão, já detalhado em `IDENTITY_HUB.md`. |
| Knowledge | Knowledge Hub — conhecimento não estruturado, já detalhado em `KNOWLEDGE_HUB.md`. |
| AI Decisions | AI Hub — toda inteligência artificial, já detalhado em `AI_HUB.md`; o Finance nunca decide, apenas executa. |
| Branding | Branding Hub — identidade visual e tom, já detalhado em `BRANDING_HUB.md`. |
| Analytics | Analytics Hub — indicador agregado, nunca calculado pelo Finance além do que é inerente à sua operação transacional. |
| Provider APIs | Integration Hub — única via de comunicação externa, já detalhado em `INTEGRATION_HUB.md`; o Finance nunca implementa integração direta com gateway de pagamento. |
| Webhook | Integration Hub — recepção e tradução de notificação externa. |
| Integration Connectors | Integration Hub — implementação técnica de comunicação com Provider. |
| Communication Preference | CRM Hub e Communication Hub — preferência de canal e de contato, já definida em ambos os documentos; o Finance apenas invoca envio de Notification financeira, nunca decide preferência. |

---

## 5. Responsabilidades

O Finance é responsável pela emissão de cobranças, criando Invoice e seus Invoice Item correspondentes, sempre que uma Opportunity é encerrada como Won no CRM Hub ou quando uma Subscription ativa dispara Recurring Billing. É responsável pelo controle de pagamentos, registrando Payment e cada Payment Attempt associada, do momento de Payment Intent até confirmação ou falha. É responsável pelo histórico financeiro completo de uma Empresa e de cada Cliente, sustentado pelo Ledger. É responsável pelo razão financeiro — o Ledger em si —, a fonte de verdade imutável sobre a qual todo o restante do domínio é construído. É responsável por Subscription e por Recurring Billing, gerando novas cobranças de forma automática conforme o ciclo contratado. É responsável pela conciliação entre registro interno e extrato externo. É responsável por Balance, sempre derivado do Ledger, nunca armazenado como valor independente e potencialmente divergente. É responsável por Credit e Debit aplicados a um Cliente, por Financial Adjustment quando uma correção manual é necessária, e por Refund quando um pagamento já processado precisa ser devolvido.

O limite entre Finance e os demais domínios é mais fácil de compreender através de exemplo direto. Quando uma Opportunity é encerrada como Won, o CRM Hub publica `OpportunityWon` — mas o CRM Hub nunca cria a Invoice correspondente; essa responsabilidade pertence inteiramente ao Finance, que consome o Evento e decide, dentro de seu próprio domínio, como e quando emitir a cobrança. Quando um Cliente precisa ser notificado de uma fatura vencida, o Finance nunca envia a mensagem diretamente — ele publica um Evento, consumido pelo Automation Engine, que aciona o Communication Hub para o envio real, exatamente como já demonstrado para o CRM Hub em `CRM_HUB.md`, Capítulo 5, e para o Communication Hub em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 5. E quando um pagamento é processado, o Finance nunca fala diretamente com o gateway — a chamada técnica pertence inteiramente ao Integration Hub, conforme detalhado no Capítulo 11.

Essa disciplina de fronteira é particularmente crítica no domínio Finance porque a tentação de atalho aqui carrega um risco maior que em qualquer outro domínio já documentado: um acoplamento indevido entre Finance e CRM poderia parecer inofensivo em um primeiro momento — afinal, "é só ler o Customer para saber quem cobrar" —, mas produziria, com o tempo, exatamente o tipo de dependência circular já identificado como risco central em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 3: uma mudança no Domain Model do CRM Hub passaria a exigir revisão coordenada do Finance, e vice-versa, eliminando a evolução independente que ambos os Blueprints já demonstrados nesta série existem para garantir. O Finance nunca lê Customer diretamente — ele mantém sua própria Financial Account, referenciando o Relationship por identificador, exatamente como o Communication Hub mantém seu próprio Participant, conforme já detalhado em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 7.

---

## 6. Business Capabilities

Invoice Management cobre a criação, atualização e cancelamento de Invoice e seus Invoice Item. Billing cobre a orquestração geral de emissão de cobrança, incluindo a decisão de quando uma nova Invoice deve ser gerada. Payment Management cobre o registro de Payment e de cada Payment Attempt. Refund Management cobre a devolução de valor já pago. Subscription Management cobre o acordo de cobrança recorrente com um Cliente. Recurring Billing cobre a geração automática de novas Invoice a partir de uma Subscription ativa. Ledger Management cobre a criação e a consulta do razão financeiro imutável. Balance Management cobre o cálculo e a disponibilização de saldo sempre derivado do Ledger. Wallet Management cobre o saldo de valor disponível mantido em nome de um Cliente ou da Empresa. Receivables cobre o acompanhamento de valor a receber ainda pendente. Payables cobre o acompanhamento de valor a pagar pela Empresa. Settlement cobre o processo de liquidação com o Provider de pagamento. Reconciliation cobre a comparação entre registro interno e extrato externo. Discount Management cobre a aplicação de redução a uma Invoice. Fee Management cobre o registro de taxa aplicada a uma transação. Financial Adjustment cobre a correção manual de estado financeiro. Tax Registration cobre o registro conceitual de tributo aplicável a uma transação. Financial History cobre a consulta consolidada de todo o histórico financeiro de uma Empresa ou de um Cliente. Financial Reporting Source cobre a disponibilização de dado financeiro estruturado para consumo por relatório. Currency Management cobre o registro de moeda e, quando aplicável, de taxa de câmbio.

```
                CAPACIDADES DE NEGÓCIO DO DOMÍNIO FINANCE
   ┌───────────────────────────────────────────────────────────┐
   │  Cobrança:       Invoice Management · Billing · Discount        │
   │                  Management · Fee Management                       │
   │  Pagamento:      Payment Management · Refund Management               │
   │  Recorrência:    Subscription Management · Recurring Billing            │
   │  Contabilidade:  Ledger Management · Balance Management ·                  │
   │                  Financial Adjustment                                       │
   │  Carteira:       Wallet Management                                             │
   │  Fluxo:          Receivables · Payables                                          │
   │  Liquidação:     Settlement · Reconciliation                                       │
   │  Suporte:        Tax Registration · Currency Management ·                            │
   │                  Financial History · Financial Reporting Source                         │
   └───────────────────────────────────────────────────────────┘
```

---

## 7. Modelo Conceitual

Invoice representa a cobrança formal emitida a um Cliente, agrupando um ou mais Invoice Item, com valor total, prazo de vencimento e Status próprio.

Invoice Item representa uma linha individual dentro de uma Invoice, detalhando o que está sendo cobrado e seu valor específico.

Payment representa o registro de um pagamento associado a uma Invoice, mantido separado de cada Payment Attempt individual.

Transaction representa o agrupamento lógico de um ou mais Ledger Entry relacionados a uma mesma operação financeira — um único Payment bem-sucedido, por exemplo, produz uma Transaction que agrupa o débito e o crédito correspondentes no Ledger.

Ledger Entry representa a unidade atômica e imutável de registro contábil — nunca alterado ou removido após sua criação, a fonte de verdade única sobre a qual Balance é sempre recalculado.

Wallet representa o saldo de valor mantido em nome de um Cliente ou da própria Empresa, disponível para uso futuro, distinto de Balance por representar um saldo utilizável, não apenas informativo.

Balance representa o saldo consolidado de uma Financial Account, sempre derivado do conjunto de Ledger Entry associado a ela, nunca armazenado como valor independente que poderia divergir de seu Ledger de origem.

Refund representa a devolução de valor já pago, sempre referenciando o Payment original e produzindo novos Ledger Entry, nunca alterando os Ledger Entry já existentes do Payment original.

Subscription representa o acordo de cobrança recorrente com um Cliente, definindo periodicidade, valor e vigência.

Recurring Billing representa o mecanismo que gera novas Invoice a partir de uma Subscription ativa, respeitando sua periodicidade configurada.

Payment Intent representa o registro de intenção de pagamento, criado antes de qualquer confirmação — o estado inicial de todo fluxo de Payment, nunca confundido com pagamento efetivamente concluído.

Payment Method representa o meio de pagamento registrado por um Cliente — cartão, boleto, transferência —, consultado no momento de processar um novo Charge.

Charge representa o ato técnico de cobrança processado contra um Payment Method específico, mediado pelo Integration Hub.

Settlement representa o processo de liquidação financeira entre a plataforma e o Provider de pagamento, tipicamente consolidando múltiplos Payment em um único repasse.

Reconciliation representa o processo de comparação entre o registro interno do Finance e o extrato externo correspondente, identificando divergência quando existente.

Receivable representa valor a receber ainda pendente, associado a uma Invoice não paga.

Payable representa valor a pagar pela própria Empresa, distinto de Receivable por representar obrigação da Empresa perante terceiro.

Financial Adjustment representa uma correção manual aplicada ao estado financeiro, sempre materializada como novo Ledger Entry, nunca como alteração retroativa de um Ledger Entry já existente.

Discount representa uma redução aplicada a uma Invoice antes de seu valor final ser calculado.

Fee representa uma taxa aplicada a uma transação, cobrada pela plataforma ou repassada de um Provider externo.

Currency representa a moeda em que uma transação é registrada.

Exchange Rate representa a taxa de conversão entre moedas, mantida em nível conceitual, sem assumir integração com nenhum provedor específico de câmbio.

Financial Document representa a materialização formal de uma Invoice, um Recibo ou um Comprovante, gerada para consumo humano, com identidade de marca aplicada através do Branding Hub.

Tax Record representa o registro conceitual de tributo aplicável a uma transação, mantido em nível de domínio sem assumir jurisdição fiscal específica — a implementação técnica de conformidade tributária de uma jurisdição específica é uma decisão de camada de implementação, fora do escopo deste Blueprint.

---

## 8. Relacionamentos

```
Invoice ──► Payment ──► Ledger ──► Balance
   │
   └──► Invoice Item (um ou mais)
```

```
Subscription ──► Recurring Billing ──► Invoice ──► Payment
```

```
Refund ──► Ledger ──► Balance
   (referencia o Payment original, nunca o altera)
```

```
Receivable ──► Payment ──► Settlement
```

```
Wallet ──► Transaction ──► Ledger Entry
   (toda movimentação de Wallet produz Ledger Entry correspondente,
    nunca altera o Ledger diretamente sem esse registro)
```

```
                    VISÃO GERAL DE RELACIONAMENTOS
   ┌───────────────────────────────────────────────────────────┐
   │  Payment Intent ──► Payment Attempt ──► Charge                │
   │        │                                    │                  │
   │        ▼                                    ▼                  │
   │     Payment ◄───────────────────────── (confirmação)             │
   │        │                                                       │
   │        ├──► Ledger Entry ──► Transaction ──► Balance               │
   │        │                                                       │
   │        └──► Settlement ──► Reconciliation                          │
   │                                                                │
   │  Financial Account agrupa Ledger Entry e Balance de              │
   │  uma Empresa ou de um Cliente                                     │
   └───────────────────────────────────────────────────────────┘
```

Nenhuma seta neste conjunto de diagramas representa alteração retroativa — Balance é sempre recalculado a partir do Ledger, nunca o inverso, e Refund, Settlement e Reconciliation sempre produzem novo registro, nunca modificam o que já existe.

---

## 9. Fluxos

```
Invoice
   │  emitida, associada a um ou mais Invoice Item
   ▼
Payment
   │  Payment Intent criado, Charge processado via Integration Hub
   ▼
Settlement
   │  liquidação consolidada junto ao Provider
   ▼
Ledger
   │  Ledger Entry criado, agrupado em Transaction
   ▼
Balance
   Balance da Financial Account recalculado a partir do Ledger
```

```
Subscription
   │  acordo de recorrência ativo
   ▼
Recurring Billing
   │  periodicidade configurada aciona geração automática
   ▼
Invoice
   │  nova cobrança criada
   ▼
Payment
   │  processado conforme Payment Method já registrado
   ▼
Settlement
   liquidação consolidada, fechando o ciclo daquela cobrança
```

```
Refund
   │  solicitado sobre um Payment já confirmado
   ▼
Ledger
   │  novo Ledger Entry registrado, referenciando o Payment original
   ▼
Balance
   Balance da Financial Account recalculado, refletindo a devolução
```

```
Receivable
   │  valor pendente identificado a partir de Invoice não paga
   ▼
Payment
   │  eventualmente processado
   ▼
Reconciliation
   comparação entre registro interno e extrato externo confirma
   a baixa do Receivable
```

---

## 10. Eventos do Domínio

`InvoiceCreated` é publicado quando uma nova Invoice é emitida, seja por conversão de Opportunity Won, seja por Recurring Billing.

`InvoiceUpdated` é publicado quando um atributo relevante de uma Invoice já existente é alterado, antes de seu pagamento.

`InvoicePaid` é publicado quando o Payment associado a uma Invoice é confirmado.

`InvoiceCancelled` é publicado quando uma Invoice é cancelada antes de seu pagamento, preservando integralmente seu histórico.

`PaymentAuthorized` é publicado quando um Payment Attempt recebe autorização do Provider, antes da captura efetiva do valor.

`PaymentCaptured` é publicado quando o valor autorizado é efetivamente capturado, confirmando o Payment.

`PaymentFailed` é publicado quando um Payment Attempt falha, seja por recusa do Provider, seja por esgotamento de tentativa.

`RefundIssued` é publicado quando um Refund é processado sobre um Payment já confirmado.

`SubscriptionCreated` é publicado quando um novo acordo de recorrência é estabelecido com um Cliente.

`SubscriptionRenewed` é publicado quando uma Subscription já ativa é renovada para um novo ciclo.

`RecurringBillingExecuted` é publicado quando o mecanismo de Recurring Billing gera uma nova Invoice a partir de uma Subscription ativa.

`SettlementCompleted` é publicado quando um processo de liquidação junto ao Provider é concluído.

`ReconciliationCompleted` é publicado quando um processo de comparação entre registro interno e extrato externo é concluído, com ou sem divergência identificada.

`LedgerEntryCreated` é publicado a cada novo registro contábil, o Evento de granularidade mais fina de todo o domínio.

`WalletUpdated` é publicado quando o saldo de uma Wallet é alterado, sempre em consequência de uma Transaction já registrada no Ledger.

`BalanceUpdated` é publicado quando o Balance de uma Financial Account é recalculado.

`DiscountApplied` é publicado quando uma redução é aplicada a uma Invoice.

`FinancialAdjustmentApplied` é publicado quando uma correção manual é registrada como novo Ledger Entry.

`CurrencyUpdated` é publicado quando a moeda de referência de uma transação, ou a taxa de câmbio conceitual aplicável, é registrada ou alterada.

---

## 11. Integração com outros Hubs

O CRM Hub publica `OpportunityWon`, consumido pelo Finance para iniciar a emissão de Invoice, conforme já antecipado em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 11; e consome o evento de pagamento confirmado publicado pelo Finance, através de uma Anti-Corruption Layer dedicada, para atualizar Status de Relacionamento, sem nunca acessar a Entidade Invoice diretamente.

O Communication Hub é invocado pelo Finance, através de uma Action do Automation Engine, para envio de Notification de cobrança ou de confirmação de pagamento — o Finance nunca envia mensagem diretamente, conforme já estabelecido como limite em ambos os Blueprints anteriores.

O Automation Engine consome eventos do Finance — `InvoiceCreated`, `PaymentFailed` — para disparar Workflow, e decide quando processos financeiros recorrentes ou condicionais devem ser executados, conforme já estabelecido em `AUTOMATION_ENGINE.md`; o Finance nunca implementa sua própria lógica de automação condicional.

O AI Hub pode ser consumido pelo Finance para identificar anomalia em padrão de transação, através do contrato já detalhado em `AI_HUB.md` — o AI Hub apoia a decisão, sugerindo o que merece atenção, mas nunca altera diretamente nenhum estado financeiro; toda mudança de estado permanece exclusivamente sob controle do Finance.

O Knowledge Hub pode ser consultado, através do AI Hub, quando uma Política financeira documentada é relevante para uma decisão de negócio, seguindo o padrão de Retrieval já detalhado em `KNOWLEDGE_HUB.md`.

O Identity Hub autentica e autoriza toda operação sobre Invoice, Payment e demais Entidades financeiras, através do modelo já detalhado em `IDENTITY_HUB.md` — o Perfil Financeiro, já descrito em `SAAS_ARCHITECTURE.md`, Capítulo 11, tem acesso operacional amplo, distinto de outros Perfis com acesso apenas de leitura a indicador consolidado.

O Integration Hub é a única via pela qual todo Charge alcança um Provider de pagamento, e pela qual toda notificação de Settlement ou de confirmação externa chega ao Finance, através do modelo já detalhado em `INTEGRATION_HUB.md` — o Finance nunca implementa Connector próprio para nenhum gateway.

O Growth Hub publica `CampaignPublished`, consumido pelo Finance para registrar o custo de mídia associado, quando aplicável, sem que o Finance acesse a Entidade Campaign diretamente.

O Analytics Hub consome todo Evento publicado pelo Finance para calcular indicador consolidado de receita, custo e margem, nunca calculado pelo próprio Finance além do que é inerente à sua operação transacional direta.

---

## 12. Regras de Negócio

Toda Payment pertence a uma Invoice — nenhum Payment existe de forma isolada, mesmo quando processado através de Wallet, caso em que referencia a Invoice quitada por aquele saldo.

Ledger é imutável — nenhum Ledger Entry, uma vez criado, é alterado ou removido.

Balance é derivado do Ledger — nunca armazenado como valor primário independente, sempre recalculável a partir do conjunto de Ledger Entry associado.

Refund cria novas transações — nunca reverte ou apaga o Ledger Entry do Payment original, preservando o registro histórico completo de que o pagamento aconteceu e foi, posteriormente, devolvido.

Settlement nunca altera Ledger existente — todo processo de liquidação produz seu próprio registro, referenciando os Payment e Ledger Entry já existentes, nunca modificando-os.

Subscription gera cobranças — mas nunca processa pagamento diretamente; toda cobrança gerada por Subscription segue o mesmo fluxo de Invoice e Payment já aplicável a qualquer outra cobrança.

Recurring Billing gera novas Invoices — nunca reutiliza ou modifica uma Invoice já emitida em ciclo anterior.

Payment Intent não representa pagamento concluído — apenas Payment Captured, confirmado através do Evento correspondente, representa conclusão efetiva.

Reconciliation nunca modifica transações — identifica divergência e a registra, mas a correção de uma divergência identificada exige um Financial Adjustment explícito e separado.

Invoice cancelada preserva histórico — o cancelamento transiciona Status, nunca remove o registro nem apaga Invoice Item já associados.

Wallet nunca altera Ledger diretamente — toda movimentação de Wallet produz Transaction e Ledger Entry correspondentes antes de refletir no saldo de Wallet, nunca o inverso.

Toda movimentação financeira gera evento — nenhuma mudança de estado relevante no domínio Finance acontece sem a publicação do Evento correspondente já catalogado no Capítulo 10.

---

## 13. Casos de Uso

**Venda única.** Uma Opportunity é encerrada como Won no CRM Hub, publicando `OpportunityWon`. O Finance consome esse Evento e cria uma Invoice correspondente, com seus Invoice Item detalhando o produto ou serviço vendido, publicando `InvoiceCreated`.

**Assinatura.** Um Cliente contrata um plano recorrente. Uma Subscription é criada, publicando `SubscriptionCreated`, estabelecendo periodicidade e valor.

**Cobrança recorrente.** A Subscription ativa aciona Recurring Billing conforme sua periodicidade configurada, gerando uma nova Invoice a cada ciclo e publicando `RecurringBillingExecuted` seguido de `InvoiceCreated`.

**Parcelamento.** Uma venda de maior valor é estruturada como Installment Plan, gerando múltiplas Invoice programadas ao longo do tempo, cada uma seguindo o fluxo padrão de Payment já descrito no Capítulo 9.

**Pagamento recusado.** Um Payment Attempt é processado através do Integration Hub e recusado pelo Provider; `PaymentFailed` é publicado, consumido pelo Automation Engine para disparar uma Notification de cobrança através do Communication Hub.

**Estorno.** Um Cliente solicita devolução de um Payment já confirmado. Um Refund é processado, produzindo novo Ledger Entry que reflete a devolução, sem alterar o Ledger Entry original do Payment, e `RefundIssued` é publicado.

**Conta a receber.** Uma Invoice emitida permanece sem Payment associado além do prazo de vencimento, sendo refletida como Account Receivable pendente, consultável através da Capacidade Receivables já descrita no Capítulo 6.

**Conta a pagar.** A Empresa registra uma obrigação própria como Account Payable, acompanhada até sua quitação, seguindo estrutura equivalente à de Receivable, mas na direção oposta do fluxo de valor.

**Carteira financeira.** Um Cliente mantém saldo em Wallet, resultante de um Credit aplicado anteriormente; ao gerar uma nova Invoice, o valor da Wallet é consumido através de uma Transaction que produz Ledger Entry correspondente, quitando total ou parcialmente a cobrança.

**Conciliação bancária.** Ao final de um período, um processo de Reconciliation compara os Payment já confirmados internamente com o extrato do Provider externo mediado pelo Integration Hub, identificando qualquer divergência e publicando `ReconciliationCompleted`.

**Desconto financeiro.** Uma Invoice recebe um Discount antes de seu valor final ser calculado, publicando `DiscountApplied`, e o valor final já refletido considera essa redução desde a emissão.

**Ajuste financeiro.** Um Administrador identifica a necessidade de uma correção manual — por exemplo, uma cobrança indevida já identificada por Reconciliation — e aplica um Financial Adjustment, registrado como novo Ledger Entry, publicando `FinancialAdjustmentApplied`, nunca alterando retroativamente o registro já existente que motivou a correção.

---

## 14. Architecture Decision Records

**ADR-001 — Finance é proprietário do estado financeiro.** Nenhum outro Hub cria, altera ou possui Invoice, Payment, Ledger Entry ou qualquer Entidade já catalogada no Capítulo 4. Contexto: aplicação direta do princípio Domain Ownership já estabelecido em `BUSINESS_HUB_ARCHITECTURE.md`, ADR-001.

**ADR-002 — Ledger é imutável.** Nenhum Ledger Entry é alterado ou removido após sua criação. Contexto: sem essa garantia, nenhuma auditoria financeira seria confiável, porque o próprio registro histórico poderia ter sido modificado depois do fato.

**ADR-003 — Balance é derivado, nunca uma fonte primária de dado.** Todo Balance é recalculável a partir do Ledger a qualquer momento. Contexto: prevenir divergência entre saldo exibido e histórico real que o sustenta.

**ADR-004 — Integration é proprietário dos gateways.** Nenhum Charge é processado por uma chamada direta do Finance a um Provider de pagamento. Contexto: mesma regra já estabelecida em `INTEGRATION_HUB.md`, ADR-001, e já reafirmada em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, ADR-005.

**ADR-005 — CRM nunca registra pagamentos.** Toda operação de Payment pertence exclusivamente ao Finance; o CRM Hub apenas consome Evento de pagamento confirmado. Contexto: preservar o Bounded Context já delimitado no Capítulo 4, mesma disciplina já aplicada em `CRM_HUB.md`, ADR-003.

**ADR-006 — Communication nunca confirma pagamentos.** O Communication Hub apenas envia Notification de cobrança ou de confirmação, nunca decide ou registra o estado financeiro em si. Contexto: preservar a fronteira já estabelecida em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 4.

**ADR-007 — Automation decide quando processos financeiros recorrentes são executados, mas nunca os executa diretamente.** O Automation Engine dispara a solicitação através de Evento; o Finance processa. Contexto: aplicação da fronteira entre execução e decisão já estabelecida em `AUTOMATION_ENGINE.md`, Capítulo 4.

**ADR-008 — Refund cria novas transações, nunca reverte o registro original.** Contexto: aplicação da Regra já fixada no Capítulo 12; preservar histórico completo de que o pagamento original de fato ocorreu.

**ADR-009 — Subscriptions publicam eventos para toda transição relevante de seu ciclo de vida.** Criação, renovação e execução de Recurring Billing são sempre observáveis externamente. Contexto: permitir que outros Hubs, em particular o Automation Engine, reajam a mudanças de recorrência sem consultar ativamente o estado do Finance.

**ADR-010 — Settlement preserva histórico, nunca sobrescreve Ledger já existente.** Contexto: aplicação da Regra já fixada no Capítulo 12; a liquidação é um processo complementar ao Ledger, nunca uma substituição dele.

**ADR-011 — AI Hub apoia decisão financeira, mas nunca altera estado financeiro diretamente.** Toda sugestão do AI Hub, como identificação de anomalia, exige confirmação humana ou regra determinística explícita antes de qualquer mudança de estado. Contexto: aplicação do princípio Human Oversight já estabelecido em `AI_HUB.md`, Capítulo 5, com peso adicional dado à sensibilidade de dado financeiro.

**ADR-012 — Toda movimentação financeira relevante produz Ledger Entry antes de qualquer outra representação de estado ser considerada válida.** Wallet, Balance e Receivable são sempre consequência de Ledger Entry já registrado, nunca precedem ou substituem esse registro. Contexto: garantir que o Ledger permaneça, em toda circunstância, a única fonte de verdade do domínio.

---

## 15. Glossário

**Ledger** — razão financeiro imutável, a fonte de verdade única de todo o domínio Finance.

**Ledger Entry** — unidade atômica e imutável de registro contábil.

**Balance** — saldo consolidado, sempre derivado do Ledger, nunca armazenado como valor primário independente.

**Invoice** — cobrança formal emitida a um Cliente.

**Payment Intent** — registro de intenção de pagamento, anterior à confirmação de conclusão.

**Settlement** — processo de liquidação financeira entre a plataforma e o Provider de pagamento.

**Reconciliation** — processo de comparação entre registro interno e extrato externo.

**Subscription** — acordo de cobrança recorrente com um Cliente.

**Recurring Billing** — mecanismo que gera novas Invoice a partir de uma Subscription ativa.

**Wallet** — saldo de valor disponível mantido em nome de um Cliente ou da Empresa.

**Financial Adjustment** — correção manual de estado financeiro, sempre registrada como novo Ledger Entry.

**Receivable** — valor a receber ainda pendente.

**Payable** — valor a pagar pela própria Empresa.

**Charge** — ato técnico de cobrança processado contra um Payment Method.

---

## 16. Conclusão

Este documento define oficialmente o domínio Finance dentro da Adaptive Business Platform — sua fronteira, suas Entidades, seus Eventos e suas Regras de negócio, aplicando integralmente os princípios já estabelecidos em `BUSINESS_HUB_ARCHITECTURE.md`. O futuro `FINANCE_HUB.md`, e qualquer implementação técnica derivada dele, deve respeitar integralmente este Blueprint.

Finance é proprietário do estado financeiro. CRM é proprietário do relacionamento. Communication é proprietário da comunicação. Integration é proprietário da integração com gateways de pagamento. Automation decide quando executar processos financeiros. AI apoia decisões, mas nunca altera estados financeiros diretamente. Nenhuma dessas seis fronteiras admite exceção por conveniência de implementação.

Este documento estabelece o terceiro domínio operacional da plataforma relacionado ao fluxo de valor da Empresa — depois de relacionamento e comunicação, o domínio que registra, de forma imutável e auditável, o que efetivamente aconteceu financeiramente como resultado deles — e mantém a mesma metodologia arquitetural já demonstrada nos Blueprints de CRM e de Communication.
