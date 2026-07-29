# Business Structure Hub Architecture — A Estrutura Organizacional da Empresa Cliente

**Adaptive Business Platform · Documento de Arquitetura (Draft)**

---

## Nota de Posicionamento Documental

Este documento nasce de uma Sprint que solicitou, textualmente, a criação de `docs/architecture/BUSINESS_HUB_ARCHITECTURE.md`, cobrindo Tenant, Organization, Workspace, Business Unit, Branch, Department, Team, Member, Employee, Membership, Papel Organizacional, Permissão Organizacional, Business Settings, Workspace Settings, Organization Policy e Business Configuration — o "Business Hub" citado como o oitavo Hub em `ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md`. A leitura obrigatória exigida por esta própria Sprint revelou duas descobertas que mudam substancialmente a natureza deste documento em relação aos cinco Blueprints anteriores desta série, e ambas precisam ser registradas aqui, de forma explícita, antes de qualquer conteúdo técnico.

**Primeira descoberta — colisão de nome de arquivo com documento Frozen.** O caminho solicitado, `docs/architecture/BUSINESS_HUB_ARCHITECTURE.md`, já é ocupado por um documento existente, Frozen, intitulado "Business Hub Architecture — A Constituição dos Domínios de Negócio" — o documento que define, para toda a plataforma, a diferença entre Platform Service, Adaptive Intelligence e Business Hub, e que estabelece o padrão obrigatório (Bounded Context, Domain Ownership, Events over Direct Calls, o checklist arquitetural do Capítulo 17) que todo Business Hub desta série — CRM, Communication, Finance, Growth, Analytics, e os cinco Hubs recém-documentados nesta mesma Sprint — cita como autoridade fundacional. Esse documento não trata de Tenant, Organização, Workspace ou estrutura organizacional de empresa cliente em nenhum momento — é um documento puramente meta-arquitetural, o "padrão de padrões". Escrever o conteúdo desta Sprint nesse mesmo caminho destruiria, por sobrescrita, a única referência meta-arquitetural que todos os demais dez documentos da série pressupõem existir. Isso violaria diretamente a regra desta própria Sprint — "tratar documentos Frozen como fonte autoritativa e evoluir por extensão, nunca por substituição" — em sua forma mais literal possível. Por isso, o conteúdo desta Sprint foi escrito em um caminho diferente, `BUSINESS_STRUCTURE_HUB_ARCHITECTURE.md`, preservando integralmente o documento Frozen original. Este é o único documento desta série cujo nome de arquivo diverge do solicitado, e essa divergência é registrada aqui como o item de maior prioridade de reconciliação, pendente de decisão formal do Owner da documentação sobre o nome definitivo — renomear este documento, renomear o documento Frozen existente, ou manter ambos como estão, cada opção exigindo o processo de Emenda já descrito em `DOCUMENTATION_CONSTITUTION.md`, §10.

**Segunda descoberta — a quase totalidade do domínio solicitado já é Official.** Diferente de todo Blueprint anterior desta série, onde o domínio solicitado sempre continha uma parcela substancial de território genuinamente novo, a leitura obrigatória revelou que `SAAS_ARCHITECTURE.md` (Official) já define, em profundidade, Tenant, Empresa, Conta, Organização, Workspace, Usuário, Convites, Propriedade, Administração, Hierarquia, os oito Papéis nomeados (Owner, Administrador, Gerente, Operador, Financeiro, Marketing, Atendimento, Convidado), o modelo RBAC/ABAC, e a arquitetura de Configuração Adaptativa que produz Business Settings, Workspace Settings e Business Configuration como dado, não como código. `IDENTITY_HUB.md` (Official) já define a implementação técnica desse mesmo modelo — Team Manager (Equipe), Organization Manager, RBAC Engine, ABAC Engine, Departamentos como estrutura organizacional dentro de uma Equipe — e `DOMAIN_OWNERSHIP_MATRIX.md` (Frozen) já atribui formalmente Role, Permission, Profile (Perfil), Identity, Authentication, Session e Token ao Identity Hub como proprietário único, sem exceção. `BUSINESS_PROFILE_ENGINE.md` (Official) já é proprietário de Segment (Empresa), Maturity e Business Classification. Isto significa que treze dos dezesseis conceitos solicitados por esta Sprint — Tenant, Organization, Workspace, Department, Team, Member, Employee, Membership, Organizational Role, Organizational Permission, Business Settings, Workspace Settings, Organization Policy, Business Configuration — já possuem proprietário Official ou Frozen estabelecido, e este documento não os redefine em nenhum momento. Apenas dois conceitos solicitados — **Business Unit** e **Branch (Filial)** — não têm proprietário prévio em nenhum documento já existente, e são, portanto, o único território genuinamente novo que este documento introduz como Owner. Por essa razão, a estrutura deste documento é fundamentalmente diferente dos cinco Blueprints anteriores: em vez de treze módulos internos plenamente especificados, este documento contém dois módulos plenamente especificados (Business Unit, Branch) e onze seções de citação e reconciliação terminológica para os conceitos já Official ou Frozen em outro lugar.

