# ADR Index

**Adaptive Business Platform · Documento Técnico Oficial**

---

## 1. Introdução

Este documento é o índice oficial, único e definitivo de todas as Architecture Decision Records — ADRs — já registradas pela Adaptive Business Platform em seus trinta e dois documentos proprietários. Ele não cria nenhuma decisão arquitetural nova, não altera o texto de nenhum ADR já existente, e não substitui nenhum documento proprietário — cada ADR aqui listado permanece integralmente definido, com seu contexto completo e sua justificativa detalhada, exclusivamente em seu documento de origem. O que este documento adiciona é a capacidade de localizar, classificar e auditar qualquer decisão arquitetural já tomada pela plataforma sem precisar percorrer, um a um, todos os documentos já publicados nesta série.

Architecture Decision Record é o formato através do qual esta plataforma registra, de forma permanente, uma decisão de arquitetura relevante — não apenas o que foi decidido, mas por que, e qual alternativa foi descartada e por qual razão. Este formato já foi aplicado de forma consistente em cada um dos trinta e dois documentos proprietários desta série, sempre com a mesma estrutura: um identificador numerado, um título que resume a decisão, e um contexto que explica sua motivação.

A importância da rastreabilidade de decisão arquitetural cresce proporcionalmente ao número de documentos e de módulos já existentes — com trezentas e cinquenta e sete decisões já registradas ao longo de trinta e dois documentos (incorporados os oito documentos da série ERP Foundation por DOC-001), nenhum Engenheiro ou Arquiteto consegue mais reter de memória onde cada decisão específica foi tomada, nem se uma decisão semelhante já existe em outro lugar da plataforma antes de propor uma nova.

Governança arquitetural é o propósito central deste documento — ele existe para que toda evolução futura da Adaptive Business Platform seja informada pelo histórico completo de decisão já tomada, nunca repetindo uma discussão já resolvida, nunca introduzindo uma decisão que contradiga silenciosamente outra já registrada em documento distinto.

Evolução controlada é a garantia que este índice sustenta — porque toda decisão já tomada está localizável e classificada, qualquer proposta de mudança futura pode ser avaliada contra o conjunto completo de decisões já em vigor, preservando a coerência arquitetural que esta série de documentos construiu de forma incremental, um domínio de cada vez, desde `PLATFORM_MANIFESTO.md` até `EVENT_INTERACTION_MATRIX.md`.

A necessidade de um índice consolidado como este segue exatamente o mesmo raciocínio que já justificou cada um dos cinco documentos de GOVERNANCE anteriores — `DOMAIN_OWNERSHIP_MATRIX.md` resolveu a pergunta "quem é dono de cada conceito"; `EVENT_CATALOG.md`, `COMMAND_CATALOG.md` e `QUERY_CATALOG.md` resolveram a pergunta "qual é o contrato de cada Evento, Command e Query"; `EVENT_INTERACTION_MATRIX.md` resolveu a pergunta "como os módulos se comunicam entre si". Este documento resolve uma pergunta distinta e final: "por que a plataforma é construída da forma como é, e onde essa razão foi originalmente registrada". Nenhum dos cinco documentos anteriores foi desenhado para responder a essa pergunta específica — cada um organiza sua informação em torno de seu próprio objeto de consolidação, nunca em torno do histórico de decisão que a justifica.

Um segundo aspecto que distingue este índice de qualquer documento anterior desta série é sua natureza estritamente derivada — ele não introduz nenhuma informação que não exista já, em forma mais completa, em algum dos trinta e dois documentos proprietários. Isso o torna, ao mesmo tempo, o documento mais simples de manter consistente — nenhuma nova decisão é tomada aqui, apenas referenciada — e o mais dependente de disciplina de atualização contínua, porque sua utilidade inteira depende de refletir, com fidelidade, o estado real de decisão já registrado em cada documento de origem.

---

## 2. Objetivos

Este índice garante centralização — toda decisão arquitetural já tomada pela plataforma é localizável a partir de um único documento, independentemente de em qual dos trinta e dois documentos proprietários ela foi originalmente registrada.

Este índice garante rastreabilidade — a relação entre uma decisão e as decisões anteriores que a motivaram, já mencionadas em cada ADR através de referência cruzada, é consolidada aqui em uma visão de dependência completa.

Este índice garante consistência — ao expor todas as decisões lado a lado, ele torna imediatamente visível qualquer contradição potencial entre documentos, permitindo que ela seja resolvida antes de se tornar um problema de implementação real.

Este índice facilita auditoria — um Auditor de conformidade arquitetural consulta este documento como ponto de entrada único, em vez de precisar localizar manualmente a seção de ADR de cada um dos trinta e dois documentos.

Este índice garante reutilização — antes de propor uma nova decisão arquitetural, um Arquiteto consulta este índice para verificar se uma decisão equivalente já existe em outro domínio, evitando duplicação de raciocínio já resolvido.

Este índice garante governança — nenhuma nova decisão arquitetural relevante é considerada plenamente integrada à plataforma antes de estar refletida neste índice, com seu identificador, seu documento proprietário e sua classificação explícitos.

Este índice funciona como documentação viva — atualizado a cada novo ADR registrado em qualquer documento proprietário, nunca congelado no estado em que foi originalmente publicado.

Estes sete objetivos, tomados em conjunto, definem o critério pelo qual qualquer proposta de mudança a este índice deve ser avaliada — uma reorganização que melhora a centralização, mas compromete a rastreabilidade de uma relação já estabelecida entre dois ADRs, não é uma mudança aceitável; toda evolução deste documento precisa preservar os sete objetivos simultaneamente, mesmo princípio de coerência já aplicado em cada um dos cinco documentos de GOVERNANCE anteriores desta série.

---

## 3. Princípios

**ADRs são permanentes.** Nenhum ADR já registrado é apagado do documento proprietário, mesmo quando substituído por uma decisão posterior.

**Toda decisão possui contexto.** Nenhum ADR é registrado sem a explicação de por que essa decisão específica foi tomada.

**Toda decisão possui justificativa.** O contexto de todo ADR explicita a motivação de negócio ou técnica que a sustenta, nunca apenas a decisão em si sem fundamentação.

**Não existem ADRs duplicados.** Nenhuma decisão arquitetural é registrada mais de uma vez em documentos distintos sem referência cruzada explícita entre elas.

**ADRs podem ser substituídos.** Uma decisão anterior pode ser superada por uma decisão posterior, desde que essa substituição seja explicitamente registrada, nunca silenciosa.

**Histórico nunca é perdido.** Mesmo um ADR substituído permanece legível em seu documento de origem, preservando o raciocínio histórico completo da plataforma.

**Cross-reference obrigatório.** Todo ADR que se relaciona com uma decisão já registrada em outro documento cita esse documento explicitamente.

**Decisões são rastreáveis.** Toda decisão pode ser rastreada até seu documento de origem, seu Domínio e sua motivação original.

**Governança antes da implementação.** Nenhuma decisão de arquitetura relevante é implementada antes de ser registrada formalmente como ADR.

**Business First.** Toda decisão arquitetural é justificada, em última instância, por uma necessidade de negócio, nunca apenas por preferência técnica isolada.

**Architecture Before Code.** A decisão arquitetural precede sua implementação técnica, nunca o inverso, mesmo princípio já estabelecido em `BUSINESS_HUB_ARCHITECTURE.md`, ADR-010.

**Explicit Decisions.** Nenhuma decisão arquitetural relevante permanece implícita ou inferida por convenção de implementação.

**Immutable History.** O registro histórico de uma decisão, uma vez publicado, não é reescrito — apenas complementado por decisão posterior que a supere.

**Review Before Replace.** Nenhum ADR é substituído sem revisão explícita que documente por que a decisão anterior deixou de ser adequada.

**Single Source of Truth.** Cada decisão arquitetural existe em exatamente um documento proprietário, nunca duplicada em dois lugares com o mesmo identificador.

**Consistency First.** Nenhuma nova decisão é aceita se contradizer, sem justificativa explícita de substituição, uma decisão já registrada em outro documento.

**Documentation Driven.** Toda evolução arquitetural relevante desta plataforma é conduzida através de documentação formal, nunca apenas através de discussão informal não registrada.

**Domain Ownership.** Toda decisão arquitetural respeita a fronteira de domínio já estabelecida em `DOMAIN_OWNERSHIP_MATRIX.md`, nunca a contradizendo.

**Version Awareness.** Toda decisão registrada é consciente do estado da plataforma no momento em que foi tomada, permitindo interpretação correta mesmo por um leitor futuro.

**Enterprise Governance.** O conjunto completo de ADRs desta plataforma constitui sua governança arquitetural formal, não um registro informal de preferência de implementação.

---

## 4. Catálogo Oficial de ADRs

