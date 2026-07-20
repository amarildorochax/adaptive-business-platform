# Business Hub Architecture — A Constituição dos Domínios de Negócio

**Adaptive Business Platform · Documento Técnico Oficial**

---

## 1. Introdução

Este documento é a referência arquitetural oficial para todo Business Hub da Adaptive Business Platform — CRM, Finance, Growth, Communication, Analytics, e todo novo domínio de negócio que venha a ser adicionado nos próximos anos. Dez documentos oficiais já existem, e nenhum deles define este padrão: `PLATFORM_MANIFESTO.md` cita cada Hub como parte do ecossistema, sem definir sua arquitetura interna; `SYSTEM_BLUEPRINT.md` posiciona todo Hub — de qualquer natureza — em camadas e estabelece as regras gerais de comunicação por evento; e os oito documentos restantes definem, cada um, um Hub específico que não é, ele mesmo, um Business Hub no sentido estrito que este documento define. Este é o primeiro documento a estabelecer o que diferencia um Business Hub dos demais componentes da plataforma, e o padrão obrigatório que todo Business Hub, presente ou futuro, deve seguir.

A plataforma é composta por três categorias de componente, e a confusão entre elas é a fonte mais comum de erro arquitetural em sistemas de grande escala. Platform Services são capacidades técnicas transversais, consumidas por toda a plataforma da mesma forma, sem representar, elas mesmas, nenhum domínio de negócio — o AI Hub, o Identity Hub, o Knowledge Hub e o Integration Hub, cada um já detalhado em seu próprio documento, são Platform Services: eles existem para que outros componentes operem, não para que uma empresa cliente os reconheça como uma capacidade de negócio que ela contratou. Adaptive Intelligence é a camada que entende e orquestra — o Business Profile Engine, que compreende cada empresa, o Branding Hub, que mantém sua identidade, e o Automation Engine, que executa suas automações, cada um também já detalhado em seu próprio documento, formam essa camada: eles não são, eles mesmos, um domínio de negócio como CRM ou Finance, mas a inteligência e a orquestração que tornam qualquer domínio de negócio adaptativo. Business Hubs são os domínios de negócio propriamente ditos — CRM, Finance, Growth, Communication, Analytics — cada um representando uma capacidade que uma empresa cliente reconhece diretamente como parte de sua operação: gerenciar relacionamento com cliente, controlar finanças, adquirir tráfego, comunicar-se com o mercado, medir resultado.

```
                        TRÊS CATEGORIAS DE COMPONENTE
   ┌───────────────────────────────────────────────────────────┐
   │  Platform Services                                            │
   │  (capacidade técnica transversal, sem domínio de negócio       │
   │   próprio)                                                     │
   │  AI Hub · Identity Hub · Knowledge Hub · Integration Hub        │
   ├───────────────────────────────────────────────────────────┤
   │  Adaptive Intelligence                                          │
   │  (entendimento, identidade e orquestração — não é, ela          │
   │   mesma, um domínio de negócio)                                 │
   │  Business Profile Engine · Branding Hub · Automation Engine     │
   ├───────────────────────────────────────────────────────────┤
   │  Business Hubs                                                   │
   │  (domínio de negócio reconhecível pelo cliente)                  │
   │  CRM · Finance · Growth · Communication · Analytics ·             │
   │  e todo novo domínio futuro (Capítulo 19)                          │
   └───────────────────────────────────────────────────────────┘
```

Por que essa distinção importa: um Business Hub representa uma capacidade de negócio, não um serviço técnico. Isso significa que ele existe porque uma empresa precisa operar Cliente, ou operar Finança, ou operar Campanha — não porque a plataforma precisa de um mecanismo técnico interno. Um Business Hub tem um Domain Model próprio, expresso em linguagem de negócio, com Entidades e Regras que fariam sentido para um profissional daquela área mesmo sem qualquer conhecimento de arquitetura de software. Um Platform Service ou um componente de Adaptive Intelligence, ao contrário, é definido em termos técnicos — Prompt, Contexto, Conector, Automação —, e sua correção é medida pela sua utilidade para o restante da plataforma, não por sua fidelidade a um domínio de negócio externo reconhecível.

---

## 2. Missão

A missão deste documento é definir os princípios obrigatórios para a criação de qualquer domínio de negócio da Adaptive Business Platform, garantindo que cada Business Hub, presente ou futuro, seja internamente coerente, claramente delimitado em relação aos demais, e capaz de evoluir de forma independente, sem exigir coordenação constante com todos os outros domínios já existentes.

Esta missão não é alcançável através de convenção informal ou de disciplina individual de cada equipe que constrói um Hub — ela exige um padrão explícito, obrigatório, e verificável, exatamente como este documento se propõe a ser. Nenhum Business Hub é aceito na plataforma sem demonstrar conformidade com os princípios e a estrutura aqui definidos, verificados através do checklist arquitetural do Capítulo 17.

---

## 3. Problema que Resolve

Domínios sobrepostos surgem quando dois Business Hubs diferentes modelam, cada um a seu modo, o mesmo conceito de negócio — por exemplo, tanto o CRM Hub quanto o Growth Hub mantendo sua própria noção divergente de "Cliente", cada uma com campo e regra ligeiramente diferentes, sem que nenhuma das duas seja reconhecida como a definição oficial.

Duplicação de responsabilidades acontece quando a mesma capacidade de negócio — calcular uma métrica, validar uma regra de elegibilidade — é implementada de forma independente em mais de um Hub, produzindo resultado potencialmente divergente para a mesma pergunta de negócio feita em contextos diferentes.

Acoplamento aparece quando um Hub depende diretamente da estrutura de dado interna de outro para funcionar corretamente — o mesmo padrão de fragmentação já diagnosticado para inteligência artificial em `AI_HUB.md`, para automação em `AUTOMATION_ENGINE.md`, para identidade em `IDENTITY_HUB.md`, para conhecimento em `KNOWLEDGE_HUB.md` e para integração externa em `INTEGRATION_HUB.md`, aqui aplicado à relação entre domínios de negócio.

Dependências circulares surgem quando o Hub A depende de uma capacidade do Hub B, que por sua vez depende de uma capacidade do Hub A, tornando impossível implantar, testar ou evoluir qualquer um dos dois isoladamente sem considerar o outro simultaneamente.

Regras inconsistentes aparecem quando a mesma regra de negócio — por exemplo, o que constitui um Cliente elegível a um benefício específico — é interpretada de forma diferente por Hubs diferentes que a consultam, porque nenhum deles é reconhecido como o dono inequívoco dessa regra.

Entidades compartilhadas sem proprietário claro produzem o problema mais persistente de todos: quando ninguém é claramente responsável por uma Entidade de negócio, qualquer Hub se sente autorizado a alterá-la diretamente, e o resultado, ao longo do tempo, é um conjunto de regras contraditórias que nenhuma equipe individual consegue mais explicar por completo.

Dificuldade de evolução é a consequência acumulada de todos os problemas anteriores: um domínio de negócio que precisa coordenar mudança com múltiplos outros domínios, por conta de acoplamento e de responsabilidade compartilhada mal definida, evolui de forma cada vez mais lenta e arriscada, exatamente o oposto do compromisso de evolução contínua já estabelecido no Manifesto.

Este documento resolve essas sete categorias de risco impondo, a todo Business Hub, um conjunto de princípios de Domain-Driven Design aplicados com rigor — Bounded Context explícito, Domain Ownership inequívoco, e comunicação exclusivamente por evento entre domínios — descritos em profundidade nos capítulos seguintes.

---

## 4. Filosofia

Domain Ownership. Toda Entidade de negócio relevante pertence a exatamente um Business Hub, que é sua única fonte de verdade e o único autorizado a alterá-la.

Bounded Context. Cada Business Hub define uma fronteira explícita dentro da qual seu Domain Model é válido e consistente — um mesmo termo de negócio pode significar coisas ligeiramente diferentes em Hubs diferentes, e essa diferença é aceitável dentro de fronteiras claras, nunca resolvida forçando um único significado universal artificial.