**Terceira observação, derivada das duas anteriores — tensão de taxonomia com o próprio `BUSINESS_HUB_ARCHITECTURE.md` (Frozen).** Aquele documento define Business Hub como "domínio de negócio reconhecível pelo cliente" — CRM, Finance, Growth, Communication, Analytics — distinto de Platform Service (capacidade técnica transversal, sem domínio de negócio próprio, como Identity Hub) e de Adaptive Intelligence (entendimento e orquestração, como Business Profile Engine). O domínio tratado por esta Sprint — Tenant, Workspace, estrutura organizacional, papel e permissão — é, por definição do próprio documento Frozen, exatamente o tipo de capacidade que uma empresa cliente não reconhece como "algo que ela contratou" da mesma forma que reconhece CRM ou Finance; é infraestrutura de conta e de acesso, mais próxima em natureza de `SAAS_ARCHITECTURE.md` e de `IDENTITY_HUB.md` — ambos tratados por aquele mesmo documento Frozen como exemplos de Platform Service — do que de um Business Hub operacional. Este documento não resolve essa tensão unilateralmente: `ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md`, que introduziu "Business Hub" como o oitavo Hub do modelo de 8 Hubs, permanece Draft, e a reclassificação de sua posição na taxonomia de três categorias — Business Hub, Platform Service, ou uma categoria própria — é registrada aqui como item de governança pendente, não decidido por este documento.

**Quarta observação, menor — colisão terminológica pré-existente.** "Organização" já é usado com dois significados distintos em documentos Official/Frozen anteriores a esta Sprint, independentemente dela: em `DOMAIN_OWNERSHIP_MATRIX.md`, "Organization" pertence ao CRM Hub e significa a entidade jurídica de um Cliente ou Lead; em `SAAS_ARCHITECTURE.md`, "Organização" significa o agrupamento administrativo de múltiplos Tenants em cenário de agência, franquia ou grupo empresarial. Este documento não introduz essa ambiguidade — apenas a herda e a torna explícita, porque o "Organization" solicitado por esta Sprint corresponde ao segundo sentido, nunca ao primeiro.

Com essas quatro observações registradas, este documento segue a mesma disciplina de precisão terminológica, DDD e transparência arquitetural de toda a série, mas com um objetivo mais modesto e mais honesto do que "definir o Business Hub": consolidar, para quem precisa entender a estrutura organizacional da empresa cliente, onde cada peça já vive — e especificar, com o mesmo rigor de sempre, as duas peças que genuinamente faltavam.

---

## 1. Introdução

Este documento descreve como a Adaptive Business Platform representa a estrutura interna de uma empresa cliente — sua hierarquia de Tenant, Organização, Workspace, unidades de negócio, filiais, departamentos, equipes e pessoas — e como essa estrutura se relaciona com o modelo de papel e permissão que rege o acesso de cada pessoa a cada parte do sistema. `SAAS_ARCHITECTURE.md` já define o modelo comercial e de isolamento multiempresa; `IDENTITY_HUB.md` já define a implementação técnica de autenticação e de autorização sobre esse modelo. Este documento não repete nenhum dos dois — cita ambos extensivamente, e acrescenta exclusivamente a camada de subdivisão física e operacional de uma Empresa (Business Unit, Branch) que nenhum dos dois havia, até aqui, formalizado.

---

## 2. Missão

A missão deste documento é dupla. Primeiro, servir como mapa de navegação único para qualquer Hub que precise entender "a quem uma pessoa pertence, com qual papel, em qual unidade de negócio, em qual filial" — hoje essa pergunta exige consultar `SAAS_ARCHITECTURE.md` e `IDENTITY_HUB.md` em conjunto, e nenhum dos dois documenta a subdivisão física de uma Empresa em múltiplas unidades operacionais. Segundo, especificar com rigor a estrutura de Business Unit e de Branch, preenchendo a lacuna identificada na Nota de Posicionamento Documental, para que Hubs que precisam de granularidade abaixo do Workspace — uma rede de clínicas com métricas por unidade no Analytics Hub, um Financeiro com acesso restrito a uma filial específica no Finance Hub, uma Campaign do Growth Hub direcionada a uma unidade geográfica específica — tenham uma Entidade formal para referenciar, em vez de inventar, cada um a seu modo, sua própria noção paralela de "unidade".

---

## 3. Problema que Resolve

Empresas cliente de porte médio a Enterprise frequentemente operam mais de um ponto físico ou mais de uma linha de negócio sob o mesmo Workspace — uma rede de clínicas com cinco unidades, uma franqueadora com múltiplas lojas, um grupo de restaurantes com cozinhas centrais e pontos de atendimento distintos. `SAAS_ARCHITECTURE.md`, Capítulo 21, já cobre o cenário em que cada unidade é um Tenant tecnicamente independente — Franquia, Agência, Grupo Empresarial — mas esse é o cenário de isolamento máximo, com Tenants completamente segregados. Existe um cenário intermediário, mais comum na prática que qualquer um dos três cenários de Capítulo 21, que nenhum documento anterior cobre: uma única Empresa, um único Tenant, um único Workspace, operando múltiplas unidades físicas ou de negócio que precisam ser diferenciadas para fins de relatório, de atribuição de responsável, e de escopo de Permissão — sem que isso justifique o isolamento técnico completo de um Tenant separado para cada uma. Sem uma Entidade formal para essa subdivisão intermediária, cada Hub que precisa dela — Finance com contas a receber por filial, Analytics com indicador por unidade, CRM com Territory já mencionado em `DOMAIN_OWNERSHIP_MATRIX.md` — corre o risco de modelar sua própria versão paralela e divergente do mesmo conceito, exatamente o problema de "domínios sobrepostos" que `BUSINESS_HUB_ARCHITECTURE.md` (Frozen) identifica como o erro arquitetural mais comum em sistemas de grande escala.