Esta seção organiza todo ADR já registrado pela Adaptive Business Platform, agrupado por documento proprietário, na mesma estrutura de categoria já estabelecida no índice geral desta série. Status, para todo ADR aqui listado, é **Aceito**, salvo indicação explícita em contrário — nenhum ADR desta plataforma foi, até o momento, substituído ou tornado obsoleto.

### FOUNDATION

`PLATFORM_MANIFESTO.md` e `SYSTEM_BLUEPRINT.md` estabelecem a visão e a arquitetura em camadas da plataforma através de princípio e de diagrama, sem registrar ADR formal — sua função é fundacional e filosófica, precedendo a necessidade de decisão pontual registrada neste formato.

`SAAS_ARCHITECTURE.md` registra onze ADRs:

| ID | Título | Relacionados |
|---|---|---|
| ADR-001 | Toda Empresa pertence a um Tenant | — |
| ADR-002 | Business Profile define comportamento inicial, nunca permanente | `BUSINESS_PROFILE_ENGINE.md` |
| ADR-003 | Branding nunca altera regra de negócio | `BRANDING_HUB.md`, ADR-005 |
| ADR-004 | Feature Flags controlam diferenciação de plano | — |
| ADR-005 | Todos os Módulos seguem a mesma arquitetura modular | — |
| ADR-006 | RBAC é o modelo padrão; ABAC é extensão | `IDENTITY_HUB.md`, ADR-002/003 |
| ADR-007 | Tenant é sempre resolvido explicitamente na autenticação | `IDENTITY_HUB.md`, ADR-004 |
| ADR-008 | Organização é camada administrativa, nunca de dado compartilhado | — |
| ADR-009 | Ativação/desativação de Módulo nunca exclui dado histórico | — |
| ADR-010 | Nenhuma mudança é aplicada obrigatória e simultânea a todo Tenant | — |
| ADR-011 | Sessão é invalidada imediatamente na mudança de Permissão relevante | `IDENTITY_HUB.md`, ADR-010 |

### ADAPTIVE INTELLIGENCE

`AI_HUB.md` registra dez ADRs:

| ID | Título | Relacionados |
|---|---|---|
| ADR-001 | Nenhum módulo conversa diretamente com provedores de IA | `INTEGRATION_HUB.md`, ADR-001 |
| ADR-002 | Toda inteligência artificial passa pelo AI Hub | — |
| ADR-003 | Contexto é separado do Prompt | — |
| ADR-004 | Memória é independente do modelo | — |
| ADR-005 | Provider Agnostic é regra estrutural, não preferência | — |
| ADR-006 | Toda solicitação é rastreável de ponta a ponta | — |
| ADR-007 | Custo é propriedade observável de primeira classe | — |
| ADR-008 | Isolamento entre empresas é absoluto e estrutural | `SAAS_ARCHITECTURE.md`, Cap. 6 |
| ADR-009 | Nenhuma ação de alto impacto sem supervisão humana explícita | `AUTOMATION_ENGINE.md`, ADR-005 |
| ADR-010 | Prompts em produção são sempre versionados | — |

`BUSINESS_PROFILE_ENGINE.md` registra onze ADRs:

| ID | Título | Relacionados |
|---|---|---|
| ADR-001 | Todo Tenant possui exatamente um Business Profile ativo | — |
| ADR-002 | O perfil nunca altera regra de negócio diretamente | `SAAS_ARCHITECTURE.md`, ADR-003 |
| ADR-003 | Toda adaptação deve ser explicável | — |
| ADR-004 | O perfil evolui continuamente, nunca declarado completo | — |
| ADR-005 | Correção manual tem prioridade permanente sobre inferência divergente | — |
| ADR-006 | Cada elemento do Modelo de Perfil evolui independentemente | — |
| ADR-007 | Nenhum Segmento é implementado como código separado | — |
| ADR-008 | Perfil de uma empresa nunca influencia outra de forma identificável | `AI_HUB.md`, memória |
| ADR-009 | Toda mudança relevante de perfil é versionada | — |
| ADR-010 | O Engine nunca gera nem armazena identidade visual | `BRANDING_HUB.md`, Cap. 14 |
| ADR-011 | Recomendações nunca são aplicadas automaticamente sem confirmação | — |

`BRANDING_HUB.md` registra doze ADRs:

| ID | Título | Relacionados |
|---|---|---|
| ADR-001 | Toda empresa possui exatamente uma identidade ativa | — |
| ADR-002 | Nenhuma decisão de identidade é embutida em Componente ou Template | — |
| ADR-003 | Acessibilidade é requisito de aceitação, nunca opcional | — |
| ADR-004 | Toda mudança de identidade é versionada, nunca sobrescrita | — |
| ADR-005 | Branding nunca altera regra de negócio | `SAAS_ARCHITECTURE.md`, ADR-003 |
| ADR-006 | Branding nunca classifica Segmento ou Maturidade | `BUSINESS_PROFILE_ENGINE.md`, Cap. 12 |
| ADR-007 | Superfície consumidora recebe o Theme já resolvido | — |
| ADR-008 | Ajuste de acessibilidade preserva a intenção de cor da marca | — |
| ADR-009 | Adaptação automática é explicável via Brand Preview | `BUSINESS_PROFILE_ENGINE.md`, ADR-003 |
| ADR-010 | Ativos de marca isolados por Tenant | `SAAS_ARCHITECTURE.md`, Cap. 6 |
| ADR-011 | Restrições de linguagem de marca obrigatórias para IA | — |
| ADR-012 | Regeneração de Theme é sempre completa, nunca incremental | — |

### PLATFORM SERVICES

`AUTOMATION_ENGINE.md` registra doze ADRs:

| ID | Título | Relacionados |
|---|---|---|
| ADR-001 | Toda automação é baseada em evento | — |
| ADR-002 | Workflows são configurados, não programados | `SAAS_ARCHITECTURE.md` |
| ADR-003 | IA nunca executa automações diretamente | — |
| ADR-004 | Toda execução é auditável, sem exceção | — |
| ADR-005 | Toda Action de alto impacto exige aprovação humana explícita | `AI_HUB.md`, ADR-009 |
| ADR-006 | Nenhum Hub de domínio implementa sua própria automação | `AI_HUB.md` |
| ADR-007 | Toda Action sujeita a falha possui política de Retry definida | — |
| ADR-008 | Toda Action é desenhada para ser idempotente | — |
| ADR-009 | Falha de uma execução nunca compromete outra em andamento | — |
| ADR-010 | Nenhum Workflow acessa sistema externo diretamente | `SYSTEM_BLUEPRINT.md`, Cap. 3 |
| ADR-011 | Falha definitiva é preservada na Dead Letter Queue | — |
| ADR-012 | Branch não satisfeito é registrado como conclusão sem ação | — |

`IDENTITY_HUB.md` registra doze ADRs:

| ID | Título | Relacionados |
|---|---|---|
| ADR-001 | Toda autenticação passa pelo Identity Hub | — |
| ADR-002 | RBAC é obrigatório para toda Permissão | `SAAS_ARCHITECTURE.md`, ADR-006 |
| ADR-003 | ABAC é evolução do RBAC, nunca substituição | `SAAS_ARCHITECTURE.md`, ADR-006 |
| ADR-004 | Tenant Isolation é inviolável na camada de sessão e Token | `SAAS_ARCHITECTURE.md`, Cap. 6 |
| ADR-005 | Identity é independente dos Módulos de negócio | — |
| ADR-006 | Authentication sempre precede Authorization | — |
| ADR-007 | Toda decisão de acesso é auditada | — |
| ADR-008 | Passkey é o mecanismo recomendado por padrão | — |
| ADR-009 | MFA obrigatório para Owner e Administrador | — |
| ADR-010 | Revogação de Permissão invalida Sessão imediatamente | `SAAS_ARCHITECTURE.md`, ADR-011 |
| ADR-011 | Nenhum Token de Service Account recebe escopo amplo por padrão | — |
| ADR-012 | Recuperação de conta nunca oferece caminho mais fácil | — |

`KNOWLEDGE_HUB.md` registra doze ADRs:

| ID | Título | Relacionados |
|---|---|---|
| ADR-001 | Todo conhecimento passa pelo Knowledge Hub | — |
| ADR-002 | Nenhum Hub acessa documentos diretamente | `AI_HUB.md`, `IDENTITY_HUB.md` |
| ADR-003 | Busca híbrida é o padrão, não opcional | — |
| ADR-004 | Versionamento obrigatório para todo conhecimento | — |
| ADR-005 | Conhecimento nunca é sobrescrito | — |
| ADR-006 | Retrieval é do Knowledge Hub; Generation é do AI Hub | `AI_HUB.md` |
| ADR-007 | Nenhuma sincronização externa direta | `SYSTEM_BLUEPRINT.md`, Cap. 3 |
| ADR-008 | Resultado de busca nunca revela documento confidencial sem Permissão | — |
| ADR-009 | Conhecimento recuperado é identificável até documento e versão | `AI_HUB.md` |
| ADR-010 | Ausência de conhecimento é comunicada explicitamente, nunca preenchida | — |
| ADR-011 | Isolamento de conhecimento entre Tenants é absoluto | `SAAS_ARCHITECTURE.md`, Cap. 6 |
| ADR-012 | Conhecimento arquivado nunca excluído antes do prazo de retenção | — |