Low Coupling. Nenhum Business Hub conhece a implementação interna de outro — toda dependência é resolvida por evento ou por contrato explícito, nunca por acesso direto a Entidade ou a estrutura de dado de outro domínio.

High Cohesion. Tudo o que pertence a um mesmo domínio de negócio — suas Entidades, suas Regras, seus Eventos — vive dentro do mesmo Business Hub, nunca disperso entre múltiplos Hubs por conveniência de implementação.

Business First. Um Business Hub é modelado a partir da linguagem e da realidade do negócio que representa, nunca a partir de uma conveniência técnica de implementação que depois se tenta justificar retroativamente como modelo de negócio.

Independent Evolution. Um Business Hub pode ser modificado, estendido ou reimplementado internamente sem exigir mudança coordenada em nenhum outro Hub, desde que seu contrato externo — os Eventos que publica e o formato que consome — permaneça estável.

Event Driven Collaboration. Toda colaboração entre Business Hubs acontece através de Evento publicado e consumido, nunca através de chamada direta que amarre a disponibilidade de um domínio à disponibilidade de outro.

Single Responsibility. Cada Business Hub tem exatamente uma razão de negócio para mudar — uma mudança na forma como a empresa gerencia Cliente nunca deveria, por si só, exigir mudança em como ela gerencia Finança, e vice-versa.

Explicit Boundaries. A fronteira de um Business Hub é documentada e comunicada, nunca deixada implícita ou descoberta apenas através da leitura de código já existente.

Model Before Implementation. O Domain Model de um Business Hub é pensado e validado antes de qualquer implementação técnica começar, mesma disciplina de arquitetura antes de código já estabelecida no Manifesto e reforçada especificamente aqui para modelagem de domínio.

---

## 5. Design Principles

**Business First.** Todo Business Hub nasce de uma capacidade de negócio real, nunca de uma conveniência técnica de organização de código. Se um agrupamento de funcionalidade não corresponde a nenhuma capacidade que uma empresa reconheceria como parte de sua operação, ele não é um Business Hub — é, na melhor das hipóteses, um Platform Service ou um componente de Adaptive Intelligence mal categorizado.

**One Domain, One Owner.** Toda Entidade de negócio pertence a exatamente um Business Hub. Nenhuma exceção é aceita mesmo quando dois Hubs parecem, à primeira vista, ter interesse legítimo sobre a mesma Entidade — detalhado no Capítulo 9.

**Events over Direct Calls.** Colaboração entre Business Hubs acontece por Evento publicado, nunca por chamada síncrona direta a outro domínio — a mesma regra geral já estabelecida em `SYSTEM_BLUEPRINT.md`, Capítulo 8, aqui elevada a princípio inegociável especificamente entre Business Hubs.

**Explicit Contracts.** Toda informação que um Business Hub expõe a outro — através de Evento ou de consulta explícita quando estritamente necessária — segue um Contrato formal e versionado, nunca uma estrutura de dado interna exposta incidentalmente.

**Independent Evolution.** Um Business Hub deve poder ser modificado, reimplementado ou substituído sem exigir mudança coordenada em nenhum outro Hub, desde que seu Contrato externo permaneça estável ou seja migrado através de versão explícita.

**Loose Coupling.** Nenhum Business Hub conhece a implementação interna de outro — apenas o Contrato que ele expõe publicamente.

**High Cohesion.** Toda Entidade, Regra e Evento pertencente a um mesmo domínio de negócio vive dentro do mesmo Business Hub, nunca disperso entre Hubs diferentes.

**Composable Domains.** Um processo de negócio mais amplo — por exemplo, o ciclo completo de Lead a Venda — é composto pela colaboração entre múltiplos Business Hubs através de Evento, nunca implementado como lógica centralizada dentro de um único Hub que conheceria os detalhes internos de todos os demais.

**No Shared Database Ownership.** Nenhum Business Hub acessa diretamente o armazenamento de dado que pertence a outro — mesmo quando, na camada de infraestrutura já descrita em `SYSTEM_BLUEPRINT.md`, ambos compartilham a mesma Data Layer física, cada um acessa exclusivamente sua própria partição lógica de dado.

**Publish Facts, Not Commands.** Um Business Hub publica o que aconteceu — um Fato consumado, já ocorrido —, nunca uma instrução do que outro Hub deveria fazer. A decisão de como reagir a um Fato publicado pertence inteiramente a quem o consome, nunca a quem o publica.

**Consume Events, Don't Poll State.** Um Business Hub que precisa saber sobre uma mudança em outro domínio se inscreve no Evento correspondente, nunca consulta repetidamente o estado daquele outro domínio para detectar mudança.

**Model Before Code.** O Domain Model de um Business Hub — suas Entidades, seus Agregados, suas Regras — é definido e documentado antes de qualquer implementação técnica.

**Clear Ownership.** Toda equipe responsável por um Business Hub sabe, sem ambiguidade, exatamente quais Entidades, Regras e Eventos pertencem à sua responsabilidade e quais pertencem a outro Hub.

**Autonomous Teams.** Uma equipe responsável por um Business Hub deve poder tomar decisão de modelagem interna e de implementação sem depender de aprovação constante de outra equipe, desde que respeite o Contrato externo já estabelecido.

**Backward Compatibility.** Uma mudança no Contrato de um Business Hub nunca quebra silenciosamente o comportamento já esperado por outro Hub consumidor — toda mudança incompatível exige uma nova versão explícita, mesmo princípio já estabelecido em `AUTOMATION_ENGINE.md` e em `INTEGRATION_HUB.md`, aqui aplicado ao contrato entre domínios de negócio.

---

## 6. Arquitetura Conceitual

```
                              Platform
                                 │
                                 ▼
                           Business Hub
              (unidade de domínio de negócio reconhecível)
                                 │
                                 ▼
                              Domain
              (o modelo de negócio interno — Capítulo 7)
                                 │
                                 ▼
                          Capabilities
              (as capacidades de negócio que o domínio expõe
               — Capítulo 12)
                                 │
                                 ▼
                             Entities
              (Agregados, Entidades e Value Objects que
               compõem o Domain Model — Capítulo 7)
                                 │
                                 ▼
                              Events
              (Fatos publicados sobre o que aconteceu
               dentro deste domínio — Capítulo 11)
                                 │
                                 ▼
                            Other Hubs
              (consomem o Evento de forma independente,
               cada um em seu próprio tempo)
```

Este diagrama descreve a estrutura vertical de um único Business Hub: da Platform até o Evento que ele expõe ao restante do sistema. A estrutura horizontal — como múltiplos Business Hubs colaboram entre si sem dependência direta — segue o padrão abaixo:

```
        Hub A                    Hub B                    Hub C
          │                        │                        │
          │  publica Evento        │                        │
          └───────────►  Event Bus  ◄───────────┐            │
                              │                    consome      │
                              │                                 │
                              └────────────────────────────────►│
                                    consome, em seu próprio
                                    tempo e de forma independente

      Nenhuma seta representa uma chamada direta entre Hub A,
      Hub B e Hub C. Toda colaboração passa pelo Event Bus.
```

Nenhum Business Hub, neste segundo diagrama, sabe quais outros Hubs consomem o Evento que publica, nem depende da disponibilidade deles no momento da publicação — a mesma garantia de desacoplamento já estabelecida para toda comunicação entre Hubs em `SYSTEM_BLUEPRINT.md`, Capítulo 8, aqui reafirmada como regra inegociável especificamente entre Business Hubs.

---

## 7. Estrutura Interna de um Business Hub

Domain Model é a representação completa do conhecimento de negócio de um Business Hub — suas Entidades, suas Regras, sua linguagem — expressa de forma que um especialista daquele domínio de negócio a reconheceria como fiel à realidade que descreve.

Business Capabilities são as funções de negócio que o Hub expõe — detalhado no Capítulo 12 — a unidade de granularidade na qual o domínio é dividido para fins de organização e de exposição de contrato.