---

## 4. Filosofia

Extensão, nunca substituição. Este documento nunca redefine um conceito já Official ou Frozen — Tenant, Organização, Workspace, Perfil, Papel, Permissão, Equipe, Departamento permanecem exatamente como definidos em `SAAS_ARCHITECTURE.md` e em `IDENTITY_HUB.md`, e este documento os referencia, nunca os reescreve.

Granularidade opcional. Business Unit e Branch são subdivisões opcionais dentro de um Workspace — uma Empresa pequena, de unidade única, nunca precisa criar nenhuma das duas, e a plataforma opera normalmente sem elas, exatamente como um Workspace sem Departamento configurado opera normalmente em `IDENTITY_HUB.md`, Capítulo 12.

Estrutura, não autorização. Business Unit e Branch são estruturas organizacionais e de relatório, não unidades de autorização — pertencer a uma Branch não concede, por si só, nenhuma Permissão; a Permissão continua inteiramente governada pelo Papel do Usuário, resolvido pelo Identity Hub, mesmo princípio já estabelecido para Departamento em `IDENTITY_HUB.md`, Capítulo 12: "um Departamento é uma estrutura organizacional, não uma unidade de autorização." A única extensão que este documento propõe sobre esse princípio é a possibilidade de um escopo de ABAC — Permissão restrita a uma Branch específica — descrita no Capítulo 13, sempre como aplicação do ABAC Engine já existente, nunca como um mecanismo de autorização paralelo.

Honestidade documental. Onde este documento cita um conceito já definido em outro lugar, ele o faz de forma explícita e nomeada, nunca implícita — permitindo que qualquer leitor distinga imediatamente entre o que é definição nova e o que é apenas consolidação de referência.

---

## 5. Design Principles

**Single Owner, Reaffirmed.** Nenhuma linha deste documento contradiz `DOMAIN_OWNERSHIP_MATRIX.md` — Role, Permission, Profile continuam do Identity Hub; Segment e Maturity continuam do Business Profile Engine; nenhuma exceção.

**New Concepts Only Where Genuinely Absent.** Business Unit e Branch só se tornam Entidades formais deste documento porque nenhum documento anterior os define — a mesma verificação prévia exigida por `DOMAIN_OWNERSHIP_MATRIX.md`, Capítulo 11, para todo novo Hub, foi aplicada aqui antes de qualquer definição.

**Structural, Not Authorizing.** Toda nova Entidade introduzida aqui é estrutural — organiza e categoriza — e nunca concede Permissão por si só, conforme já estabelecido no Capítulo 4.

**Scoped Extension of ABAC.** Onde uma Permissão precisa ser restrita a uma Business Unit ou Branch específica, esse escopo é implementado como atributo consumido pelo ABAC Engine já existente em `IDENTITY_HUB.md`, nunca como um RBAC ou ABAC paralelo mantido por este documento.

**Consumed by Many, Owned by One.** Business Unit e Branch, uma vez definidos, são consumidos livremente por CRM (Territory), Finance (Financial Account por unidade), Analytics (indicador por unidade) e Growth (segmentação geográfica) através de Evento e de Query, nunca por acesso direto à estrutura interna deste domínio.

**No Redefinition of Tenant Isolation.** Business Unit e Branch existem inteiramente dentro da fronteira de isolamento de um único Tenant já estabelecida em `SAAS_ARCHITECTURE.md`, Capítulo 6 — nunca cruzam, nem parcialmente, o limite de isolamento entre dois Tenants diferentes.

---

## 6. Arquitetura Conceitual

```
                    Tenant (SAAS_ARCHITECTURE.md, Cap. 5)
                                 │
                                 ▼
                    Organização (opcional — agência,
                    franquia, grupo — SAAS_ARCHITECTURE.md, Cap. 21)
                                 │
                                 ▼
                              Empresa
                                 │
                                 ▼
                            Workspace (SAAS_ARCHITECTURE.md, Cap. 5)
                                 │
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                  ▼
        Business Unit         Branch            (Workspace sem
     (linha de negócio,    (unidade física,      subdivisão —
      ex.: "Estética")      ex.: "Unidade         cenário mais
              │              Centro")             comum)
              └──────────┬───────┘
                         ▼
                       Equipe (IDENTITY_HUB.md, Cap. 7)
                         │
                         ▼
                   Departamento (IDENTITY_HUB.md, Cap. 12)
                         │
                         ▼
                       Usuário (SAAS_ARCHITECTURE.md, Cap. 5)
                         │
                         ▼
                Perfil = Papel + Permissões
        (SAAS_ARCHITECTURE.md Cap. 11 + IDENTITY_HUB.md Cap. 7-10)
                         │
                         ▼
                Business Settings / Workspace Settings /
                Organization Policy / Business Configuration
        (Configurações — SAAS_ARCHITECTURE.md Cap. 13 e 15;
         Configuration Generator — BUSINESS_PROFILE_ENGINE.md Cap. 7)
```