`INTEGRATION_HUB.md` registra doze ADRs:

| ID | Título | Relacionados |
|---|---|---|
| ADR-001 | Nenhum Hub acessa API externa diretamente | `AI_HUB.md`, ADR-001 |
| ADR-002 | Todo Provider é acessado via Connector Registry | — |
| ADR-003 | Retry obrigatório para toda chamada sujeita a falha transitória | — |
| ADR-004 | Connector Registry é fonte oficial de todo Connector | — |
| ADR-005 | Versionamento obrigatório para todo Connector e Contract | — |
| ADR-006 | Toda operação de integração é desenhada para ser idempotente | `AUTOMATION_ENGINE.md`, ADR-008 |
| ADR-007 | Nenhuma credencial exposta a Hub de domínio consumidor | — |
| ADR-008 | Notificação de entrada normalizada em evento interno | — |
| ADR-009 | Circuit Breaker aplicado individualmente por Connector | — |
| ADR-010 | Integração via Generic API Connector segue mesmo pipeline | — |
| ADR-011 | Credencial armazenada exclusivamente no Credential Vault | — |
| ADR-012 | Nenhum Connector recebe privilégio especial de núcleo | — |

### BUSINESS ARCHITECTURE

`BUSINESS_HUB_ARCHITECTURE.md` registra doze ADRs:

| ID | Título | Relacionados |
|---|---|---|
| ADR-001 | Todo domínio possui um único proprietário | `DOMAIN_OWNERSHIP_MATRIX.md`, ADR-001 |
| ADR-002 | Business Hubs comunicam-se preferencialmente por eventos | `AI_HUB.md`, ADR-001 |
| ADR-003 | Nenhuma entidade possui múltiplos proprietários | — |
| ADR-004 | Toda integração respeita contratos explícitos e versionados | — |
| ADR-005 | Todo novo Hub deve seguir este documento, sem exceção | — |
| ADR-006 | Anti-Corruption Layer obrigatória para consumo de Evento externo | — |
| ADR-007 | Business Hub nunca acessa diretamente o armazenamento de outro | `SAAS_ARCHITECTURE.md`, Cap. 6 |
| ADR-008 | Evento publicado descreve Fato consumado, nunca instrução futura | — |
| ADR-009 | Consumo por inscrição em Evento, nunca por polling de estado | — |
| ADR-010 | Domain Model documentado e validado antes de implementação | — |
| ADR-011 | Mudança incompatível em Contrato exige nova versão explícita | — |
| ADR-012 | Cada Business Hub define e monitora seus próprios SLIs e SLOs | — |

### BUSINESS HUBS

`CRM_DOMAIN_BLUEPRINT.md` registra doze ADRs:

| ID | Título | Relacionados |
|---|---|---|
| ADR-001 | CRM é único proprietário de Lead, Customer, Organization, Opportunity | `BUSINESS_HUB_ARCHITECTURE.md`, ADR-001 |
| ADR-002 | CRM nunca envia mensagem diretamente | — |
| ADR-003 | CRM nunca processa pagamento | — |
| ADR-004 | CRM publica evento para toda mudança relevante | `BUSINESS_HUB_ARCHITECTURE.md`, ADR-002 |
| ADR-005 | CRM nunca executa automação própria | `AUTOMATION_ENGINE.md`, Cap. 4 |
| ADR-006 | Timeline é imutável | — |
| ADR-007 | Opportunity pertence exclusivamente a Customer ou Organization | — |
| ADR-008 | Supplier e Customer são naturezas distintas de Relationship | — |
| ADR-009 | Consent é versionado, nunca sobrescrito | — |
| ADR-010 | Ownership de Relationship é sempre único em um dado momento | — |
| ADR-011 | Custom Fields resolvidos por Configuration, nunca por Domain Model | `SAAS_ARCHITECTURE.md` |
| ADR-012 | Deduplicação de Lead como etapa de Validation, nunca filtro anterior | — |

`CRM_HUB.md` registra catorze ADRs:

| ID | Título | Relacionados |
|---|---|---|
| ADR-001 | CRM Hub é único proprietário técnico dos relacionamentos | `BUSINESS_HUB_ARCHITECTURE.md`, ADR-001 |
| ADR-002 | Timeline imutável por construção, via Timeline Manager | ADR-006 do Blueprint |
| ADR-003 | CRM Hub nunca envia mensagem | Blueprint, ADR-002 |
| ADR-004 | Todo Command bem-sucedido publica Evento correspondente | — |
| ADR-005 | Customer 360 é visão composta, nunca Entidade armazenada isolada | — |
| ADR-006 | Toda Command é idempotente, identificado por operação única | — |
| ADR-007 | Deduplicação nunca funde registros sem confirmação explícita | Blueprint, Cap. 12 |
| ADR-008 | Archive é sempre Soft Delete | — |
| ADR-009 | Toda transferência de Ownership é auditável | — |
| ADR-010 | Busca resolvida por índice dedicado, nunca consulta direta | — |
| ADR-011 | Importação em lote submete mesma Validation da captura individual | — |
| ADR-012 | Consultas nunca modificam estado; Comandos nunca retornam leitura | — |
| ADR-013 | Relatório ou notificação aplica identidade via Branding Hub | `BRANDING_HUB.md`, Cap. 5 |
| ADR-014 | Falha de Platform Service nunca impede operação essencial | `AI_HUB.md`, `INTEGRATION_HUB.md` |

`COMMUNICATION_DOMAIN_BLUEPRINT.md` registra doze ADRs:

| ID | Título | Relacionados |
|---|---|---|
| ADR-001 | Communication não conhece Providers | `INTEGRATION_HUB.md`, ADR-001 |
| ADR-002 | Communication nunca chama API externa diretamente | — |
| ADR-003 | Communication publica evento para toda mudança relevante | `BUSINESS_HUB_ARCHITECTURE.md` |
| ADR-004 | CRM continua proprietário do relacionamento | `CRM_DOMAIN_BLUEPRINT.md` |
| ADR-005 | Integration continua proprietário das integrações | `INTEGRATION_HUB.md`, Cap. 3 |
| ADR-006 | Delivery é Entidade distinta de Message | — |
| ADR-007 | Toda Message é imutável após criação | — |
| ADR-008 | Webhook Event sempre traduzido antes de afetar Message | `BUSINESS_HUB_ARCHITECTURE.md`, Cap. 10 |
| ADR-009 | Broadcast sempre decomposto em Delivery individuais | — |
| ADR-010 | Communication Preference consumida por Evento, nunca duplicada | — |
| ADR-011 | Retry nunca sobrescreve tentativa anterior | — |
| ADR-012 | Toda Message verifica Communication Policy antes do envio | — |

`COMMUNICATION_HUB.md` registra quinze ADRs:

| ID | Título | Relacionados |
|---|---|---|
| ADR-001 | Communication é proprietário das conversas | `BUSINESS_HUB_ARCHITECTURE.md`, ADR-001 |
| ADR-002 | Mensagens são imutáveis | Blueprint, Cap. 12 |
| ADR-003 | Delivery nunca altera Message | — |
| ADR-004 | Communication nunca conhece Providers | `INTEGRATION_HUB.md`, ADR-001 |
| ADR-005 | Integration Hub é proprietário das integrações | `INTEGRATION_HUB.md`, Cap. 3 |
| ADR-006 | Retry preserva histórico | — |
| ADR-007 | Conversation é independente do canal | — |
| ADR-008 | Broadcast utiliza filas, nunca envio síncrono em massa | — |
| ADR-009 | Receipts são imutáveis | Blueprint, Cap. 12 |
| ADR-010 | Communication publica evento para toda mudança relevante | — |
| ADR-011 | Ordenação de Evento garantida por Conversation, não globalmente | — |
| ADR-012 | Toda Conversation possui exatamente um Assignment válido | — |
| ADR-013 | Nenhum Attachment existe sem Message associada | Blueprint | 
| ADR-014 | Read Receipt nunca inferido ou simulado | Blueprint, Cap. 12 |
| ADR-015 | Ordenação estrita garantida por Conversation, nunca global | Cap. 12 |

`FINANCE_DOMAIN_BLUEPRINT.md` registra doze ADRs:

| ID | Título | Relacionados |
|---|---|---|
| ADR-001 | Finance é proprietário do estado financeiro | `BUSINESS_HUB_ARCHITECTURE.md`, ADR-001 |
| ADR-002 | Ledger é imutável | — |
| ADR-003 | Balance é derivado, nunca fonte primária | — |
| ADR-004 | Integration é proprietário dos gateways | `INTEGRATION_HUB.md`, ADR-001 |
| ADR-005 | CRM nunca registra pagamentos | `CRM_HUB.md`, ADR-003 |
| ADR-006 | Communication nunca confirma pagamentos | `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Cap. 4 |
| ADR-007 | Automation decide quando, mas nunca executa diretamente | `AUTOMATION_ENGINE.md`, Cap. 4 |
| ADR-008 | Refund cria novas transações, nunca reverte original | Cap. 12 |
| ADR-009 | Subscriptions publicam eventos para toda transição relevante | — |
| ADR-010 | Settlement preserva histórico, nunca sobrescreve Ledger | Cap. 12 |
| ADR-011 | AI Hub apoia decisão financeira, nunca altera diretamente | `AI_HUB.md`, Cap. 5 |
| ADR-012 | Toda movimentação relevante produz Ledger Entry antes de tudo | — |

`FINANCE_HUB.md` registra treze ADRs:

| ID | Título | Relacionados |
|---|---|---|
| ADR-001 | Finance é proprietário do estado financeiro | Blueprint, ADR-001 |
| ADR-002 | Ledger é imutável | Blueprint, Cap. 12 |
| ADR-003 | Balance é derivado, nunca fonte primária | — |
| ADR-004 | Integration Hub é proprietário dos gateways | `INTEGRATION_HUB.md`, ADR-001 |
| ADR-005 | CRM nunca registra pagamentos | Blueprint, ADR-005 |
| ADR-006 | Communication nunca confirma pagamentos | Blueprint, ADR-006 |
| ADR-007 | Automation decide, mas nunca executa diretamente | `AUTOMATION_ENGINE.md`, Cap. 4 |
| ADR-008 | Refund cria novas transações, nunca reverte original | Blueprint, Cap. 12 |
| ADR-009 | Settlement preserva histórico, nunca sobrescreve Ledger | — |
| ADR-010 | Chargeback tratado como variação de origem de Refund | — |
| ADR-011 | AI Hub apoia decisão, nunca altera diretamente | `AI_HUB.md`, Cap. 5 |
| ADR-012 | Reconstrução periódica de Balance é obrigatória | — |
| ADR-013 | Reconstrução de Balance é verificação de integridade obrigatória | — |

`GROWTH_DOMAIN_BLUEPRINT.md` registra doze ADRs:

| ID | Título | Relacionados |
|---|---|---|
| ADR-001 | Growth é proprietário do crescimento | `BUSINESS_HUB_ARCHITECTURE.md`, ADR-001 |
| ADR-002 | Campaign não conhece Customer | Cap. 4 |
| ADR-003 | Referral não cria relacionamentos | `CRM_DOMAIN_BLUEPRINT.md` |
| ADR-004 | Journey não envia mensagens | `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Cap. 4 |
| ADR-005 | Automation executa campanhas | `AUTOMATION_ENGINE.md`, Cap. 4 |
| ADR-006 | Communication entrega mensagens | — |
| ADR-007 | CRM continua proprietário do relacionamento | — |
| ADR-008 | Finance continua proprietário do dinheiro | `FINANCE_DOMAIN_BLUEPRINT.md` |
| ADR-009 | Analytics mede resultados | — |
| ADR-010 | Growth publica eventos | `BUSINESS_HUB_ARCHITECTURE.md`, ADR-002 |
| ADR-011 | Engagement Score é sempre derivado | — |
| ADR-012 | Growth Insight nunca dispara ação automaticamente | `AI_HUB.md`, Cap. 5 |

`GROWTH_HUB.md` registra doze ADRs:

| ID | Título | Relacionados |
|---|---|---|
| ADR-001 | Growth é proprietário do crescimento | Blueprint, ADR-001 |
| ADR-002 | Campaign não conhece Customer | Blueprint, ADR-002 |
| ADR-003 | Journey não envia mensagens | Blueprint, ADR-004 |
| ADR-004 | Automation executa | `AUTOMATION_ENGINE.md`, Cap. 4 |
| ADR-005 | Communication comunica | — |
| ADR-006 | CRM mantém relacionamento | Blueprint, ADR-003/007 |
| ADR-007 | Finance mantém estado financeiro | `FINANCE_DOMAIN_BLUEPRINT.md` |
| ADR-008 | Analytics consolida métricas | Blueprint, ADR-009 |
| ADR-009 | AI apenas recomenda | `AI_HUB.md`, Cap. 5 |
| ADR-010 | Events são único mecanismo de colaboração | `BUSINESS_HUB_ARCHITECTURE.md`, ADR-002 |
| ADR-011 | Attribution nunca recalculada retroativamente | — |
| ADR-012 | Experiment em execução preserva composição estável de Variant | — |

`ANALYTICS_DOMAIN_BLUEPRINT.md` registra doze ADRs:

| ID | Título | Relacionados |
|---|---|---|
| ADR-001 | Analytics é proprietário da inteligência analítica | `BUSINESS_HUB_ARCHITECTURE.md`, ADR-001 |
| ADR-002 | Dashboards são leitura | — |
| ADR-003 | KPIs são derivados | — |
| ADR-004 | Forecast não altera estado | — |
| ADR-005 | Insights não executam | `AI_HUB.md`, Cap. 5 |
| ADR-006 | Growth continua dono do crescimento | `GROWTH_DOMAIN_BLUEPRINT.md` |
| ADR-007 | Finance continua dono do dinheiro | `FINANCE_DOMAIN_BLUEPRINT.md` |
| ADR-008 | CRM continua dono do relacionamento | `CRM_DOMAIN_BLUEPRINT.md` |
| ADR-009 | Communication continua dona da comunicação | `COMMUNICATION_DOMAIN_BLUEPRINT.md` |
| ADR-010 | Analytics publica eventos | `BUSINESS_HUB_ARCHITECTURE.md`, ADR-002 |
| ADR-011 | Snapshot é imutável | — |
| ADR-012 | Toda Metric possui fórmula e janela temporal explícitas | — |

`ANALYTICS_HUB.md` registra doze ADRs:

| ID | Título | Relacionados |
|---|---|---|
| ADR-001 | Analytics é somente leitura | Blueprint, ADR-002 |
| ADR-002 | KPIs são derivados | Blueprint, ADR-003 |
| ADR-003 | Forecast não altera operação | Blueprint, ADR-004 |
| ADR-004 | Dashboards nunca alteram estado de negócio | — |
| ADR-005 | Business Hubs publicam eventos; Analytics consome | — |
| ADR-006 | Growth permanece dono do crescimento | Blueprint, ADR-006 |
| ADR-007 | Finance permanece dono do dinheiro | Blueprint, ADR-007 |
| ADR-008 | CRM permanece dono do relacionamento | Blueprint, ADR-008 |
| ADR-009 | AI apenas recomenda | `AI_HUB.md`, Cap. 5 |
| ADR-010 | Automation executa ação confirmada | `AUTOMATION_ENGINE.md`, Cap. 4 |
| ADR-011 | Snapshot é imutável | Blueprint, ADR-011 |
| ADR-012 | Analytics Hub nunca é dependência de bloqueio de outro Hub | — |

### GOVERNANCE

`DOMAIN_OWNERSHIP_MATRIX.md` registra dezessete ADRs — Single Ownership, No Shared Ownership, Cross References, Analytics Read Only, Finance Owns Money, CRM Owns Relationships, Growth Owns Growth, Automation Executes, AI Recommends, Knowledge Stores Knowledge, Identity Owns Identity, Integration Owns External Connectivity, Business Profile Owns Adaptation, Branding Owns Visual Identity, esta matriz é normativa, duplicação silenciosa é violação, e todo novo Hub verifica sobreposição antes de sua criação — ADR-001 a ADR-017, integralmente listados em seu próprio Capítulo 20.

`EVENT_CATALOG.md`, `COMMAND_CATALOG.md` e `QUERY_CATALOG.md` registram vinte ADRs cada, cobrindo Single Producer, Single Owner, Replay obrigatório, Eventos imutáveis, Versionamento obrigatório, Consumers independentes, Analytics apenas consome, Automation executa através de Command Invocation, AI recomenda sem executar, Identity controla acesso, ordenação por Aggregate, consistência eventual, Read Models descartáveis e reconstruíveis, e a declaração formal de conclusão da tríade CQRS — cada conjunto completo permanece listado em seu próprio Capítulo 12 ou 20, conforme o documento.

`EVENT_INTERACTION_MATRIX.md` registra vinte ADRs, consolidando a ausência de Ciclo, a unidirecionalidade de toda interação, e a declaração formal de conclusão da governança de interação da plataforma — listados integralmente em seu próprio Capítulo 12.