Aggregates são agrupamentos de Entidades e Value Objects tratados como uma unidade única de consistência — uma mudança dentro de um Aggregate é sempre atômica, nunca parcialmente aplicada, e toda regra de negócio que precisa garantir consistência imediata vive dentro da fronteira de um único Aggregate, nunca espalhada entre múltiplos.

Entities são objetos de negócio com identidade própria e persistente ao longo do tempo — um Cliente, uma Fatura, uma Campanha — cada um pertencente a exatamente um Business Hub conforme o princípio Domain Ownership.

Value Objects são objetos de negócio definidos inteiramente por seus atributos, sem identidade própria — um Endereço, um Intervalo de data, uma Faixa de valor —, imutáveis e comparáveis por valor, não por identidade.

Domain Services encapsulam lógica de negócio que não pertence naturalmente a nenhuma Entidade ou Value Object individual — tipicamente uma regra que envolve múltiplos Aggregates dentro do mesmo Business Hub.

Application Services orquestram um caso de uso completo — recebendo uma Command, coordenando um ou mais Domain Services e Aggregates, e publicando o Evento resultante — sem conter, eles mesmos, regra de negócio substancial, que pertence ao Domain Model propriamente dito.

Policies expressam regra de negócio condicional que determina o que deve acontecer diante de uma situação específica — por exemplo, a Policy que determina quando uma Fatura vencida deve mudar de estado automaticamente.

Specifications expressam critério de negócio reutilizável para avaliar se uma Entidade satisfaz uma condição específica — por exemplo, a Specification que determina se um Cliente é elegível a um benefício, reutilizável em múltiplos contextos dentro do mesmo Hub sem duplicar a lógica de elegibilidade em cada um.

Domain Events são os Fatos de negócio publicados por este Hub, detalhados no Capítulo 11 — a única forma pela qual outro Business Hub toma conhecimento de algo que aconteceu aqui.

Commands representam uma intenção de mudança dentro do domínio — "criar este Cliente", "registrar esta Fatura" — processados pelo Application Service correspondente, e distintos de Domain Event porque um Command ainda não aconteceu, é uma solicitação, enquanto um Evento já é um fato consumado.

Queries representam uma solicitação de leitura de dado já existente, sem intenção de mudança, tipicamente resolvidas contra um Read Model otimizado para consulta, distinto do modelo usado para escrita.

Read Models são representações de dado otimizadas especificamente para consulta, frequentemente desnormalizadas e reconstruídas a partir de Domain Events já publicados, permitindo que a leitura de um domínio seja otimizada de forma independente de como sua escrita é modelada.

Validation garante que uma Command ou uma mudança de estado respeita as Regras do Domain Model antes de ser aplicada, rejeitando de forma explícita qualquer tentativa de mudança que viole uma invariante de negócio.

History preserva o registro de mudança relevante ocorrida dentro de um Aggregate ao longo do tempo, sustentando tanto auditoria quanto, quando aplicável, reconstrução de estado a partir de eventos passados.

Configuration são os parâmetros específicos de comportamento de um Business Hub, ajustáveis por Tenant através da configuração adaptativa já descrita em `SAAS_ARCHITECTURE.md`, sem que isso exija alteração do Domain Model em si.

```
                    ESTRUTURA INTERNA DE UM BUSINESS HUB
   ┌─────────────────────────────────────────────────────────┐
   │  Domain Model                                                │
   │    Aggregates ── Entities ── Value Objects                    │
   │    Domain Services ── Policies ── Specifications                │
   │                                                                │
   │  Application Layer (interna ao Hub)                             │
   │    Application Services ── Commands ── Queries                   │
   │    Read Models ── Validation                                       │
   │                                                                │
   │  Superfície externa                                              │
   │    Domain Events (publicados) ── Configuration (ajustável)        │
   │                                                                │
   │  Suporte                                                         │
   │    History (auditoria e reconstrução de estado)                   │
   └─────────────────────────────────────────────────────────┘
```

Cada um destes elementos tem um limite estrito de responsabilidade, e nenhum deles vaza sua lógica para fora da fronteira do Business Hub ao qual pertence — Aggregates, Entities e Value Objects nunca são compartilhados diretamente entre Hubs; apenas os Domain Events, e ocasionalmente uma Query explícita quando estritamente necessária, atravessam essa fronteira.

---

## 8. Bounded Context

Um Bounded Context é a fronteira dentro da qual um Domain Model é internamente consistente e válido — dentro dessa fronteira, um termo de negócio tem exatamente um significado; fora dela, o mesmo termo pode significar algo diferente, e essa diferença é uma propriedade aceitável da arquitetura, nunca um erro a ser corrigido forçando um vocabulário universal único.

Como definir um Bounded Context começa por identificar a capacidade de negócio central que um Hub existe para servir, e delimitar exatamente quais Entidades e Regras são necessárias para servir essa capacidade de forma completa e autônoma — nunca incluindo, dentro da fronteira, uma Entidade que pertence naturalmente à capacidade central de outro Hub.

Como proteger um Bounded Context depende de duas disciplinas: primeiro, garantir que nenhum código externo ao Hub acesse diretamente seu Domain Model interno — apenas seu Contrato publicado; segundo, aplicar um Anti-Corruption Layer, detalhado no Capítulo 10, sempre que o Hub precisa consumir informação vinda de outro domínio, traduzindo-a para dentro de sua própria linguagem, em vez de importar diretamente o vocabulário e a estrutura do domínio de origem.

Como evoluir um Bounded Context ao longo do tempo — adicionando nova Entidade, nova Regra, ou até redefinindo uma Entidade já existente — é uma decisão inteiramente interna ao Hub responsável, desde que o Contrato externo publicado permaneça estável ou seja versionado conforme o Capítulo 10; nenhuma mudança interna a um Bounded Context exige aprovação de outro Hub, precisamente porque a fronteira já isola o impacto dessa mudança.

Como evitar sobreposição entre Bounded Contexts exige que, antes de adicionar uma nova Entidade a um Hub, sua equipe verifique explicitamente se aquela Entidade já pertence, ou deveria pertencer, a outro Hub já existente — o checklist do Capítulo 17 formaliza essa verificação como etapa obrigatória.

Exemplo: o termo "Cliente" dentro do Bounded Context do CRM Hub representa uma pessoa ou organização com histórico de relacionamento, estágio de funil e canal de origem — o que importa para gerir esse relacionamento. O mesmo termo "Cliente" dentro do Bounded Context do Finance Hub representa uma entidade com histórico de transação, situação de pagamento e limite de crédito — o que importa para gerir a saúde financeira daquela relação. Nenhuma das duas definições está errada; cada uma é correta e completa dentro de seu próprio Bounded Context. O que as conecta não é uma Entidade compartilhada e mutuamente acessada, mas um identificador comum e Eventos publicados por cada Hub, consumidos pelo outro quando relevante — detalhado nos Capítulos 9 e 10.

Um erro comum ao definir um Bounded Context é tentar resolver essa aparente duplicação de significado unificando as duas definições em uma única Entidade "Cliente" universal, compartilhada por todos os Hubs que a mencionam. Esse instinto, embora compreensível, produz exatamente o problema que a arquitetura de Bounded Context existe para evitar: uma Entidade universal, para servir a todos os domínios simultaneamente, tende a acumular campo e regra de cada domínio que a consome, tornando-se cada vez mais complexa, cada vez mais difícil de evoluir sem quebrar algum consumidor, e sem nenhum proprietário claro o suficiente para decidir, com autoridade, se uma mudança proposta é ou não aceitável. A disciplina correta é a oposta: aceitar que "Cliente" significa coisas diferentes, ainda que relacionadas, em contextos diferentes, e conectar essas diferentes representações através de identificador comum e de Evento, nunca através de uma única definição forçada a servir a todos.

---

## 9. Domain Ownership

Cada Entidade de negócio possui um único proprietário — o Business Hub responsável por sua definição completa, sua Regra de negócio, e toda mudança de seu estado ao longo do tempo. Nenhuma exceção a esta regra é aceita, mesmo quando múltiplos Hubs têm interesse legítimo em uma mesma Entidade.