Este diagrama é o mapa de navegação central deste documento: tudo acima da linha "Business Unit / Branch" já está integralmente definido em `SAAS_ARCHITECTURE.md`; tudo abaixo dela, incluindo Equipe, Departamento, Perfil e Configurações, já está integralmente definido em `IDENTITY_HUB.md` e em `SAAS_ARCHITECTURE.md`; apenas Business Unit e Branch são Entidades novas, introduzidas e especificadas por este documento.

---

## 7. Business Unit — Módulo Interno

**Objetivo.** Representar uma linha de negócio ou uma divisão operacional dentro de uma Empresa, distinta de uma localização física — por exemplo, uma clínica que opera tanto "Estética" quanto "Odontologia" sob o mesmo Workspace e, possivelmente, sob a mesma Branch física.

**Responsabilidades.** Nomear e categorizar uma linha de negócio; associar Usuários, via Membership, a uma ou mais Business Units; servir como dimensão de agrupamento para relatório e indicador.

**Funcionalidades.** Criação, edição, arquivamento de Business Unit; associação de Usuário a Business Unit; associação de Business Unit a uma ou mais Branch, quando a linha de negócio opera fisicamente em mais de um local.

**Fluxos.** Uma Empresa que opera múltiplas linhas de negócio cria uma Business Unit por linha durante a configuração inicial ou a qualquer momento posterior; cada novo Membership pode, opcionalmente, associar o Usuário a uma Business Unit específica, refinando o escopo de sua atuação sem alterar seu Papel.

**Dependências.** Depende de Workspace (SAAS_ARCHITECTURE.md) já existente; não depende de Branch, já que uma Business Unit pode existir sem estar associada a nenhuma localização física específica.

**Eventos.** `BusinessUnitCreated`, `BusinessUnitUpdated`, `BusinessUnitArchived`.

**Integrações.** CRM Hub consome Business Unit como dimensão adicional de Territory; Analytics Hub consome como dimensão de relatório; Growth Hub consome como critério de segmentação de Campaign direcionada a uma linha de negócio específica.

**Limites do domínio.** Business Unit nunca concede Permissão; nunca substitui Workspace como unidade de isolamento; nunca é confundida com Segment (Empresa), que é a classificação setorial de toda a Empresa perante a plataforma, mantida pelo Business Profile Engine — uma Empresa tem um único Segment, mas pode ter múltiplas Business Units.

---

## 8. Branch — Módulo Interno

**Objetivo.** Representar uma unidade física ou geográfica onde a Empresa opera — uma loja, uma clínica, um escritório regional.

**Responsabilidades.** Nomear, endereçar e categorizar uma localização física; associar Usuários, via Membership, a uma Branch específica; servir como dimensão de agrupamento geográfico para relatório, indicador e escopo de Permissão via ABAC.

**Funcionalidades.** Criação, edição, arquivamento de Branch; registro de endereço e de dado de contato local; associação de Business Unit a Branch, quando aplicável; associação de Usuário a Branch via Membership.

**Fluxos.** Uma Empresa com mais de um ponto físico cadastra uma Branch por unidade; cada Membership pode associar o Usuário a uma Branch específica, e essa associação pode ser consumida pelo ABAC Engine do Identity Hub para restringir Permissão de operação — por exemplo, um Financeiro visualiza apenas Invoice associada à sua própria Branch, quando essa restrição é explicitamente configurada pelo Administrador do Workspace.

**Dependências.** Depende de Workspace já existente; opcionalmente associada a uma ou mais Business Unit.

**Eventos.** `BranchCreated`, `BranchUpdated`, `BranchArchived`.

**Integrações.** Finance Hub consome Branch para segregar Financial Account e Invoice por unidade física, quando a Empresa opera múltiplos centros de custo; Analytics Hub consome como dimensão geográfica; CRM Hub consome Branch como refinamento de Territory quando o Territory corresponde a uma localização física da própria Empresa, e não apenas a uma região de atuação comercial.

**Limites do domínio.** Branch nunca é um Tenant — múltiplas Branches de uma mesma Empresa continuam compartilhando o mesmo Workspace, o mesmo Business Profile e o mesmo Branding, diferente do cenário de Franquia descrito em `SAAS_ARCHITECTURE.md`, Capítulo 21, onde cada unidade é tecnicamente um Tenant independente; Branch nunca concede Permissão por si só, apenas fornece o atributo que o ABAC Engine pode, opcionalmente, consumir.

---

## 9. Membership — Formalização de Vocabulário