### ERP FOUNDATION

Categoria incorporada por DOC-001 (2026-08-06) — dos onze documentos produzidos pela Sprint ERP-001 (`ERP_ARCHITECTURE.md`, Nota de Posicionamento), oito registram ADR e, ao todo, somam trinta decisões. `ERP_ARCHITECTURE.md` é o documento mestre, registrando as cinco decisões de reconciliação de mais alto nível da série; cinco dos sete documentos restantes são novos proprietários de conceito (`SUPPLIER_HUB.md`, `PURCHASE_HUB.md`, `INVENTORY_MOVEMENT_HUB.md`, `PRODUCTION_HUB.md`, `FISCAL_HUB.md`); dois são documentos de reconciliação que não introduzem ownership novo (`ORDER_HUB.md`, `FINANCIAL_HUB.md`). Os outros três documentos da Sprint (`DOMAIN_EVENT_CATALOG.md`, `ERP_CONTEXT_MAP.md`, `ERP_FOUNDATION_REPORT.md`) são consolidações e relatórios, sem seção de ADR própria — não contam nesta categoria.

`ERP_ARCHITECTURE.md` registra cinco ADRs:

| ID | Título | Relacionados |
|---|---|---|
| ADR-ERP-001 | Cinco novos proprietários, não dez | `DOMAIN_OWNERSHIP_MATRIX.md`, Cap. 11 |
| ADR-ERP-002 | Inventory Movement Hub é o eixo central | `INVENTORY_MOVEMENT_HUB.md`, ADR-IM-001 |
| ADR-ERP-003 | Physical Before Financial em todo o ERP Foundation | — |
| ADR-ERP-004 | Nenhum dos cinco novos Hubs calcula seu próprio indicador consolidado | `DOMAIN_OWNERSHIP_MATRIX.md`, ADR-016 |
| ADR-ERP-005 | Nenhum Agente de IA descrito possui autoridade de escrita | `AI_HUB.md`, ADR-009 |

`SUPPLIER_HUB.md` registra três ADRs:

| ID | Título | Relacionados |
|---|---|---|
| ADR-SU-001 | Supplier e Customer/Organization são Entidades distintas, mesmo sob o mesmo CNPJ | `DOMAIN_OWNERSHIP_MATRIX.md` |
| ADR-SU-002 | Supplier Performance Record é sempre derivado de fato observado, nunca de avaliação subjetiva nesta fase | `ERP_ARCHITECTURE.md`, Cap. 3 |
| ADR-SU-003 | Supplier Catalog Item.listPrice nunca é a fonte de verdade de Purchase Order Item.acquisitionCost | — |

`PURCHASE_HUB.md` registra quatro ADRs:

| ID | Título | Relacionados |
|---|---|---|
| ADR-PU-001 | Procurement é a camada estratégica do Purchase Hub, não um Owner separado | `DOMAIN_OWNERSHIP_MATRIX.md`, Cap. 3 |
| ADR-PU-002 | Purchase Order nunca cria Product implicitamente | — |
| ADR-PU-003 | Receiving é imutável; correção é sempre um novo registro | `EVENT_CATALOG.md`, Cap. 3 |
| ADR-PU-004 | Aprovação de Purchase Order é governada por alçada configurável, nunca por regra fixa interna | — |

`INVENTORY_MOVEMENT_HUB.md` registra quatro ADRs:

| ID | Título | Relacionados |
|---|---|---|
| ADR-IM-001 | Stock Movement é elevado a Bounded Context próprio, separado de Commerce Hub | `COMMERCE_HUB_ARCHITECTURE.md`, Cap. 25 |
| ADR-IM-002 | Stock Position é sempre projeção recalculada, nunca campo diretamente editável | `FINANCE_DOMAIN_BLUEPRINT.md` |
| ADR-IM-003 | Stock Location é Capability opcional, nunca obrigatória | `BUSINESS_PROFILE_ENGINE.md` |
| ADR-IM-004 | Expiração de Stock Reservation é responsabilidade do Automation Engine, nunca de um agendador interno | `ADR_INDEX.md`, ADR-006 (Automation Engine) |

`PRODUCTION_HUB.md` registra quatro ADRs:

| ID | Título | Relacionados |
|---|---|---|
| ADR-PD-001 | Production Hub e "Manufacturing Hub" são o mesmo Bounded Context | `ARCHITECTURE_RECONCILIATION_AND_GOVERNANCE.md`, Cap. 11 |
| ADR-PD-002 | Bill of Materials é sempre versionada, nunca editada in-place | — |
| ADR-PD-003 | Divergência entre planejado e realizado é sempre registrada, nunca corrigida silenciosamente | — |
| ADR-PD-004 | Production Order nunca inicia com insumo insuficiente | — |

`FISCAL_HUB.md` registra quatro ADRs:

| ID | Título | Relacionados |
|---|---|---|
| ADR-FI-001 | Fiscal Document é distinto de Financial Document, mesmo quando originados do mesmo Order | `COMMERCE_HUB_ARCHITECTURE.md`, Cap. 23 |
| ADR-FI-002 | Tax Calculation é sempre determinístico e nunca recalculado retroativamente | — |
| ADR-FI-003 | Fiscal Hub nunca integra diretamente com autoridade tributária externa | `DOMAIN_OWNERSHIP_MATRIX.md`, ADR-012 |
| ADR-FI-004 | Emissão fiscal é Capability opcional, nunca bloqueante da venda | `BUSINESS_PROFILE_ENGINE.md` |

`FINANCIAL_HUB.md` (reconciliação, sem novo Owner) registra três ADRs:

| ID | Título | Relacionados |
|---|---|---|
| ADR-FN-001 | Nenhum novo Owner financeiro é criado por esta Sprint | `DOMAIN_OWNERSHIP_MATRIX.md`, Cap. 11 |
| ADR-FN-002 | Toda nova obrigação financeira do ERP Foundation nasce de Evento consumido, nunca de escrita externa | — |
| ADR-FN-003 | Purchase Hub e Production Hub nunca consultam o resultado financeiro de sua própria publicação | — |

`ORDER_HUB.md` (reconciliação, sem novo Owner; inclui Pricing) registra três ADRs:

| ID | Título | Relacionados |
|---|---|---|
| ADR-OR-001 | Nenhum novo Owner de pedido é criado por esta Sprint | `DOMAIN_OWNERSHIP_MATRIX.md`, Cap. 11 |
| ADR-OR-002 | Fulfillment de Order depende de Stock Reservation real, nunca de inferência otimista | — |
| ADR-OR-003 | Pricing não recebe novo Owner; precificação orientada a custo é um contrato de leitura, nunca uma Entidade nova | — |

```
                RESUMO NUMÉRICO DO CATÁLOGO
   ┌───────────────────────────────────────────────────────────┐
   │  FOUNDATION:              11 ADRs (SAAS_ARCHITECTURE)          │
   │  ADAPTIVE INTELLIGENCE:    33 ADRs (AI, Business Profile,           │
   │                            Branding)                                   │
   │  PLATFORM SERVICES:        48 ADRs (Automation, Identity,                  │
   │                            Knowledge, Integration)                             │
   │  BUSINESS ARCHITECTURE:    12 ADRs                                                │
   │  BUSINESS HUBS:            126 ADRs (CRM, Communication, Finance,                    │
   │                            Growth, Analytics — Blueprint + Hub)                          │
   │  GOVERNANCE:               97 ADRs (Ownership Matrix, Event,                                 │
   │                            Command, Query Catalog, Interaction                                   │
   │                            Matrix)                                                                  │
   │  ERP FOUNDATION:           30 ADRs (ERP_ARCHITECTURE, Supplier,                                        │
   │                            Purchase, Inventory Movement,                                                  │
   │                            Production, Fiscal, Financial, Order)                                            │
   │                                                                │
   │  TOTAL:                    357 ADRs já registrados                                                     │
   └───────────────────────────────────────────────────────────┘
```

Todos os trinta ADRs desta categoria nasceram em status **Draft**, mesmo status de todos os dez documentos produzidos pela Sprint ERP-001 (`ERP_ARCHITECTURE.md`, Nota de Posicionamento) — diferente de toda outra categoria já catalogada neste índice, cujos documentos-fonte já avançaram a Official/Frozen. Nenhum ADR desta categoria é, por isso, menos válido como decisão já tomada — Draft descreve o status de aprovação editorial do documento, nunca a validade da decisão registrada nele (Capítulo 7 deste índice); mas um Auditor que consulte esta categoria deve saber que sua promoção formal a Official, per `DOCUMENTATION_CONSTITUTION.md`, §10, ainda está pendente, mesma pendência já registrada em `ERP_001_ERP_FOUNDATION_FINAL_REVIEW.md`, item 3 (Change Requests propostas por `ERP_ARCHITECTURE.md`, Capítulo 9, nunca executadas).