```
                        DOMAIN OWNERSHIP
   ┌───────────────────────────────────────────────────────────┐
   │  CRM Hub            → dono de Customer                       │
   │  Finance Hub        → dono de Invoice                          │
   │  Communication Hub  → dono de Message                           │
   │  Analytics Hub      → dono de Metrics                             │
   │  Growth Hub         → dono de Campaign                              │
   └───────────────────────────────────────────────────────────┘
```

O CRM Hub é o único proprietário de Customer, no sentido de relacionamento — estágio de funil, canal de origem, histórico de interação. Quando o Finance Hub precisa saber algo sobre esse mesmo Cliente do ponto de vista financeiro, ele não lê a Entidade Customer do CRM Hub diretamente — ele mantém sua própria Entidade, tipicamente chamada Account ou um nome equivalente dentro de seu próprio Bounded Context, referenciando o Cliente por identificador comum e enriquecida por Evento consumido do CRM Hub quando relevante, nunca por acesso direto à Entidade de origem.

O Finance Hub é o único proprietário de Invoice — sua estrutura, seu ciclo de vida, sua regra de vencimento. Nenhum outro Hub cria ou altera uma Invoice diretamente; um Workflow do Automation Engine que precisa reagir a uma fatura vencida, já exemplificado em `AUTOMATION_ENGINE.md`, consome o Evento publicado pelo Finance Hub, nunca manipula a Invoice em si.

O Communication Hub é o único proprietário de Message — o registro de toda comunicação enviada ou recebida em qualquer canal. O CRM Hub, ao exibir o histórico de interação com um Cliente, consome o Evento ou a Query explícita já exposta pelo Communication Hub, nunca mantém sua própria cópia paralela do conteúdo de mensagem.

O Analytics Hub é o único proprietário de Metrics — o indicador consolidado calculado a partir de Evento publicado por todos os demais Hubs. Nenhum outro Hub calcula, ele mesmo, um indicador que deveria ser responsabilidade do Analytics Hub, mesmo quando teria acesso técnico facilitado ao dado bruto necessário para esse cálculo.

O Growth Hub é o único proprietário de Campaign — sua estrutura, seu orçamento, seu ciclo de aprovação. O Finance Hub, ao registrar o custo de uma Campanha, consome o Evento publicado pelo Growth Hub, nunca acessa a Entidade Campaign diretamente para extrair esse dado.

Regras para evitar duplicação: antes de modelar uma nova Entidade em qualquer Business Hub, a pergunta obrigatória é "esta Entidade já é, ou deveria ser, propriedade de outro Hub existente?". Se a resposta for afirmativa, o Hub em consideração nunca duplica essa Entidade — ele consome o Evento publicado pelo proprietário legítimo, ou, quando precisa manter uma referência local mínima para sua própria operação, mantém apenas o identificador e os atributos estritamente necessários ao seu próprio Bounded Context, nunca uma cópia completa e paralela da Entidade original.

Um teste prático para decidir proprietário, útil quando a resposta não é imediatamente óbvia, é perguntar: qual Hub seria responsável por rejeitar uma mudança de estado inválida desta Entidade, aplicando a Regra de negócio que a governa? A resposta a essa pergunta, quase sempre, revela o proprietário correto. Uma mudança de estágio de funil de um Cliente só pode ser validada por quem entende a Regra de progressão daquele funil — o CRM Hub. Uma mudança de situação de pagamento de uma Fatura só pode ser validada por quem entende a Regra de conciliação financeira — o Finance Hub. Quando dois Hubs parecem, ambos, capazes de validar a mesma mudança, isso é sinal de que a Entidade em questão foi modelada de forma ampla demais, e provavelmente deveria ser decomposta em duas Entidades distintas, uma em cada Bounded Context, conectadas por identificador comum, em vez de forçosamente unificada sob um único proprietário que não cobre integralmente nenhuma das duas responsabilidades.

---

## 10. Comunicação entre Hubs

Eventos são o mecanismo primário e preferencial de comunicação entre Business Hubs, detalhados em profundidade no Capítulo 11 — nenhuma exceção a essa preferência é aceita sem justificativa explícita registrada como Architecture Decision Record.

Contratos formalizam o formato de todo Evento e de toda Query eventualmente exposta entre Hubs, versionados conforme já estabelecido no princípio Backward Compatibility do Capítulo 5.

Mensagens, neste contexto, são a unidade técnica de transporte de um Evento através do Event Bus já descrito em `SYSTEM_BLUEPRINT.md`, Capítulo 7 — este documento não redefine essa infraestrutura, apenas a consome.

Versionamento de Contrato entre Business Hubs segue o mesmo princípio já estabelecido em `AUTOMATION_ENGINE.md` e em `INTEGRATION_HUB.md` — uma mudança incompatível no formato de um Evento publicado exige uma nova versão explícita, nunca uma alteração silenciosa do formato já esperado por consumidores existentes.

Consistência eventual é a propriedade aceita e esperada de toda comunicação entre Business Hubs: quando o Growth Hub publica um Evento de Campanha criada, o Finance Hub não reflete esse custo instantaneamente — reflete assim que consome o Evento, dentro de um intervalo curto, mas não nulo. Nenhum Business Hub deve depender de consistência imediata entre domínios distintos; consistência imediata só é garantida dentro da fronteira de um único Aggregate, conforme já descrito no Capítulo 7.

Idempotência, já estabelecida como princípio central em `AUTOMATION_ENGINE.md` e em `INTEGRATION_HUB.md`, aplica-se integralmente à comunicação entre Business Hubs: o consumo repetido de um mesmo Evento, por qualquer motivo técnico, nunca produz efeito colateral duplicado dentro do Hub consumidor.

Anti-Corruption Layer é a camada de tradução que um Business Hub aplica ao consumir informação vinda de outro domínio, convertendo-a para dentro de sua própria linguagem e de seu próprio modelo, em vez de importar diretamente o vocabulário e a estrutura do domínio de origem. Quando o Finance Hub consome um Evento de Cliente criado no CRM Hub, ele não adota a Entidade Customer do CRM Hub tal como ela é — ele traduz o que é relevante para sua própria noção de Account, através de uma Anti-Corruption Layer que isola seu próprio Domain Model de qualquer mudança futura na modelagem interna do CRM Hub que não afete o Contrato publicado.

```
                    ANTI-CORRUPTION LAYER
   ┌───────────────────────────────────────────────────────────┐
   │  CRM Hub                                                      │
   │  (Domain Model próprio: Customer, Lead, Stage)                  │
   │       │                                                        │
   │       │  publica evento CustomerCreated (Contrato estável)       │
   │       ▼                                                        │
   │  Anti-Corruption Layer (dentro do Finance Hub)                   │
   │  (traduz o Evento recebido para o vocabulário próprio             │
   │   do Finance Hub, nunca importa Customer diretamente)              │
   │       │                                                        │
   │       ▼                                                        │
   │  Finance Hub                                                    │
   │  (Domain Model próprio: Account, Invoice, Payment)                │
   └───────────────────────────────────────────────────────────┘
```

Chamadas diretas entre domínios são evitadas sempre que possível, e reservadas apenas para o pequeno conjunto de exceções já explicitamente registradas como tal em `SYSTEM_BLUEPRINT.md`, Capítulo 8 — comunicação com Platform Services e com Adaptive Intelligence, nunca entre dois Business Hubs entre si.

---

## 11. Eventos do Domínio

Evento é o registro formal e imutável de que algo relevante aconteceu dentro de um Business Hub, publicado para que qualquer outro Hub interessado possa reagir, sem que o publicador precise conhecer quem reage.

Fato é a natureza fundamental de todo Evento de domínio: ele descreve algo que já aconteceu, de forma irrevogável — "o Cliente foi criado", "a Fatura foi paga" —, nunca uma instrução do que fazer a seguir, aplicação direta do princípio Publish Facts, Not Commands já descrito no Capítulo 5.

Notificação é o mecanismo técnico de entrega de um Evento a seus consumidores, através do Event Bus já descrito em `SYSTEM_BLUEPRINT.md`.