`SAAS_ARCHITECTURE.md`, Capítulo 5, já descreve o mecanismo pelo qual um Usuário se associa a um Workspace através de um Perfil específico — "um Usuário pode ter acesso a múltiplos Workspaces, mas cada acesso é um relacionamento distinto e independente, com seu próprio Perfil" —, mas nunca nomeia esse relacionamento como uma Entidade própria. Este documento formaliza esse nome: **Membership** é o relacionamento nomeado entre um Usuário e um Workspace, contendo o Papel associado, e opcionalmente uma Business Unit e uma Branch. Membership não é uma nova Entidade de escrita independente — é a formalização de vocabulário sobre um relacionamento cuja mecânica de Perfil, Papel e Permissão já pertence inteiramente ao Identity Hub; a única informação que este documento acrescenta a esse relacionamento já existente é a associação opcional a Business Unit e a Branch, ambas definidas nos Capítulos 7 e 8.

**Employee** e **Member**, nos termos solicitados por esta Sprint, não são Entidades distintas de Usuário — são papéis de linguagem de negócio aplicados ao mesmo Usuário já definido em `SAAS_ARCHITECTURE.md`: "Member" descreve um Usuário com Membership ativo em um Workspace; "Employee" descreve, dentro do vocabulário de negócio de uma Empresa cliente, um Usuário cujo Papel corresponde a uma função interna remunerada, em oposição a um Convidado externo (consultor, parceiro) já descrito em `IDENTITY_HUB.md`, Capítulo 12. Nenhum dos dois termos exige uma tabela ou um Aggregate próprio — ambos são, tecnicamente, o mesmo Usuário com Membership, diferenciado apenas por convenção de nomenclatura de interface.

---

## 10. Organizational Role e Organizational Permission — Reconciliação Terminológica

"Papel Organizacional" e "Permissão Organizacional", conforme solicitados por esta Sprint, correspondem exatamente a **Papel** (Role) e **Permissão** (Permission) já definidos em `SAAS_ARCHITECTURE.md`, Capítulo 11, e implementados tecnicamente pelo RBAC Engine e pelo ABAC Engine de `IDENTITY_HUB.md`, Capítulo 7 — e formalmente atribuídos ao Identity Hub como Owner único em `DOMAIN_OWNERSHIP_MATRIX.md`, linhas 207-209. O adjetivo "Organizacional" não introduz um conceito novo; distingue, na linguagem de negócio de uma Empresa cliente, o Papel de um Usuário dentro de sua própria estrutura hierárquica do uso genérico do termo "Papel" em outros contextos da plataforma. Nenhuma nova Entidade, nenhum novo Aggregate e nenhum novo Evento são introduzidos por este documento para Organizational Role ou Organizational Permission — a única contribuição deste documento é a extensão opcional de escopo por Business Unit e por Branch, já descrita no Capítulo 8, consumida pelo ABAC Engine existente.

---

## 11. Business Settings, Workspace Settings, Organization Policy e Business Configuration — Reconciliação Terminológica

Os quatro termos solicitados por esta Sprint correspondem à categoria de dado já nomeada "Configurações" em `SAAS_ARCHITECTURE.md`, Capítulo 15 — "o estado de Módulos ativos, Feature Flags aplicadas, parâmetros de Business Profile e de Branding" — e produzida tecnicamente pelo Configuration Generator já descrito em `BUSINESS_PROFILE_ENGINE.md`, Capítulo 7. Este documento não introduz um novo mecanismo de configuração; formaliza a nomenclatura de negócio para três escopos já existentes dentro dessa mesma categoria de dado:

**Business Settings** é o escopo de Configuração aplicado a toda a Empresa, dentro de um Tenant — o equivalente de negócio ao conjunto de Feature Flags e parâmetros de Business Profile já descritos em `SAAS_ARCHITECTURE.md`, Capítulo 13.

**Workspace Settings** é o escopo de Configuração aplicado especificamente a um Workspace, relevante nos cenários de Organização com múltiplos Workspaces já descritos em `SAAS_ARCHITECTURE.md`, Capítulo 21.

**Organization Policy** é o escopo de Configuração e de regra administrativa aplicado por uma Organização a todos os Tenants que agrupa — por exemplo, uma política de senha mínima ou de MFA obrigatório imposta por uma Agência a todos os seus Tenants-cliente, mecanismo já implicitamente suportado pelo Organization Manager de `IDENTITY_HUB.md`, Capítulo 7, aqui apenas nomeado como conceito de negócio consultável.

**Business Configuration** é o termo genérico que engloba os três escopos anteriores, equivalente ao termo "Configurações" já usado em `SAAS_ARCHITECTURE.md`, Capítulo 15.

Nenhum dos quatro termos introduz um novo mecanismo técnico, uma nova tabela ou um novo Evento — todos são, tecnicamente, o mesmo dado de Configuração já gerido pelo Configuration Generator, apenas nomeado de forma mais específica para cada escopo de aplicação.

---

## 12. Domain Model — Tabela de Ownership