---

## 5. Classificação

DDD agrupa todo ADR fundamentado em Domain-Driven Design — Domain Ownership, Bounded Context, Anti-Corruption Layer — presente de forma transversal em `BUSINESS_HUB_ARCHITECTURE.md` e em cada Blueprint de Business Hub.

CQRS agrupa todo ADR relativo à separação entre Command e Query — presente centralmente em `COMMAND_CATALOG.md` e em `QUERY_CATALOG.md`, e aplicado individualmente em cada Hub.

EDA agrupa todo ADR relativo a Event-Driven Architecture — publicação, consumo, ordenação, replay — presente centralmente em `EVENT_CATALOG.md` e em `EVENT_INTERACTION_MATRIX.md`.

Ownership agrupa todo ADR que atribui um conceito a um proprietário exclusivo — presente centralmente em `DOMAIN_OWNERSHIP_MATRIX.md` e reafirmado em cada Blueprint.

Security agrupa todo ADR relativo a autenticação, autorização e proteção de dado — presente centralmente em `IDENTITY_HUB.md` e reafirmado em cada Hub.

Scalability agrupa todo ADR relativo a escala horizontal e a particionamento — presente em `SYSTEM_BLUEPRINT.md` e em cada Hub individual.

Performance agrupa todo ADR relativo a otimização de leitura e de escrita — presente centralmente em `QUERY_CATALOG.md`.

Observability agrupa todo ADR relativo a Logs, Tracing e auditoria — presente de forma transversal em cada Hub.

Governance agrupa todo ADR relativo à própria disciplina de documentação e de decisão arquitetural — presente centralmente nos cinco documentos de GOVERNANCE.

SaaS agrupa todo ADR relativo a multiempresa, Tenant e Feature Flag — presente centralmente em `SAAS_ARCHITECTURE.md`.

AI agrupa todo ADR relativo a inteligência artificial e a Human Oversight — presente centralmente em `AI_HUB.md`.

Automation agrupa todo ADR relativo a Workflow, Trigger e execução condicional — presente centralmente em `AUTOMATION_ENGINE.md`.

Identity agrupa todo ADR relativo a autenticação e a controle de acesso — presente centralmente em `IDENTITY_HUB.md`.

Integration agrupa todo ADR relativo a comunicação técnica externa — presente centralmente em `INTEGRATION_HUB.md`.

Analytics agrupa todo ADR relativo a indicador consolidado e a leitura agregada — presente centralmente em `ANALYTICS_DOMAIN_BLUEPRINT.md` e em `ANALYTICS_HUB.md`.

Business Rules agrupa todo ADR que registra uma regra de negócio específica de um domínio — presente em cada Blueprint de Business Hub.

```
              CLASSIFICAÇÃO CRUZADA (exemplos representativos)
   ┌───────────────────────────────────────────────────────────┐
   │  DDD + Ownership:      BUSINESS_HUB_ARCHITECTURE, ADR-001          │
   │  EDA + Ownership:      DOMAIN_OWNERSHIP_MATRIX, ADR-010                │
   │  CQRS + Analytics:     ANALYTICS_HUB, ADR-001                             │
   │  Security + SaaS:      IDENTITY_HUB, ADR-004                                  │
   │  AI + Governance:      AI_HUB, ADR-009                                            │
   │  Automation + EDA:     AUTOMATION_ENGINE, ADR-001                                      │
   └───────────────────────────────────────────────────────────┘
```

Esta classificação em dezesseis categorias não é mutuamente exclusiva — um mesmo ADR frequentemente pertence a mais de uma categoria simultaneamente, como demonstrado na tabela de classificação cruzada acima. `BUSINESS_HUB_ARCHITECTURE.md`, ADR-001, por exemplo, pertence tanto a DDD quanto a Ownership, porque a decisão de que todo domínio possui um único proprietário é, ao mesmo tempo, uma aplicação de Domain-Driven Design e uma decisão central de atribuição de propriedade. Esta sobreposição é esperada e desejável — ela reflete a natureza genuinamente interdisciplinar de boa parte das decisões arquiteturais mais importantes desta plataforma, que raramente se encaixam de forma limpa em uma única categoria isolada.

A categoria Business Rules merece um destaque particular por ser a mais numerosa entre as dezesseis, precisamente porque cada Blueprint de Business Hub registra, em seus próprios ADRs, tanto decisão de fronteira de domínio quanto regra de negócio específica ao seu próprio contexto — um ADR como `CRM_DOMAIN_BLUEPRINT.md`, ADR-006, sobre imutabilidade de Timeline, é ao mesmo tempo uma decisão de Business Rules e uma decisão que reforça o princípio Immutable History já classificado como Governance no Capítulo 3.

---

## 6. Relações Entre ADRs

```
   Architecture First (Manifesto)
      │
      ▼
   DDD (BUSINESS_HUB_ARCHITECTURE, ADR-001)
      │
      ▼
   Ownership (DOMAIN_OWNERSHIP_MATRIX, ADR-001)
      │
      ▼
   CQRS (COMMAND_CATALOG + QUERY_CATALOG)
      │
      ▼
   Events (EVENT_CATALOG)
      │
      ▼
   Queries (QUERY_CATALOG)
      │
      ▼
   Analytics (ANALYTICS_HUB, ADR-001)
```

Este diagrama demonstra a dependência conceitual entre as decisões mais fundamentais desta plataforma — a disciplina de Domain Ownership só é possível porque a arquitetura foi decidida antes do código; a separação entre Command e Query só é coerente porque cada domínio já possui um proprietário exclusivo; e a leitura consolidada do Analytics Hub só é legítima porque respeita, em cada passo anterior desta cadeia, a fronteira já estabelecida.

```
   Security First (IDENTITY_HUB, ADR-001)
      │
      ▼
   Tenant Isolation (SAAS_ARCHITECTURE, ADR-007)
      │
      ▼
   RBAC + ABAC (IDENTITY_HUB, ADR-002/003)
      │
      ▼
   Auditable Everything (IDENTITY_HUB, ADR-007)
      │
      ▼
   Aplicado transversalmente a todo Business Hub
```

Este segundo diagrama demonstra como a decisão de centralizar identidade sustenta, em cascata, o isolamento multiempresa e o controle de acesso granular já exigido de todo Hub subsequente.

```
   Human Oversight (AI_HUB, ADR-009)
      │
      ▼
   Automation exige aprovação humana (AUTOMATION_ENGINE, ADR-005)
      │
      ▼
   Growth Insight não dispara ação (GROWTH_DOMAIN_BLUEPRINT, ADR-012)
      │
      ▼
   Analytics Insight não executa (ANALYTICS_DOMAIN_BLUEPRINT, ADR-005)
      │
      ▼
   Command Catalog: AI Never Executes Commands (ADR-006)
```

Este terceiro diagrama demonstra como uma única decisão fundamental — Human Oversight, registrada originalmente em `AI_HUB.md` — se propaga, de forma consistente, por cada documento subsequente que trata de inteligência automatizada, nunca sendo contradita em nenhum dos quatro documentos que a citam.

---

## 7. Ciclo de Vida dos ADRs

Proposto é o estado de um ADR ainda em discussão, antes de sua incorporação formal a um documento proprietário — este estado nunca aparece nos documentos já publicados desta série, porque todo ADR neles registrado já passou por essa etapa antes da publicação.

Aceito é o estado de um ADR já incorporado a um documento proprietário e vigente na arquitetura atual da plataforma — o estado de todos os trezentos e vinte e sete ADRs já catalogados neste índice.

Substituído é o estado de um ADR cuja decisão foi superada por uma decisão posterior, registrada em um novo ADR que referencia explicitamente qual decisão anterior substitui — nenhum ADR desta plataforma está, até o momento, neste estado.

Obsoleto é o estado de um ADR cuja motivação original deixou de se aplicar, sem que uma nova decisão o tenha formalmente substituído — um estado transitório que exige, assim que identificado, uma decisão explícita de Substituição ou de Arquivamento.

Arquivado é o estado final de um ADR relativo a uma capacidade ou a um domínio inteiramente descontinuado da plataforma — preservado para fins de auditoria histórica, mas não mais consultado para orientar nenhuma decisão de implementação atual.

```
              CICLO DE VIDA DE UM ADR
   ┌───────────────────────────────────────────────────────────┐
   │  Proposto ──► Aceito ──► (permanece vigente indefinidamente)   │
   │                  │                                              │
   │                  ├──► Substituído (por novo ADR explícito)          │
   │                  │                                                    │
   │                  └──► Arquivado (domínio descontinuado)                   │
   └───────────────────────────────────────────────────────────┘
```