Integração, neste contexto, refere-se à forma como um Business Hub consome Evento publicado por outro para manter sua própria Anti-Corruption Layer e seu próprio Read Model atualizados, sem se confundir com a integração externa já detalhada em `INTEGRATION_HUB.md`, que trata de comunicação com sistema fora da plataforma, não entre Hubs internos.

Versionamento de Evento segue o mesmo princípio já estabelecido no Capítulo 10 — uma mudança de estrutura em um Evento já publicado e consumido por outros Hubs exige nova versão, nunca alteração retroativa do formato já esperado.

Compatibilidade entre versões de um mesmo Evento é preservada sempre que tecnicamente possível — um consumidor ainda operando contra uma versão anterior de um Evento deve continuar funcionando corretamente até que seja explicitamente migrado, nunca quebrado silenciosamente por uma nova versão publicada pelo Hub de origem.

Publicação de um Evento acontece no momento em que uma mudança de estado relevante é confirmada dentro de um Aggregate, nunca antes dessa confirmação — um Evento nunca descreve uma intenção, apenas um Fato já consumado.

Consumo de um Evento por outro Business Hub é sempre assíncrono e independente — o Hub consumidor processa o Evento em seu próprio tempo, sem bloquear o Hub publicador, e sem que o publicador espere qualquer confirmação de processamento antes de prosseguir com sua própria operação.

Replay permite que um Business Hub reprocesse um Evento já publicado anteriormente — relevante quando um novo consumidor é adicionado e precisa reconstruir estado a partir de histórico já ocorrido, ou quando uma correção de lógica de consumo exige reprocessar Eventos passados, sempre respeitando Idempotência.

Dead Letter recebe todo Evento que um Hub consumidor falhou em processar de forma definitiva, mesmo componente conceitual já descrito em `AUTOMATION_ENGINE.md` e em `INTEGRATION_HUB.md`, aqui aplicado especificamente a falha de consumo de Evento de domínio entre Business Hubs.

Governança de Evento garante que todo novo tipo de Evento seja registrado formalmente, com seu Contrato documentado, antes de ser publicado em produção — nenhum Business Hub introduz um novo Evento de forma ad hoc, sem que os potenciais consumidores tenham visibilidade de sua existência e de sua estrutura.

---

## 12. Capacidades de Negócio

Um Business Hub é dividido em Capacidades de Negócio — unidades coerentes de função que, juntas, compõem o domínio completo daquele Hub. Uma Capacidade de Negócio é maior que um único caso de uso individual, mas menor que o Hub inteiro — a granularidade na qual o domínio é organizado e, quando aplicável, exposto como Contrato a outros consumidores.

O CRM Hub, por exemplo, se divide em Capacidades como Captura de Lead, Gestão de Funil, Histórico de Relacionamento e Segmentação de Cliente — cada uma com seu próprio conjunto de Aggregates e Regras, mas todas compartilhando o mesmo Bounded Context e a mesma linguagem de negócio central daquele Hub.

O Finance Hub se divide em Capacidades como Faturamento, Conciliação de Pagamento, Fluxo de Caixa e Relatório Financeiro.

O Growth Hub se divide em Capacidades como Gestão de Campanha, Otimização de Conteúdo e Atribuição de Conversão.

Cada Capacidade de Negócio, embora modelada dentro do mesmo Business Hub, mantém sua própria coesão interna — Aggregates de uma Capacidade raramente precisam ser consultados diretamente por Aggregates de outra Capacidade dentro do mesmo Hub, e quando precisam, essa comunicação ainda acontece através de Domain Service explícito, nunca por acoplamento implícito.

```
                    CAPACIDADES DE NEGÓCIO (exemplo: CRM Hub)
   ┌───────────────────────────────────────────────────────────┐
   │  CRM Hub                                                      │
   │       │                                                        │
   │       ├── Captura de Lead                                       │
   │       ├── Gestão de Funil                                        │
   │       ├── Histórico de Relacionamento                              │
   │       └── Segmentação de Cliente                                   │
   │                                                                │
   │  Cada Capacidade tem seus próprios Aggregates e Regras,          │
   │  mas todas compartilham o mesmo Bounded Context do CRM Hub        │
   └───────────────────────────────────────────────────────────┘
```

A divisão em Capacidades de Negócio não cria novos limites de comunicação — Eventos e Anti-Corruption Layer continuam existindo apenas na fronteira entre Business Hubs distintos, nunca entre Capacidades diferentes dentro do mesmo Hub, que permanecem livres para colaborar diretamente entre si dentro do mesmo Bounded Context.

---

## 13. Evolução Independente

Um Business Hub evolui de forma independente quando sua equipe pode adicionar nova Entidade, nova Regra, ou até reestruturar completamente seu Domain Model interno, sem exigir aprovação ou coordenação de nenhuma outra equipe responsável por outro Hub — desde que o Contrato externo permaneça estável ou seja versionado conforme já estabelecido no Capítulo 10.

Essa independência é viabilizada por três propriedades já descritas anteriormente neste documento, operando em conjunto: Domain Ownership garante que nenhum outro Hub depende de acesso direto à estrutura interna de quem evolui; Bounded Context garante que a mudança interna não vaza para fora da fronteira do Hub; e comunicação exclusivamente por Evento garante que consumidores externos reagem ao Contrato publicado, não à implementação interna que o produz.

Uma consequência direta dessa independência é que um Business Hub pode ser completamente reimplementado — mudança de estrutura de dado interna, mudança de linguagem de programação, mudança de abordagem de modelagem — sem que nenhum outro Hub precise sequer perceber que essa reimplementação aconteceu, desde que os Eventos publicados continuem seguindo o mesmo Contrato já estabelecido, ou uma nova versão explícita seja introduzida com o devido período de transição.

Isso também significa que diferentes Business Hubs podem evoluir em ritmos completamente diferentes — o CRM Hub podendo passar por uma reformulação significativa de seu Domain Model em um trimestre específico, enquanto o Finance Hub permanece estável, sem que essa diferença de ritmo produza qualquer fricção entre os dois, precisamente porque nenhum depende da estabilidade interna do outro, apenas da estabilidade de seu Contrato publicado.

---

## 14. Integração com Platform Services

Todo Business Hub consome os Platform Services e a Adaptive Intelligence já descritos em seus respectivos documentos, exatamente da mesma forma, sem que nenhuma dessas integrações exija modelagem especial dentro deste documento — apenas a referência ao já estabelecido.

O AI Hub é consumido por todo Business Hub que precisa de capacidade de inteligência artificial, através do contrato já detalhado em `AI_HUB.md` — nenhum Business Hub implementa lógica de inteligência própria.

O Automation Engine é consumido por todo Business Hub que precisa reagir a Evento de forma condicional e automatizada, através do modelo de Workflow já detalhado em `AUTOMATION_ENGINE.md` — a orquestração entre múltiplos Business Hubs através de automação acontece nessa camada, nunca implementada como lógica direta dentro de um Business Hub específico.

O Identity Hub é consumido por todo Business Hub para autenticação e autorização de toda operação sobre suas próprias Entidades, através do modelo já detalhado em `IDENTITY_HUB.md` — nenhum Business Hub implementa sua própria verificação de Permissão.

O Knowledge Hub é consumido por todo Business Hub que precisa armazenar ou consultar conhecimento não estruturado como parte de sua operação, através do modelo já detalhado em `KNOWLEDGE_HUB.md`.

O Integration Hub é consumido por todo Business Hub que precisa se comunicar com um sistema externo, através do modelo já detalhado em `INTEGRATION_HUB.md` — nenhum Business Hub implementa sua própria integração direta com um Provider externo.

O Business Profile Engine informa todo Business Hub sobre o Segmento, a Maturidade e os Objetivos da Empresa, através do evento `ProfileChanged` já descrito em `SYSTEM_BLUEPRINT.md` e detalhado em `BUSINESS_PROFILE_ENGINE.md` — um Business Hub consome essa informação para calibrar sua própria Configuration, nunca reimplementa lógica de classificação de negócio.