| Conceito | Owner Real | Status do Owner | Contribuição deste Documento |
|---|---|---|---|
| Tenant | SAAS_ARCHITECTURE.md | Official | Citação apenas |
| Organization (agrupamento de Tenants) | SAAS_ARCHITECTURE.md | Official | Citação apenas |
| Workspace | SAAS_ARCHITECTURE.md | Official | Citação apenas |
| Business Unit | Este documento | Draft (novo) | Definição plena — Capítulo 7 |
| Branch | Este documento | Draft (novo) | Definição plena — Capítulo 8 |
| Department | IDENTITY_HUB.md | Official | Citação apenas |
| Team | IDENTITY_HUB.md | Official | Citação apenas |
| Member / Employee | SAAS_ARCHITECTURE.md (como Usuário) | Official | Reconciliação de vocabulário — Capítulo 9 |
| Membership | SAAS_ARCHITECTURE.md (relacionamento implícito) | Official | Formalização de nome + extensão de escopo — Capítulo 9 |
| Organizational Role | Identity Hub (como Role) | Official/Frozen (Matrix) | Reconciliação de vocabulário — Capítulo 10 |
| Organizational Permission | Identity Hub (como Permission) | Official/Frozen (Matrix) | Reconciliação de vocabulário — Capítulo 10 |
| Business Settings | SAAS_ARCHITECTURE.md (como Configurações) | Official | Reconciliação de vocabulário — Capítulo 11 |
| Workspace Settings | SAAS_ARCHITECTURE.md (como Configurações) | Official | Reconciliação de vocabulário — Capítulo 11 |
| Organization Policy | IDENTITY_HUB.md (Organization Manager) | Official | Reconciliação de vocabulário — Capítulo 11 |
| Business Configuration | SAAS_ARCHITECTURE.md (como Configurações) | Official | Reconciliação de vocabulário — Capítulo 11 |

Este documento é, formalmente, o Owner exclusivo de apenas duas linhas desta tabela — Business Unit e Branch. Para todas as demais, este documento é consumidor e citador, nunca proprietário, em conformidade estrita com `DOMAIN_OWNERSHIP_MATRIX.md`, Capítulo 3, princípio Single Owner.

---

## 13. Escopo de Permissão por Business Unit e Branch

O único mecanismo novo de autorização introduzido por este documento é a possibilidade de escopo de ABAC por Business Unit ou por Branch — nunca um novo modelo de autorização paralelo. Quando um Administrador de Workspace configura essa granularidade adicional, o ABAC Engine já descrito em `IDENTITY_HUB.md`, Capítulo 7, passa a considerar o atributo `businessUnitId` ou `branchId` do Membership do Usuário como parte da avaliação de uma Permissão específica — por exemplo, "Financeiro pode visualizar Invoice apenas da própria Branch" é expresso como uma Policy avaliada pelo Policy Engine do Identity Hub, consumindo o atributo de Branch já fornecido pelo Membership.

```
          ESCOPO DE PERMISSÃO POR BRANCH (exemplo)
   ┌───────────────────────────────────────────────────────────┐
   │  Membership (Usuário + Workspace + Papel + Branch)               │
   │                        │                                         │
   │                        ▼                                         │
   │  ABAC Engine (IDENTITY_HUB.md) consome atributo Branch             │
   │                        │                                         │
   │                        ▼                                         │
   │  Policy: "Financeiro vê Invoice apenas da própria Branch"           │
   │                        │                                         │
   │                        ▼                                         │
   │  Finance Hub aplica filtro de Branch na Query de Invoice              │
   └───────────────────────────────────────────────────────────┘
```

Esta capacidade é opcional e desativada por padrão — a esmagadora maioria das Empresas, de unidade única, nunca a configura, e o modelo RBAC padrão já descrito em `SAAS_ARCHITECTURE.md`, Capítulo 11, continua suficiente sem nenhuma menção a Business Unit ou Branch.

---

## 14. Inteligência Artificial

O AI Hub, através do Business Profile Connector já descrito em `AI_HUB.md`, pode considerar a existência de múltiplas Business Units ou Branches como sinal adicional de Maturidade e de Capacidade, já mantidos pelo Business Profile Engine — uma Empresa com cinco Branches ativas tende a ter maior Maturidade operacional que uma Empresa de unidade única, informação que o Capabilities Engine já descrito em `BUSINESS_PROFILE_ENGINE.md`, Capítulo 7, pode incorporar sem que este documento redefina nenhuma lógica própria de classificação.

Doze capacidades de IA relevantes a este domínio, todas implementadas inteiramente pelo AI Hub e pelo Business Profile Engine já existentes, nunca por lógica própria deste documento: sugestão de estrutura inicial de Business Unit a partir do Segment identificado; sugestão de Papel apropriado durante o Convite de um novo Usuário; identificação de Branch com padrão de uso divergente das demais, relevante ao Trust Engine do Identity Hub; recomendação de escopo de ABAC quando o Feature Advisor identifica uma Empresa operando múltiplas Branches sem nenhuma restrição de Permissão configurada; sumarização de atividade por Business Unit para o Owner; identificação de Branch subutilizada; sugestão de consolidação de Business Unit redundante; alerta de Membership órfão (Usuário sem Papel ativo em nenhuma Business Unit); recomendação de Organization Policy padrão para cenário de Agência ou Franquia; explicação, via Explainability Engine já existente, de por que uma Permissão foi negada em razão de escopo de Branch; sugestão de Branch a ser criada a partir de padrão de Lead geograficamente concentrado, consumido via Evento do CRM Hub; e priorização de KPI por Business Unit no Dashboard, delegada inteiramente ao KPI Selector já existente.