O critério que determina a transição de Aceito para Substituído é sempre a existência de um novo ADR que cite explicitamente o identificador do ADR anterior como aquele que está sendo superado — nunca uma remoção silenciosa do texto original, preservando o princípio Immutable History já descrito no Capítulo 3.

Vale notar que o estado Aceito, nesta plataforma, não é sinônimo de imutável enquanto decisão de negócio — é sinônimo de vigente enquanto registro documental. Uma Empresa específica pode, por exemplo, operar sob uma configuração que diverge de um comportamento padrão já descrito por um ADR, através do mecanismo de Feature Flag já estabelecido em `SAAS_ARCHITECTURE.md`, ADR-004, sem que isso torne o ADR original menos vigente como decisão arquitetural de referência — a exceção configurável é, ela mesma, prevista e permitida pela arquitetura, nunca uma violação silenciosa da decisão registrada.

A ausência de qualquer ADR em estado Substituído, Obsoleto ou Arquivado até o momento da publicação deste índice não é acidental — ela reflete o fato de que esta série de trinta e dois documentos (os vinte e quatro originais mais os oito da série ERP Foundation, incorporados por DOC-001) foi construída de forma incremental e cuidadosa, cada novo domínio verificado contra a arquitetura já existente antes de sua publicação, conforme já exigido pelo princípio Consistency First descrito no Capítulo 3. É esperado, e não motivo de preocupação, que decisões específicas eventualmente precisem de revisão à medida que a plataforma amadurece em produção real — este índice, e o processo de evolução descrito no Capítulo 9, existem precisamente para que essa revisão futura aconteça de forma disciplinada, nunca informal.

---

## 8. Processo de Criação

Um novo ADR é criado sempre que uma decisão arquitetural relevante precisa ser tomada — tipicamente quando duas ou mais alternativas de design são consideradas, e uma delas é escolhida com justificativa que merece ser preservada para consulta futura.

Quem aprova um novo ADR é sempre a mesma autoridade responsável pelo documento proprietário em que ele será registrado — um ADR de `FINANCE_HUB.md` é aprovado no contexto da arquitetura do Finance Hub, nunca por um processo genérico desacoplado do domínio específico que a decisão afeta.

A numeração de um novo ADR segue sempre a sequência já estabelecida dentro de seu próprio documento proprietário — o próximo ADR de `CRM_HUB.md`, por exemplo, seria numerado ADR-015, continuando a partir do último já registrado naquele documento específico, nunca reiniciando nem saltando números.

A revisão de um ADR já existente acontece sempre que uma mudança de contexto de negócio ou de arquitetura questiona sua validade contínua — essa revisão nunca altera o texto original do ADR, apenas determina se ele permanece Aceito ou se precisa ser formalmente Substituído.

A substituição de um ADR exige um novo ADR, no mesmo documento proprietário, que cite explicitamente qual ADR anterior está sendo substituído e por qual razão — nunca uma edição silenciosa do ADR original.

A referência a um ADR de outro documento, quando necessária para justificar uma nova decisão, segue sempre o formato já padronizado nesta série — nome do documento entre crases, seguido do identificador do ADR referenciado, exatamente como demonstrado em centenas de exemplos já catalogados no Capítulo 4 deste índice.

O papel deste índice no processo de criação merece um esclarecimento adicional: ele nunca é o local onde um novo ADR é originalmente redigido — sua redação completa, com contexto e justificativa, acontece sempre no documento proprietário correspondente, seguindo exatamente o mesmo processo já demonstrado, por exemplo, quando `GROWTH_HUB.md` incorporou seus doze ADRs ao ser publicado, ou quando `EVENT_INTERACTION_MATRIX.md` incorporou os vinte que fecham esta série. Este índice é atualizado somente depois — como um segundo passo de consolidação, nunca como o primeiro passo de decisão. Esta ordem é deliberada: garantir que toda decisão nasça no contexto completo de seu próprio domínio, antes de ser resumida para consulta rápida neste catálogo central.

---

## 9. Processo de Evolução

Novas versões de um ADR nunca substituem seu texto original — cada evolução de decisão produz um novo ADR numerado sequencialmente, preservando o anterior integralmente legível em seu documento de origem.

Compatibilidade entre um ADR novo e os já existentes é sempre verificada antes de sua publicação — nenhuma nova decisão é aceita se contradizer, sem justificativa explícita de substituição, uma decisão já registrada em qualquer um dos trinta e dois documentos proprietários já catalogados.

Migração de uma decisão arquitetural anterior para uma nova, quando um ADR é substituído, é sempre acompanhada de um período de transição documentado no próprio ADR substituto, análogo ao período de transição já exigido para Breaking Changes de Evento, de Command e de Query, conforme já detalhado em `EVENT_CATALOG.md`, Capítulo 8.

Depreciação de uma decisão arquitetural segue o mesmo ciclo de vida já descrito no Capítulo 7 — um ADR nunca é simplesmente removido; ele transita para Substituído ou para Arquivado, sempre com registro explícito da razão.

Histórico arquitetural completo desta plataforma é, na prática, a soma de todo ADR já registrado em todo documento proprietário, do primeiro já publicado em `SAAS_ARCHITECTURE.md` até o último já publicado em `EVENT_INTERACTION_MATRIX.md` — este índice é a única superfície que apresenta esse histórico completo de forma consolidada, sem exigir a leitura sequencial de cada documento individual.

---

## 10. Regras de Governança

Todo ADR possui um Owner — o documento proprietário em que foi registrado, sempre correspondente ao domínio que a decisão afeta.

Nenhum ADR é apagado — mesmo um ADR eventualmente Substituído permanece legível em seu documento de origem.

Toda alteração de decisão gera uma revisão formal, nunca uma edição silenciosa do ADR original.

Cross-reference é obrigatório sempre que um novo ADR se relaciona com uma decisão já registrada em outro documento.

Decisões conflitantes são proibidas — nenhum novo ADR contradiz, sem substituição explícita, uma decisão já em vigor em qualquer outro documento proprietário.

Todo ADR possui um identificador único dentro de seu próprio documento proprietário, nunca reutilizado para uma decisão distinta.

Todo ADR possui um título que resume a decisão em uma frase, seguido de contexto que explica sua motivação.

Nenhum ADR é registrado sem que a decisão correspondente já tenha sido efetivamente implementada ou esteja formalmente planejada para implementação.

Este índice é atualizado sempre que um novo ADR é registrado em qualquer um dos trinta e dois documentos proprietários já existentes, ou em qualquer documento futuro que venha a se somar à plataforma.

Nenhuma classificação de categoria, já descrita no Capítulo 5, é aplicada a um ADR sem que esse ADR já esteja formalmente registrado em seu documento proprietário.

Toda relação de dependência entre ADRs, já demonstrada no Capítulo 6, é verificável através da leitura direta do contexto de cada ADR envolvido.

Nenhum ADR de um documento de GOVERNANCE — `DOMAIN_OWNERSHIP_MATRIX.md`, `EVENT_CATALOG.md`, `COMMAND_CATALOG.md`, `QUERY_CATALOG.md`, `EVENT_INTERACTION_MATRIX.md` — contradiz um ADR já registrado em um Blueprint ou em um Hub individual, precisamente porque os documentos de GOVERNANCE consolidam, sem redefinir, decisões já tomadas.

Toda auditoria de conformidade arquitetural desta plataforma pode e deve iniciar sua investigação a partir deste índice, sem necessidade de acesso prévio a nenhum documento proprietário individual.

Este índice nunca introduz uma decisão arquitetural nova — sua função é exclusivamente de consolidação, organização e referência cruzada.

Toda proposta de novo Business Hub, de novo Platform Service ou de novo componente de Adaptive Intelligence é avaliada contra este índice antes de sua aprovação, verificando ausência de decisão conflitante.

Nenhuma decisão registrada neste índice é interpretada de forma isolada — o contexto completo permanece sempre no documento proprietário, nunca resumido de forma que distorça sua intenção original.

Toda referência a um ADR feita por qualquer documento futuro segue o mesmo formato já padronizado nesta série.

Este índice preserva a mesma disciplina de Cross Reference já exigida de todo documento desta série, nunca citando o conteúdo completo de um ADR quando uma referência é suficiente.

A revisão periódica deste índice acontece sempre que um novo documento proprietário é publicado, garantindo que nenhum ADR fique fora do catálogo consolidado por mais tempo do que o necessário para sua incorporação formal e completa.

Nenhuma exceção a estas vinte regras de governança é aceita informalmente — qualquer exceção proposta exige seu próprio ADR, registrado formalmente no documento proprietário apropriado.

---

## 11. Casos de Uso

**Nova decisão.** Um Arquiteto, ao desenhar a extensão de uma capacidade já existente no Finance Hub, consulta este índice para verificar se uma decisão equivalente já existe em outro domínio antes de propor um novo ADR em `FINANCE_HUB.md`.