O Branding Hub informa todo Business Hub que produz comunicação ou documento em nome de uma Empresa sobre sua identidade de marca, através do modelo já detalhado em `BRANDING_HUB.md` — nenhum Business Hub gera ou armazena elemento de identidade visual próprio.

A regra geral que atravessa todas essas sete integrações é a mesma já estabelecida em cada um dos documentos proprietários: o Business Hub consumidor solicita uma capacidade em termos de negócio, e o Platform Service ou o componente de Adaptive Intelligence correspondente decide, internamente, como atendê-la — nunca o inverso, e nunca uma reimplementação paralela dessa capacidade dentro do próprio Business Hub.

---

## 15. Observabilidade

Logs de um Business Hub registram toda mudança relevante de Aggregate e toda execução de Application Service, com o mesmo padrão estrutural já estabelecido em `SYSTEM_BLUEPRINT.md`, Capítulo 13.

Eventos publicados e consumidos por um Business Hub são, eles mesmos, um registro observável de primeira classe — a sequência de Eventos de um Aggregate específico, ao longo do tempo, reconstrói sua história completa de mudança de estado.

Tracing conecta o processamento de um Command, a mudança de Aggregate resultante, e o Evento publicado em consequência, em uma linha de execução completa e navegável, permitindo reconstruir exatamente o que um Business Hub fez em resposta a uma solicitação específica.

Métricas agregam volume de Command processado, taxa de sucesso e de falha de Validation, e distribuição de tempo de processamento por Capacidade de Negócio, informando tanto a saúde técnica quanto o volume real de operação daquele domínio.

Auditoria preserva o registro imutável de toda mudança relevante de Entidade dentro do Hub, sustentada pelo History já descrito no Capítulo 7, alinhado ao mesmo padrão de auditoria imutável já estabelecido em toda a plataforma.

Health Checks reportam a disponibilidade operacional de cada Business Hub de forma independente, permitindo que a indisponibilidade momentânea de um domínio específico seja identificada sem confundir sua causa com a de outro domínio completamente não relacionado.

SLIs — Service Level Indicators — são as métricas específicas que um Business Hub escolhe monitorar como representativas de sua própria saúde operacional — por exemplo, o tempo de processamento de um Command de criação de Fatura no Finance Hub, ou a taxa de sucesso de captura de Lead no CRM Hub.

SLOs — Service Level Objectives — são os objetivos internos definidos sobre cada SLI, específicos à natureza de negócio daquele Business Hub — um SLO de latência aceitável para o CRM Hub pode ser completamente diferente do SLO aceitável para o Analytics Hub, que tipicamente processa volume maior de dado em operação de natureza mais agregada e menos imediatamente interativa.

Um ponto de atenção específico deste capítulo, sem equivalente direto em nenhum dos Hubs de natureza técnica já documentados, é que a observabilidade de um Business Hub precisa ser lida em dois níveis simultâneos e complementares: o nível técnico, comum a qualquer componente de software — latência, taxa de erro, disponibilidade —, e o nível de negócio, específico à natureza daquele domínio — quantos Leads foram capturados, quantas Faturas foram emitidas, quantas Campanhas estão ativas. Um Business Hub tecnicamente saudável, com toda métrica de infraestrutura dentro do esperado, ainda pode estar operando mal do ponto de vista de negócio — por exemplo, processando toda solicitação corretamente e dentro do prazo, mas com um volume de captura de Lead muito abaixo do esperado para aquele período. Por isso, todo Business Hub deve expor, além das métricas técnicas comuns já descritas em `SYSTEM_BLUEPRINT.md`, um conjunto próprio de indicadores de negócio consumidos pelo Analytics Hub, conforme já exemplificado no Capítulo 18 — a observabilidade puramente técnica, sozinha, nunca é suficiente para um Business Hub, exatamente porque ele existe para representar uma capacidade de negócio, não apenas um serviço técnico.

---

## 16. Escalabilidade

Separação por domínio é a propriedade fundamental que viabiliza toda a escalabilidade descrita nesta seção: como cada Business Hub mantém sua própria fronteira de dado e de processamento, o volume de operação de um domínio específico nunca compete diretamente pelo mesmo recurso que o volume de outro domínio, além do que é inerentemente compartilhado na Infrastructure Layer já descrita em `SYSTEM_BLUEPRINT.md`.

Escalabilidade independente significa que o CRM Hub, sob um volume excepcional de novo Lead capturado durante uma campanha de grande sucesso, pode escalar sua própria capacidade de processamento sem exigir que o Finance Hub, operando em volume normal no mesmo momento, escale junto — cada domínio escala de acordo com sua própria demanda real.

Deploy independente, no nível conceitual tratado por este documento, significa que uma nova versão do Domain Model interno de um Business Hub pode ser colocada em produção sem exigir coordenação de implantação simultânea com nenhum outro Hub, desde que seu Contrato externo permaneça compatível — a mesma independência de evolução já descrita no Capítulo 13, aplicada especificamente ao momento de colocação em produção.

Versionamento, já descrito nos Capítulos 10 e 11, é o mecanismo que torna esse deploy independente seguro — múltiplas versões de Contrato podem coexistir durante um período de transição, permitindo que consumidores migrem em seu próprio ritmo.

Processamento paralelo permite que múltiplos Commands, dirigidos a Aggregates diferentes dentro do mesmo Business Hub, sejam processados simultaneamente sem interferência mútua — a consistência imediata garantida pelo Aggregate, já descrita no Capítulo 7, se aplica apenas dentro da fronteira de um único Aggregate específico, nunca exigindo serialização de todo o processamento de um Hub inteiro.

---

## 17. Modelo para Novos Hubs

Todo novo Business Hub, antes de ser aceito na plataforma, deve demonstrar conformidade com o checklist arquitetural abaixo.

```
                  CHECKLIST ARQUITETURAL — NOVO BUSINESS HUB
   ┌───────────────────────────────────────────────────────────┐
   │ [ ] Representa uma Capacidade de negócio reconhecível pelo    │
   │     cliente, não uma conveniência técnica (Capítulo 1)          │
   │                                                                │
   │ [ ] Bounded Context definido e documentado, sem sobreposição    │
   │     com nenhum Business Hub já existente (Capítulo 8)            │
   │                                                                │
   │ [ ] Toda Entidade nova verificada contra Domain Ownership        │
   │     já existente antes de ser modelada (Capítulo 9)               │
   │                                                                │
   │ [ ] Domain Model completo — Aggregates, Entities, Value          │
   │     Objects, Domain Services, Policies — documentado antes        │
   │     de qualquer implementação (Capítulo 7)                         │
   │                                                                │
   │ [ ] Nenhuma chamada direta planejada a outro Business Hub;         │
   │     toda colaboração modelada como Evento (Capítulo 10)             │
   │                                                                │
   │ [ ] Catálogo de Domain Events definido e documentado antes          │
   │     da primeira publicação em produção (Capítulo 11)                 │
   │                                                                │
   │ [ ] Anti-Corruption Layer definida para todo Evento externo           │
   │     consumido de outro Hub (Capítulo 10)                                │
   │                                                                │
   │ [ ] Integração com Platform Services e Adaptive Intelligence            │
   │     realizada exclusivamente através dos contratos já                    │
   │     estabelecidos, sem reimplementação paralela (Capítulo 14)              │
   │                                                                │
   │ [ ] Observabilidade — Logs, Tracing, Métricas, SLIs e SLOs                 │
   │     — definida antes da primeira operação em produção                       │
   │     (Capítulo 15)                                                              │
   │                                                                │
   │ [ ] Estratégia de versionamento de Contrato documentada antes                 │
   │     de qualquer consumidor externo depender dele (Capítulos                    │
   │     10 e 11)                                                                     │
   └───────────────────────────────────────────────────────────┘
```

Nenhum item deste checklist é opcional. Um Business Hub proposto que não atenda a qualquer um destes dez pontos não está pronto para ser aceito na plataforma — a resposta correta, nesse cenário, é completar a modelagem pendente antes de qualquer implementação, nunca implementar primeiro e documentar depois, aplicação direta do princípio Model Before Implementation já descrito no Capítulo 4.