---

## 15. Segurança

A segurança deste domínio é, quase inteiramente, a segurança já estabelecida em `SAAS_ARCHITECTURE.md`, Capítulo 16, e em `IDENTITY_HUB.md`, Capítulo 15 — Tenant Isolation, Zero Trust, MFA, auditoria imutável. Este documento acrescenta apenas que Business Unit e Branch, sendo subdivisões dentro de um único Tenant, nunca enfraquecem esse isolamento — uma Branch nunca é, por si só, uma fronteira de segurança equivalente a um Tenant, e qualquer expectativa de isolamento absoluto entre Branches de uma mesma Empresa deve ser resolvida através do cenário de Tenants tecnicamente distintos já descrito em `SAAS_ARCHITECTURE.md`, Capítulo 21, nunca através do escopo de ABAC descrito no Capítulo 13 deste documento, que é um controle de conveniência operacional, não uma garantia de isolamento criptográfico ou físico.

---

## 16. Observabilidade

Logs, Tracing e Metrics de criação, edição e arquivamento de Business Unit e de Branch seguem o mesmo padrão estrutural já estabelecido em `SYSTEM_BLUEPRINT.md`. Um indicador específico deste domínio é a distribuição de Membership por Business Unit e por Branch ao longo do tempo, consultável pelo Analytics Hub, informando tanto o Owner da Empresa quanto o próprio Business Profile Engine sobre a evolução estrutural real do negócio.

---

## 17. Escalabilidade

Business Unit e Branch são registros de baixo volume relativo — mesmo uma Empresa Enterprise dificilmente excede algumas centenas de Branches — e não impõem nenhum requisito de escala além do já garantido pela Data Layer particionada por Tenant, descrita em `SYSTEM_BLUEPRINT.md`.

---

## 18. Integração com os Hubs

CRM Hub consome Business Unit e Branch como refinamento de Territory, já de sua propriedade conforme `DOMAIN_OWNERSHIP_MATRIX.md`. Finance Hub consome Branch para segregação de Financial Account e de relatório de centro de custo. Growth Hub consome ambos como dimensão de segmentação geográfica ou de linha de negócio para Campaign. Analytics Hub consome ambos como dimensão adicional de todo Dashboard, Report e Metric já existente, sem que este documento defina nenhum novo indicador — apenas a dimensão pela qual um indicador já existente pode ser agrupado. Communication Hub pode, opcionalmente, rotear uma Conversation a uma Fila associada a uma Branch específica, quando esse roteamento já configurado em `COMMUNICATION_HUB.md` é combinado com o atributo de Branch aqui definido. Identity Hub consome Business Unit e Branch como atributo adicional de ABAC, já descrito no Capítulo 13. Business Profile Engine consome a contagem e a distribuição de Business Unit e de Branch como sinal adicional de Maturidade. AI Hub consome ambos através do Business Profile Connector, sem acesso direto. Integration Hub não possui integração direta com este domínio. Automation Engine pode disparar um Workflow em reação a `BranchCreated` ou a `BusinessUnitCreated`, como qualquer outro Evento da plataforma.

---

## 19. Casos de Uso

**Caso 1 — Rede de clínicas com cinco unidades.** Uma Empresa cliente do Segment "Clínica" opera cinco unidades físicas sob o mesmo Workspace. O Owner cria cinco Branches durante a configuração inicial, uma por unidade, e associa cada novo Usuário convidado a uma Branch específica via Membership. O Financeiro da Empresa, por decisão do Administrador, tem sua Permissão restrita à Branch de sua própria unidade através de uma Policy consumida pelo ABAC Engine — vê Invoice apenas da unidade em que atua, mesmo possuindo o mesmo Papel "Financeiro" que um colega em outra unidade com escopo próprio.

**Caso 2 — Clínica com duas linhas de negócio na mesma unidade física.** Uma Empresa opera "Estética" e "Odontologia" na mesma localização física, sob a mesma Branch. O Owner cria duas Business Units, ambas associadas à mesma Branch, e Usuários são associados a uma ou a outra conforme sua função — sem que isso implique nenhuma restrição de Permissão adicional, apenas categorização para relatório separado no Analytics Hub.

**Caso 3 — Agência administrando múltiplos Tenants-cliente, cada um com sua própria estrutura.** Uma Agência, conforme `SAAS_ARCHITECTURE.md`, Capítulo 21, administra Organização própria agrupando múltiplos Tenants-cliente. Dentro de um Tenant-cliente específico, o Business Unit e o Branch aqui definidos operam de forma inteiramente independente da estrutura de Organização da Agência — um conceito nunca interfere no outro, mesmo operando em níveis hierárquicos adjacentes no diagrama do Capítulo 6.

---

## 20. Roadmap