**Substituição.** Uma decisão anterior sobre política de Retry no Automation Engine precisa ser revista; o Engenheiro responsável consulta `AUTOMATION_ENGINE.md`, ADR-007, já localizado através deste índice, e registra um novo ADR explicitamente substituindo o anterior.

**Auditoria.** Um Auditor de conformidade arquitetural consulta este índice para confirmar que toda decisão relativa a isolamento multiempresa está consistente entre `SAAS_ARCHITECTURE.md`, `IDENTITY_HUB.md`, `AI_HUB.md`, `KNOWLEDGE_HUB.md` e `BRANDING_HUB.md`.

**Arquitetura.** Um novo Arquiteto, ao ingressar na equipe, utiliza este índice como ponto de partida para compreender a topologia completa de decisão já tomada pela plataforma, antes de se aprofundar em qualquer documento individual.

**Novo Hub.** A proposta de um sexto Business Hub futuro é avaliada contra este índice para confirmar que nenhuma decisão já registrada em `BUSINESS_HUB_ARCHITECTURE.md` seria violada pela introdução desse novo domínio.

**Novo Serviço.** A proposta de um novo Platform Service é avaliada contra os ADRs já registrados em `AI_HUB.md`, em `IDENTITY_HUB.md`, em `KNOWLEDGE_HUB.md` e em `INTEGRATION_HUB.md`, garantindo que o novo serviço não duplique responsabilidade já atribuída a nenhum deles.

**Mudança de domínio.** Uma reconsideração de fronteira entre Growth Hub e Analytics Hub é avaliada frente aos ADRs já registrados em ambos os Blueprints, verificando se a mudança proposta exigiria substituição formal de alguma decisão já em vigor.

**Revisão.** Uma revisão trimestral de arquitetura utiliza este índice para verificar que nenhum ADR entrou em estado de Obsoleto sem que uma decisão de Substituição ou de Arquivamento correspondente tenha sido registrada.

**Migração.** A migração de uma versão de contrato de Evento para outra, já descrita em `EVENT_CATALOG.md`, Capítulo 8, é acompanhada da verificação, através deste índice, de que nenhum ADR relativo a Backward Compatibility em outro documento é contradito pela migração proposta.

**Governança.** O processo formal de aprovação de qualquer nova integração entre módulos, já descrito em `EVENT_INTERACTION_MATRIX.md`, consulta este índice para confirmar que a nova interação respeita toda decisão já registrada sobre Domain Ownership e sobre Events over Direct Calls.

**Treinamento.** Um novo Analista de Governança utiliza a classificação por categoria já descrita no Capítulo 5 para estudar, de forma isolada, todo ADR relativo a Security antes de assumir responsabilidade de auditoria de conformidade de acesso.

**Consolidação histórica.** Um relatório anual de evolução arquitetural da plataforma é construído inteiramente a partir deste índice, demonstrando quantas decisões foram tomadas por categoria e por documento ao longo do período coberto.

Em cada um destes doze casos, a mesma disciplina se repete: este índice é consultado como ponto de entrada, nunca como fonte final de detalhe — toda decisão que exija compreensão completa de seu contexto original remete sempre de volta ao documento proprietário correspondente, já localizado através da tabela do Capítulo 4, nunca interpretada a partir do título resumido isoladamente.

---

## 12. Glossário

**ADR** — Architecture Decision Record, o formato através do qual esta plataforma registra permanentemente uma decisão arquitetural relevante, sua justificativa completa e o contexto exato que a motivou.

**Status** — o estado atual de vigência de um ADR — Proposto, Aceito, Substituído, Obsoleto ou Arquivado.

**Owner** — o documento proprietário em que um ADR específico foi registrado, sempre correspondente ao domínio que a decisão afeta.

**Review** — o processo de revisão formal de um ADR já existente, determinando se ele permanece Aceito ou se precisa ser Substituído.

**Revision** — o registro formal de uma mudança de status de um ADR, sempre documentada explicitamente, nunca silenciosa.

**Superseded** — sinônimo técnico de Substituído, o estado de um ADR cuja decisão original foi superada por um ADR posterior explícito.

**Deprecated** — sinônimo técnico de Obsoleto, o estado transitório de um ADR cuja motivação original já deixou de se aplicar plenamente.

**Governance** — a disciplina formal de preservar consistência de decisão arquitetural ao longo de toda a evolução completa da plataforma.

**Decision** — o núcleo de todo ADR — a escolha específica tomada entre alternativas consideradas, sempre acompanhada de sua motivação.

**Architecture** — o conjunto completo de decisões estruturais que definem como a Adaptive Business Platform é construída e como seus doze módulos se relacionam entre si.

**Cross Reference** — a citação explícita de um ADR ou de um documento a partir de outro documento, nunca uma redefinição paralela do mesmo conteúdo.

**Traceability** — a capacidade de rastrear qualquer decisão arquitetural até seu documento de origem, seu contexto e sua motivação original.

**Substituição** — o processo formal pelo qual um novo ADR supera uma decisão anterior, sempre citando explicitamente o identificador exato do ADR substituído.

**Arquivamento** — o processo formal pelo qual um ADR relativo a um domínio já inteiramente descontinuado é preservado apenas para fins de auditoria histórica.

**Documento proprietário** — o documento oficial em que um ADR foi originalmente redigido e permanece integralmente legível, com todo seu contexto e sua justificativa completa.

**Índice consolidado** — a estrutura central deste documento, que organiza toda decisão já registrada por documento proprietário, por categoria e por relação plena de dependência.

---

## 13. Conclusão

Este documento passa a ser a autoridade oficial para localização e governança de todas as trezentas e cinquenta e sete decisões arquiteturais já registradas pela Adaptive Business Platform. Todo novo ADR, registrado em qualquer documento proprietário existente ou futuro, deverá ser incorporado a este índice, respeitando a mesma estrutura já aplicada a cada entrada catalogada: Identificador, Documento proprietário, Status, Objetivo e Justificativa resumidos, e ADRs relacionados quando aplicável.

É fundamental reforçar que os ADRs, em seu texto completo, permanecem exclusivamente em seus documentos proprietários — `SAAS_ARCHITECTURE.md`, `AI_HUB.md`, `BUSINESS_PROFILE_ENGINE.md`, `BRANDING_HUB.md`, `AUTOMATION_ENGINE.md`, `IDENTITY_HUB.md`, `KNOWLEDGE_HUB.md`, `INTEGRATION_HUB.md`, `BUSINESS_HUB_ARCHITECTURE.md`, cada Blueprint e cada Hub dos cinco Business Hubs, os cinco documentos de GOVERNANCE já publicados, e os oito documentos da categoria ERP FOUNDATION (`ERP_ARCHITECTURE.md`, `SUPPLIER_HUB.md`, `PURCHASE_HUB.md`, `INVENTORY_MOVEMENT_HUB.md`, `PRODUCTION_HUB.md`, `FISCAL_HUB.md`, `FINANCIAL_HUB.md`, `ORDER_HUB.md`, incorporados por DOC-001). Este documento, `ADR_INDEX.md`, é apenas o índice oficial — nunca um substituto do detalhe, do contexto e da justificativa completa que cada documento proprietário já preserva, e nunca uma autoridade paralela que compita com eles pela definição de nenhuma decisão já registrada.

Com a publicação deste índice, declara-se oficialmente consolidada a governança de decisões arquiteturais da Adaptive Business Platform. Toda futura decisão arquitetural relevante, em qualquer domínio já existente ou em qualquer domínio futuro que venha a se somar à plataforma, deverá ser registrada como ADR formal em seu documento proprietário correspondente, classificada segundo a taxonomia já estabelecida no Capítulo 5, e incorporada a este índice antes de ser considerada plenamente integrada à arquitetura oficial da plataforma.

Os seis documentos de governança transversal agora completos — `DOMAIN_OWNERSHIP_MATRIX.md`, `EVENT_CATALOG.md`, `COMMAND_CATALOG.md`, `QUERY_CATALOG.md`, `EVENT_INTERACTION_MATRIX.md` e este índice — formam, juntos, a camada de referência que nenhum Blueprint ou documento de Hub individual poderia oferecer isoladamente: uma visão consolidada de propriedade, de fato, de intenção, de leitura, de comunicação e, agora, de decisão histórica, aplicável à Adaptive Business Platform inteira de uma só vez. Trezentas e cinquenta e sete decisões, tomadas ao longo de trinta e dois documentos e de múltiplos domínios de negócio distintos, permanecem agora localizáveis, classificáveis e auditáveis a partir de um único ponto de entrada — o encerramento formal da disciplina de governança arquitetural que esta série de documentos construiu, decisão por decisão, desde sua primeira linha em `SAAS_ARCHITECTURE.md`, incluindo a extensão ERP Foundation incorporada por DOC-001.