---

## 18. Casos de Uso

**CRM.** O CRM Hub captura um novo Lead através de um formulário de Landing Page. O Application Service correspondente processa o Command de criação, o Aggregate Customer é criado dentro do seu próprio Bounded Context, e o Evento `LeadCreated` é publicado. O CRM Hub nunca notifica diretamente o Finance Hub ou o Analytics Hub sobre essa criação — ambos consomem o mesmo Evento, cada um em seu próprio tempo, através do Event Bus, exatamente conforme o padrão já descrito no Capítulo 10.

**Finance.** O Finance Hub consome o Evento `PaymentReceived`, já originado de um Connector externo através do Integration Hub conforme já descrito em `INTEGRATION_HUB.md`, e atualiza seu próprio Aggregate Invoice. O Finance Hub nunca acessa diretamente nenhuma Entidade do CRM Hub para determinar a quem essa Fatura pertence — ele mantém sua própria referência de Account, já enriquecida anteriormente por um Evento consumido do CRM Hub através de sua própria Anti-Corruption Layer.

**Communication.** O Communication Hub recebe uma mensagem de Cliente através de um canal externo, mediado pelo Integration Hub. O Aggregate Message é criado dentro do Bounded Context do Communication Hub, e o Evento `MessageReceived` é publicado. O CRM Hub, ao consumir esse Evento, atualiza seu próprio registro de última interação com aquele Cliente — mas o conteúdo completo da mensagem permanece propriedade exclusiva do Communication Hub, consultável pelo CRM Hub apenas através de uma Query explícita quando necessário, nunca por acesso direto ao Aggregate Message.

**Growth.** O Growth Hub cria uma nova Campanha, seu próprio Aggregate dentro de seu Bounded Context, e publica o Evento `CampaignPublished` já descrito em `SYSTEM_BLUEPRINT.md`. O Finance Hub consome esse Evento para registrar o custo de mídia previsto, sem nunca ter acesso direto à estrutura interna de segmentação ou de criativo que o Growth Hub mantém como parte de seu próprio Domain Model — apenas ao subconjunto de informação exposto pelo Contrato daquele Evento específico.

**Analytics.** O Analytics Hub não possui Aggregate de negócio primário no mesmo sentido que os demais Hubs — sua Capacidade central é consumir Evento de todos os outros Business Hubs e produzir Read Model agregado, a Entidade Metrics já descrita no Capítulo 9. Nenhum outro Hub calcula, ele mesmo, um indicador consolidado; todos publicam Evento, e o Analytics Hub é o único proprietário responsável por transformar esse conjunto de Fatos em indicador de negócio consultável.

Em todos os cinco casos, o padrão se repete sem exceção: cada Business Hub processa Command dentro de sua própria fronteira, publica Evento como Fato consumado, e qualquer outro Hub interessado consome esse Evento de forma independente, através de sua própria Anti-Corruption Layer quando aplicável — nunca através de acesso direto à Entidade de origem.

---

## 19. Roadmap

O roadmap de novos Business Hubs não é um roadmap de arquitetura — é um roadmap de expansão de domínio de negócio, cada novo Hub seguindo integralmente o padrão já estabelecido neste documento, sem exigir nenhuma extensão ou exceção arquitetural para ser aceito.

Projects Hub representaria o domínio de gestão de projeto e de entrega, com Aggregates como Project e Task, publicando Evento consumido pelo Analytics Hub para indicador de produtividade e pelo Automation Engine para lembrete de prazo.

HR Hub representaria o domínio de gestão de pessoas, com Aggregates como Employee e Payroll, mantendo Domain Ownership claro sobre dado de colaborador que hoje poderia, incorretamente, ser tentador modelar dentro do Identity Hub — uma distinção importante, já que Identity Hub trata de autenticação e Permissão de acesso à plataforma, enquanto HR Hub trataria da relação de trabalho em si, um domínio de negócio completamente distinto.

Inventory Hub representaria o domínio de gestão de estoque, com Aggregates como Product e StockLevel, publicando Evento consumido pelo Growth Hub para disponibilidade de Catálogo e pelo Finance Hub para custo de produto.

Legal Hub representaria o domínio de gestão de contrato e de conformidade, com Aggregates como Contract e Obligation, frequentemente consumindo conhecimento já armazenado no Knowledge Hub — Contrato como Documento — mas mantendo seu próprio Domain Model sobre o ciclo de vida jurídico daquele Contrato, distinto do armazenamento de conhecimento em si.

Supplier Hub representaria o domínio de gestão de fornecedor, com Aggregates como Supplier e PurchaseOrder, colaborando com o Inventory Hub e o Finance Hub através de Evento.

Document Hub, se necessário como domínio de negócio distinto do Knowledge Hub, trataria especificamente de documento com ciclo de vida de negócio próprio — como uma Nota Fiscal ou um Comprovante — versus o Knowledge Hub, que trata de conhecimento consultável, uma distinção que qualquer novo Hub proposto precisa esclarecer explicitamente no momento de sua modelagem, conforme o checklist do Capítulo 17.

Field Service Hub representaria o domínio de gestão de atendimento em campo, com Aggregates como WorkOrder e Technician, relevante para Empresas cujo Business Profile Engine identifica operação com componente de serviço presencial.

E-commerce Hub representaria o domínio de venda direta ao consumidor através de loja própria, com Aggregates como Order e Cart, distinto do Growth Hub, que trata de aquisição e conteúdo, não da transação de venda em si.

Cada um desses Hubs futuros, ao ser efetivamente proposto para desenvolvimento, deve passar pelo mesmo checklist arquitetural do Capítulo 17 antes de qualquer implementação — nenhum novo domínio de negócio é adicionado à plataforma por exceção ou por urgência de prazo comercial que justifique pular a modelagem prévia.

Este roadmap também ilustra, de forma concreta, por que a distinção entre as três categorias de componente descritas no Capítulo 1 precisa ser aplicada com disciplina a cada novo Hub proposto, não apenas aos já existentes. O exemplo do Document Hub, mencionado acima, é deliberadamente o mais ambíguo dos oito: é tentador propor um "Document Hub" genérico sem clareza sobre se ele seria um Business Hub — um domínio de negócio com ciclo de vida próprio, como Nota Fiscal — ou uma extensão do Knowledge Hub, que já é um Platform Service dedicado a conhecimento consultável. A resposta correta não é arquitetural no sentido técnico, é conceitual: se o "documento" em questão tem Regra de negócio própria, estado que muda ao longo de um processo de negócio, e Eventos que outros Business Hubs precisam consumir, ele é candidato a Business Hub. Se o "documento" é, em vez disso, conteúdo consultável que enriquece uma resposta de IA ou uma decisão humana, ele pertence ao Knowledge Hub, já detalhado em `KNOWLEDGE_HUB.md`. Essa mesma pergunta — Capacidade de negócio reconhecível versus capacidade técnica transversal — deve ser respondida explicitamente, como parte do checklist do Capítulo 17, para qualquer novo Hub proposto, não apenas para os oito exemplos aqui listados.

---

## 20. Architecture Decision Records

**ADR-001 — Todo domínio possui um único proprietário.** Nenhuma Entidade de negócio pertence a mais de um Business Hub. Contexto: aplicação direta do princípio One Domain, One Owner; condição estrutural mínima para que Domain Ownership, descrito no Capítulo 9, seja sequer possível de aplicar.

**ADR-002 — Business Hubs comunicam-se preferencialmente por eventos, nunca por chamada direta entre si.** Toda colaboração entre dois Business Hubs acontece através do Event Bus. Contexto: aplicação do princípio Events over Direct Calls; alternativa descartada — permitir chamada síncrona direta para casos considerados "simples", rejeitada por criar precedente que corroeria a regra ao longo do tempo, mesmo raciocínio já registrado em `AI_HUB.md`, ADR-001, e em `INTEGRATION_HUB.md`, ADR-001.