No curto prazo, a prioridade é resolver o item de governança pendente sobre o nome definitivo deste documento, registrado na Nota de Posicionamento Documental, antes de qualquer implementação técnica de Business Unit ou Branch. No médio prazo, a prioridade é a implementação de Business Unit e Branch como Entidades de baixo risco, consumidas inicialmente apenas pelo CRM Hub como refinamento de Territory. No longo prazo, a prioridade é a extensão de escopo de ABAC por Branch, já descrita no Capítulo 13, e a reavaliação formal, junto ao `ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md`, de qual categoria da taxonomia de três partes — Business Hub, Platform Service, ou uma quarta categoria ainda não nomeada — melhor descreve este domínio.

---

## 21. Architecture Decision Records

**ADR-BS-001 — Este documento não substitui `BUSINESS_HUB_ARCHITECTURE.md`.** O nome de arquivo `BUSINESS_STRUCTURE_HUB_ARCHITECTURE.md` foi escolhido especificamente para preservar, sem alteração, o documento Frozen já existente no caminho originalmente solicitado. Contexto: evitar a destruição por sobrescrita de um documento meta-arquitetural citado por toda a série. Alternativa descartada: sobrescrever o documento Frozen — rejeitada por violar diretamente a regra de extensão-nunca-substituição desta própria Sprint.

**ADR-BS-002 — Tenant, Organization, Workspace, Team, Department, Role e Permission permanecem exclusivamente sob seus Owners já registrados em `DOMAIN_OWNERSHIP_MATRIX.md`.** Este documento nunca os redefine. Contexto: aplicação direta do princípio Single Owner.

**ADR-BS-003 — Business Unit e Branch são as únicas Entidades de escrita própria deste documento.** Toda demais menção a conceito organizacional é citação, nunca definição. Contexto: resultado direto da verificação de ownership prévia exigida por `DOMAIN_OWNERSHIP_MATRIX.md`, Capítulo 11.

**ADR-BS-004 — Membership é vocabulário formalizado, não uma nova tabela de escrita independente.** O relacionamento técnico já existe em `SAAS_ARCHITECTURE.md`; este documento apenas o nomeia e estende com atributo opcional de Business Unit e Branch. Contexto: evitar a criação de um Aggregate redundante sobre um relacionamento já implementado pelo Identity Hub.

**ADR-BS-005 — Escopo de Permissão por Business Unit ou Branch é sempre implementado como extensão do ABAC Engine existente, nunca como mecanismo de autorização paralelo.** Contexto: preservar Centralized Identity, já um Design Principle inegociável de `IDENTITY_HUB.md`.

**ADR-BS-006 — Branch nunca é tratada como fronteira de isolamento equivalente a Tenant.** Contexto: prevenir a expectativa equivocada de que o escopo de ABAC por Branch ofereça a mesma garantia de isolamento técnico absoluto já reservada exclusivamente ao Tenant em `SAAS_ARCHITECTURE.md`, Capítulo 6.

---

## 22. Glossário

**Business Unit** — linha de negócio ou divisão operacional dentro de uma Empresa, definida por este documento.

**Branch** — unidade física ou geográfica onde a Empresa opera, definida por este documento.

**Membership** — nome formalizado, por este documento, do relacionamento entre Usuário e Workspace já existente em `SAAS_ARCHITECTURE.md`, opcionalmente estendido com Business Unit e Branch.

**Member / Employee** — papéis de linguagem de negócio aplicados ao Usuário já definido em `SAAS_ARCHITECTURE.md`; não são Entidades técnicas distintas.

**Organizational Role / Organizational Permission** — nomes de negócio para Role e Permission já definidos e implementados pelo Identity Hub.

**Business Settings / Workspace Settings / Organization Policy / Business Configuration** — nomes de negócio para escopos distintos da mesma categoria de dado "Configurações" já definida em `SAAS_ARCHITECTURE.md`.

**Escopo de ABAC por Branch** — extensão opcional do ABAC Engine do Identity Hub que restringe Permissão com base na Branch do Membership de um Usuário.

---

## 23. Conclusão

Este documento resolveu-se em algo menor e, ao mesmo tempo, mais honesto do que a Sprint que o originou solicitava: não um oitavo Business Hub inteiramente novo, com dezesseis Entidades próprias, mas um documento de consolidação e reconciliação que confirma o quanto de `SAAS_ARCHITECTURE.md` e de `IDENTITY_HUB.md` já resolve, e especifica com rigor as duas peças — Business Unit e Branch — que genuinamente faltavam. Essa é, em si, uma aplicação bem-sucedida do processo de verificação prévia exigido por `DOMAIN_OWNERSHIP_MATRIX.md`, Capítulo 11, antes da criação de qualquer novo domínio: a verificação, quando levada a sério, por vezes revela que a maior parte do trabalho já foi feita, e que o valor real está em nomear com precisão o que falta, não em redefinir o que já existe.

Dois itens permanecem como pendência formal de governança, fora do escopo de decisão unilateral deste documento: o nome de arquivo definitivo, dada a colisão registrada na Nota de Posicionamento Documental; e a posição taxonômica deste domínio — Business Hub, Platform Service, ou categoria própria — a ser resolvida junto à evolução futura, ainda Draft, do `ADAPTIVE_PLATFORM_MASTER_BLUEPRINT.md`.