**ADR-003 — Nenhuma entidade possui múltiplos proprietários, mesmo quando dois Hubs têm interesse legítimo sobre ela.** Cada Hub interessado mantém sua própria referência local, enriquecida por Evento, nunca acesso compartilhado à Entidade original. Contexto: prevenir exatamente o problema de "entidades compartilhadas" descrito no Capítulo 3.

**ADR-004 — Toda integração entre Hubs respeita contratos explícitos e versionados.** Nenhum Evento é consumido por um Hub externo sem que seu Contrato tenha sido formalmente documentado. Contexto: aplicação do princípio Explicit Contracts; sustenta a Governança de Evento já descrita no Capítulo 11.

**ADR-005 — Todo novo Hub deve seguir BUSINESS_HUB_ARCHITECTURE.md, sem exceção.** Nenhum Business Hub é aceito na plataforma sem conformidade demonstrada ao checklist do Capítulo 17. Contexto: este documento é, ele mesmo, a condição de aceitação de qualquer novo domínio de negócio.

**ADR-006 — Anti-Corruption Layer é obrigatória para todo consumo de Evento externo a um Business Hub.** Nenhum Hub importa diretamente o vocabulário ou a estrutura de dado de outro domínio. Contexto: aplicação do princípio Bounded Context; sem essa camada de tradução, uma mudança interna em um Hub de origem se propagaria como mudança forçada em todo consumidor, eliminando a independência de evolução já descrita no Capítulo 13.

**ADR-007 — Um Business Hub nunca acessa diretamente o armazenamento de dado de outro, mesmo sob infraestrutura física compartilhada.** Contexto: aplicação do princípio No Shared Database Ownership; mesmo raciocínio de isolamento lógico já estabelecido para Tenant em `SAAS_ARCHITECTURE.md`, Capítulo 6, aqui aplicado entre domínios de negócio dentro do mesmo Tenant.

**ADR-008 — Todo Evento de domínio publicado descreve um Fato já consumado, nunca uma instrução de ação futura.** Contexto: aplicação do princípio Publish Facts, Not Commands; preserva o desacoplamento entre publicador e consumidor, já que uma instrução implicaria conhecimento prévio, por parte do publicador, de quem deveria executá-la.

**ADR-009 — Consumo de mudança de estado de outro Hub acontece exclusivamente por inscrição em Evento, nunca por consulta repetida ao estado daquele Hub.** Contexto: aplicação do princípio Consume Events, Don't Poll State; consulta repetida introduziria acoplamento temporal e carga desnecessária sobre o Hub de origem.

**ADR-010 — O Domain Model de um novo Business Hub é documentado e validado antes de qualquer implementação técnica.** Contexto: aplicação do princípio Model Before Code; mesma disciplina de arquitetura antes de código já estabelecida no Manifesto, aqui tornada condição de aceitação explícita para modelagem de domínio.

**ADR-011 — Mudança incompatível em um Contrato de Evento exige nova versão explícita, nunca alteração silenciosa.** Contexto: aplicação do princípio Backward Compatibility; sem essa garantia, um Business Hub consumidor poderia quebrar de forma inesperada por uma mudança decidida unilateralmente por outro Hub, sem qualquer aviso ou período de transição.

**ADR-012 — Cada Business Hub define e monitora seus próprios SLIs e SLOs, específicos à natureza de sua Capacidade de Negócio.** Nenhum limite de desempenho genérico e uniforme é aplicado igualmente a todo Business Hub independentemente de sua natureza. Contexto: um SLO de latência apropriado ao CRM Hub, de natureza interativa, é distinto do SLO apropriado ao Analytics Hub, de natureza agregada — aplicar o mesmo padrão a ambos produziria alerta falso em um dos dois casos.

---

## 21. Glossário

**Business Hub** — domínio de negócio reconhecível pelo cliente, distinto de Platform Service e de Adaptive Intelligence.

**Platform Service** — capacidade técnica transversal consumida por toda a plataforma, sem representar, ela mesma, um domínio de negócio.

**Adaptive Intelligence** — camada de entendimento, identidade e orquestração que torna qualquer Business Hub adaptativo.

**Bounded Context** — fronteira dentro da qual um Domain Model é internamente consistente e válido.

**Domain Ownership** — princípio segundo o qual toda Entidade de negócio pertence a exatamente um Business Hub.

**Aggregate** — agrupamento de Entities e Value Objects tratado como unidade única de consistência.

**Entity** — objeto de negócio com identidade própria e persistente ao longo do tempo.

**Value Object** — objeto de negócio definido inteiramente por seus atributos, sem identidade própria.

**Domain Event** — Fato de negócio publicado por um Business Hub, consumido de forma independente por outros Hubs interessados.

**Anti-Corruption Layer** — camada de tradução que isola o Domain Model de um Hub do vocabulário de outro domínio consumido.

**Domain Service** — componente que encapsula lógica de negócio não pertencente naturalmente a uma única Entity ou Value Object.

**Application Service** — componente que orquestra um caso de uso completo, sem conter regra de negócio substancial própria.

**Read Model** — representação de dado otimizada para consulta, distinta do modelo usado para escrita.

**Policy** — regra de negócio condicional que determina o que deve acontecer diante de uma situação específica.

**Specification** — critério de negócio reutilizável para avaliar se uma Entity satisfaz uma condição.

**Business Capability** — unidade coerente de função de negócio, maior que um caso de uso e menor que um Hub inteiro.

**Consistência eventual** — propriedade aceita de que a comunicação entre Business Hubs distintos reflete mudança dentro de um intervalo curto, não instantâneo.

---

## 22. Conclusão

Este documento é a constituição dos Business Hubs da Adaptive Business Platform. Todo novo Hub que venha a ser criado — Projects, HR, Inventory, Legal, Supplier, Document, Field Service, E-commerce, ou qualquer domínio ainda não antecipado neste roadmap — deve seguir obrigatoriamente estas diretrizes, verificadas através do checklist arquitetural do Capítulo 17, antes de qualquer implementação técnica começar.

Ele garante consistência arquitetural, porque todo Business Hub, independentemente de quando foi criado ou por qual equipe, compartilha o mesmo padrão fundamental de Domain Ownership, Bounded Context e comunicação por Evento. Garante baixo acoplamento, porque nenhum Hub jamais acessa diretamente a estrutura interna de outro, apenas seu Contrato publicado. Garante evolução independente, porque uma equipe responsável por um domínio pode modificá-lo, estendê-lo ou reimplementá-lo sem exigir coordenação constante com todas as demais. E garante escalabilidade da plataforma, porque o crescimento em número de domínios de negócio — de cinco Business Hubs hoje a quinze ou mais no futuro — nunca produz um aumento proporcional de complexidade de coordenação entre eles, precisamente porque cada um permanece uma unidade de negócio autônoma, coesa e claramente delimitada.

Junto com `PLATFORM_MANIFESTO.md`, `AI_HUB.md`, `SYSTEM_BLUEPRINT.md`, `SAAS_ARCHITECTURE.md`, `BUSINESS_PROFILE_ENGINE.md`, `BRANDING_HUB.md`, `AUTOMATION_ENGINE.md`, `IDENTITY_HUB.md`, `KNOWLEDGE_HUB.md` e `INTEGRATION_HUB.md`, este documento completa a referência arquitetural da Adaptive Business Platform em sua dimensão mais fundamental de todas: não apenas como a plataforma pensa, se identifica, age, autentica, conhece e se conecta ao mundo externo, mas como ela organiza, de forma disciplinada e duradoura, o próprio negócio que existe para servir.

Todo arquiteto responsável por propor um novo Business Hub, hoje ou daqui a muitos anos, deve tratar este documento como o ponto de partida obrigatório dessa proposta — não uma referência consultada depois que a implementação já começou, mas a primeira leitura antes de qualquer Domain Model ser esboçado. Um domínio de negócio que nasce em desacordo com os princípios aqui descritos carrega, desde o primeiro dia, exatamente o tipo de acoplamento e de ambiguidade de propriedade que este documento existe para prevenir — e corrigir essa origem depois de meses de operação em produção é sempre mais custoso do que aplicar o checklist do Capítulo 17 antes da primeira linha de implementação ser escrita.
