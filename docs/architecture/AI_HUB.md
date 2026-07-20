# AI Hub — Arquitetura de Referência

**Adaptive Business Platform · Documento Técnico Oficial**

Este documento é a referência arquitetural oficial do AI Hub. Ele define o papel, os princípios, os componentes internos, os fluxos, as integrações, as garantias de segurança e a trajetória de evolução do subsistema responsável por toda a Inteligência Artificial da plataforma. Todo desenvolvedor que constrói, estende ou integra qualquer capacidade de IA na Adaptive Business Platform deve conhecer este documento antes de escrever a primeira linha de código.

Este documento não implementa nada. Não define classes, endpoints, esquemas de banco de dados ou stacks de tecnologia. Ele define contratos, responsabilidades e limites — o que cada peça faz, o que ela nunca deve fazer, e como as peças se comunicam entre si. A implementação concreta pertence a documentos de design técnico específicos, derivados deste, nunca o contrário.

---

## 1. Introdução

A Adaptive Business Platform não é um produto que usa inteligência artificial. É um produto cuja inteligência artificial é parte da fundação sobre a qual tudo o mais é construído. Essa distinção, já registrada no manifesto da plataforma, tem uma consequência arquitetural direta: se a IA é fundação, ela não pode estar espalhada, duplicada ou reimplementada módulo a módulo. Ela precisa ter um único lugar onde vive, um único ponto de entrada, e uma única fonte de verdade sobre como se comporta.

Esse lugar é o AI Hub.

O AI Hub é o cérebro da Adaptive Business Platform. Todo módulo de negócio — CRM, Finance, Communication, Growth, Automation, e qualquer outro que venha a existir nos próximos anos — que precisar de qualquer capacidade de inteligência artificial deve solicitá-la ao AI Hub, e nunca a um provedor externo diretamente. Não existe exceção a essa regra, e este documento explica, em detalhe, por quê.

A metáfora do cérebro não é decorativa. Um cérebro biológico não é acionado isoladamente por cada músculo do corpo de forma independente — ele recebe sinais, processa contexto, aplica memória e julgamento, e emite uma resposta coordenada. É exatamente esse o papel do AI Hub dentro da plataforma: nenhum módulo "pensa" sozinho. Cada módulo sinaliza uma necessidade, e o AI Hub processa essa necessidade à luz de contexto, memória, conhecimento acumulado, identidade da empresa e política de custo e segurança, antes de produzir qualquer resposta.

Sem o AI Hub, a Adaptive Business Platform seria uma coleção de módulos independentes, cada um com sua própria integração ad hoc de inteligência artificial, sua própria lógica de prompt, seu próprio controle de custo, sua própria (ou ausente) estratégia de memória. Essa arquitetura fragmentada é exatamente o padrão que este documento existe para prevenir — não como uma preferência estética de engenharia, mas como uma condição estrutural para que a promessa central da plataforma, adaptação contínua e inteligente ao negócio, seja sustentável em escala e ao longo do tempo.

Este documento assume que o leitor já está familiarizado com o manifesto geral da plataforma e com o papel de cada Hub descrito ali. Aqui, o foco é exclusivamente arquitetural: como o AI Hub é composto, como ele se comporta, e quais garantias ele oferece a todo o restante da plataforma.

---

## 2. Objetivos

O AI Hub existe para resolver um problema estrutural específico: a inteligência artificial, se não for centralizada deliberadamente, tende a se fragmentar de forma natural e silenciosa à medida que uma plataforma cresce. Cada novo módulo, sob pressão de entrega, tende a implementar sua própria chamada a um provedor de IA da forma mais rápida possível — e essa decisão, tomada dezenas de vezes por dezenas de equipes diferentes ao longo dos anos, produz exatamente o tipo de sistema fragmentado que a missão da plataforma rejeita.

Os objetivos do AI Hub, portanto, não são objetivos de funcionalidade — são objetivos estruturais que sustentam toda funcionalidade de IA construída sobre a plataforma:

Centralizar de forma absoluta toda a inteligência artificial da plataforma, de modo que nenhuma decisão de uso de modelo, prompt ou provedor seja tomada individualmente por um módulo de negócio.

Desacoplar completamente os módulos de negócio dos provedores de inteligência artificial, de forma que a plataforma inteira possa trocar de provedor, adicionar um novo, ou usar múltiplos simultaneamente, sem que nenhum módulo precise ser alterado.

Garantir que toda interação de IA seja observável, rastreável e auditável, eliminando o padrão comum de sistemas onde ninguém consegue responder, com precisão, "o que a IA disse, para quem, com base em que contexto, e quanto isso custou".

Estabelecer controle de custo como propriedade de primeira classe da arquitetura, não como uma preocupação que se resolve depois que a fatura do provedor já chegou.

Fornecer memória e contexto como serviços internos do próprio Hub, disponíveis a qualquer módulo, em vez de exigir que cada módulo implemente sua própria estratégia de memória de forma isolada e inconsistente.

Aplicar governança e segurança de forma uniforme a toda interação com modelos de linguagem, incluindo controle de acesso, segregação entre empresas, e proteção contra os riscos específicos de sistemas baseados em IA generativa.

Permitir que a inteligência artificial evolua continuamente — em qualidade de resposta, em relevância de contexto, em eficiência de custo — sem que essa evolução exija reescrever nenhum módulo de negócio que consome IA através do Hub.

O AI Hub existe porque nenhum desses objetivos é alcançável de forma consistente se a responsabilidade por eles for distribuída entre dezenas de módulos de negócio, cada um construído por uma equipe diferente, em um momento diferente, sob pressões diferentes. Centralizar é a única forma de garantir que esses objetivos sejam cumpridos de forma uniforme, hoje e daqui a dez anos.

---

## 3. Problemas que Resolve

As arquiteturas tradicionais de integração com inteligência artificial em plataformas empresariais tendem a acumular um conjunto previsível de falhas, quase sempre pela mesma razão: a integração de IA começa pequena, como uma funcionalidade isolada em um único módulo, e cresce organicamente sem nunca receber uma camada de arquitetura dedicada.

O sintoma mais comum e mais grave é módulos chamando provedores de IA diretamente. Um módulo de CRM chama a API da OpenAI para gerar uma sugestão de resposta a um cliente; um módulo de Growth chama a API do Claude para gerar uma legenda de post; um módulo de Finance chama outro provedor ainda para resumir um relatório. Cada uma dessas chamadas é implementada de forma independente, por equipes diferentes, com convenções diferentes — e a plataforma, sem perceber, se torna refém de três integrações distintas com três provedores distintos, nenhuma delas compartilhando lógica, observabilidade ou controle de custo com as demais.

Esse padrão produz acoplamento direto entre lógica de negócio e provedor de IA. Trocar de provedor — por motivo de custo, de qualidade, de política de dados, ou simplesmente porque um novo provedor superou os anteriores — deixa de ser uma decisão de configuração e passa a ser um projeto de engenharia que toca múltiplos módulos simultaneamente. Em muitos casos, essa dificuldade é suficiente para que a empresa nunca troque de provedor, mesmo quando a troca seria claramente vantajosa, simplesmente porque o custo de migração é alto demais para justificar o esforço.

Duplicação de prompts é outro sintoma recorrente. Sem um lugar central onde prompts são compostos, versionados e reutilizados, cada módulo escreve o próprio texto de instrução ao modelo, frequentemente reproduzindo, com pequenas variações, a mesma lógica de contexto e tom que outro módulo já implementou de forma ligeiramente diferente em outro lugar. O resultado é inconsistência de comportamento entre módulos diferentes, quando o usuário espera que a IA da plataforma se comporte como uma única entidade coerente.

Custos descontrolados aparecem quando não existe nenhuma camada central medindo e limitando consumo de tokens por chamada, por módulo, por empresa. Cada integração isolada tende a otimizar para funcionar, não para custar pouco — e a soma de dezenas de integrações "que funcionam" isoladamente costuma produzir uma fatura agregada que ninguém projetou deliberadamente e que ninguém consegue explicar linha por linha depois.

Troca difícil de provedores é a consequência direta do acoplamento já descrito. Quando a lógica de chamada a um provedor específico está espalhada por múltiplos módulos, qualquer mudança de provedor se torna uma migração de risco elevado, tocando código que nada tem a ver com o motivo da mudança.

Ausência de logs adequados é comum porque, sem uma camada central de observabilidade, cada integração decide, por conta própria, o que registrar — e a maioria decide registrar pouco, porque observabilidade de IA não costuma ser prioridade de quem está apenas tentando entregar uma funcionalidade isolada dentro do prazo. O resultado é que, quando algo dá errado — uma resposta inadequada, um custo inesperado, uma falha de segurança —, não existe rastro suficiente para investigar o que aconteceu.

Ausência de memória é talvez o sintoma mais limitante de todos. Sem uma estratégia central de memória, cada interação com a IA começa do zero, sem lembrar de nada da conversa anterior, do histórico da empresa, ou do contexto acumulado ao longo do tempo. Isso trava a IA no nível de um assistente genérico e sem contexto, exatamente o oposto do copiloto empresarial que a plataforma se propõe a entregar.

O AI Hub resolve cada um desses problemas não com uma correção pontual, mas eliminando a possibilidade estrutural de que eles voltem a acontecer: se nenhum módulo pode falar diretamente com um provedor, acoplamento direto deixa de existir por definição; se todo prompt passa pelo Prompt Engine, duplicação deixa de ser possível; se todo custo passa pelo Cost Manager, custo descontrolado deixa de ser possível; e assim por diante, componente por componente, ao longo deste documento.

---

## 4. Filosofia

Toda inteligência artificial da Adaptive Business Platform pertence ao AI Hub. Nunca a um módulo de negócio.

Essa frase é a filosofia central deste documento, e ela precisa ser lida de forma literal, não como uma orientação flexível. Um módulo de CRM pode solicitar uma capacidade de IA — gerar uma resposta, resumir um histórico, sugerir uma ação —, mas o módulo de CRM nunca possui essa capacidade. Ele a invoca através de um contrato bem definido com o AI Hub, e o AI Hub decide, internamente, como atender a essa solicitação: qual modelo usar, qual prompt compor, qual contexto injetar, qual memória consultar, e qual provedor efetivamente processar a chamada.

Essa separação entre "quem precisa de IA" e "quem possui IA" é o que permite que a plataforma inteira evolua sua inteligência artificial sem exigir que cada módulo de negócio seja retocado a cada mudança. Um módulo escrito hoje, contra o contrato do AI Hub, deve continuar funcionando corretamente daqui a cinco anos, mesmo que o provedor por trás da resposta tenha mudado três vezes nesse intervalo, mesmo que a estratégia de memória tenha sido reformulada, mesmo que o modelo usado tenha sido substituído por um sucessor mais capaz.

Essa filosofia também estabelece uma hierarquia clara de responsabilidade em caso de falha ou comportamento inadequado da IA. Se uma resposta gerada pela plataforma for inadequada, a investigação começa no AI Hub — no prompt composto, no contexto injetado, na política aplicada —, não em um módulo de negócio que apenas solicitou a capacidade e não teve controle sobre como ela foi processada. Essa clareza de responsabilidade é, ela mesma, uma forma de governança: quando tudo passa por um único ponto, auditar esse ponto é suficiente para auditar toda a inteligência artificial da plataforma.

---

## 5. Design Principles

Os princípios abaixo governam toda decisão de design dentro do AI Hub. Eles não são sugestões — são o critério contra o qual qualquer proposta de mudança arquitetural deve ser avaliada antes de ser aceita.

**AI First.** A inteligência artificial não é uma camada adicionada a um sistema já pronto — é parte da fundação desde a primeira decisão de design. Todo componente do AI Hub é desenhado assumindo que a IA será consultada com alta frequência, por múltiplos módulos, simultaneamente, e que essa frequência só tende a crescer.

**Provider Agnostic.** Nenhuma decisão de arquitetura pode assumir permanentemente um único provedor de inteligência artificial. O AI Hub é desenhado para suportar múltiplos provedores simultaneamente e para trocar de provedor padrão sem que qualquer módulo de negócio precise ser alterado. Este princípio existe porque o mercado de modelos de linguagem muda rápido demais para que a plataforma se prenda a um único fornecedor por conveniência de curto prazo.

**Context Before Prompt.** Nenhum prompt é composto sem que o contexto relevante já tenha sido reunido primeiro. Contexto informa o prompt; o prompt nunca precede ou substitui contexto. Essa ordem evita o erro comum de escrever instruções genéricas ao modelo e esperar que ele "adivinhe" informação que deveria ter sido fornecida explicitamente.

**Memory First.** Memória não é um recurso opcional adicionado depois — é uma capacidade central, disponível a toda interação, desde o primeiro dia. Uma plataforma que trata memória como funcionalidade avançada condena sua própria IA a se comportar como um assistente sem histórico, contrariando diretamente a proposta de copiloto empresarial contínuo.

**Security by Design.** Toda capacidade do AI Hub é desenhada assumindo que será alvo de tentativas de manipulação, extração indevida de dado ou uso fora do escopo pretendido. Segurança não é uma revisão feita ao final do desenvolvimento de um componente — é uma restrição presente desde o desenho da primeira interface.

**Cost Awareness.** Todo componente que consome tokens de um modelo de linguagem deve ser desenhado com consciência explícita de custo. Isso não significa que custo deve sempre vencer qualidade — significa que a decisão entre os dois nunca é implícita ou acidental, e é sempre tomada com informação de custo disponível no momento da decisão.

**Observability.** Toda interação processada pelo AI Hub deve ser observável — registrada, mensurável, e disponível para investigação — sem exceção. Um componente que processa inteligência artificial sem produzir dado observável sobre o que fez é, por definição, um componente incompleto.

**Traceability.** Toda resposta gerada pela plataforma deve poder ser rastreada, de volta, até a cadeia completa de decisões que a produziu: qual módulo solicitou, qual prompt foi composto, qual contexto foi injetado, qual modelo respondeu, e qual política foi aplicada. Rastreabilidade é o que transforma "a IA disse algo estranho" em uma investigação possível, em vez de um mistério.

**Prompt Versioning.** Nenhum prompt usado em produção existe sem versão. Mudanças em prompts são tratadas com a mesma disciplina que mudanças em código: revisadas, versionadas, e reversíveis, porque um prompt mal ajustado pode degradar a qualidade de resposta de toda a plataforma de forma tão significativa quanto um bug de software.

**Human Oversight.** Nenhuma ação de impacto relevante — financeiro, jurídico, reputacional — é executada de forma inteiramente autônoma pela inteligência artificial sem um ponto de aprovação humana explícito. A IA propõe, analisa e recomenda com autonomia crescente ao longo do tempo; decisões de alto impacto continuam exigindo confirmação humana, mesmo quando a plataforma já confia amplamente na qualidade da sugestão.

**Model Independence.** Nenhuma lógica de negócio deve depender das características específicas de um único modelo de linguagem. O contrato entre módulo de negócio e AI Hub é definido em termos de capacidade solicitada — "gerar uma resposta", "resumir um documento", "classificar uma intenção" —, nunca em termos de qual modelo específico processa essa capacidade.

**Graceful Degradation.** Quando um provedor de IA falha, está indisponível, ou atinge um limite de uso, a plataforma deve degradar de forma previsível — usando um provedor alternativo, um modelo mais simples, ou uma resposta padrão informativa — em vez de falhar de forma abrupta e visível ao usuário final.

**Event Driven.** A comunicação entre o AI Hub e os demais Hubs da plataforma segue o mesmo princípio arquitetural já estabelecido para toda a plataforma: eventos publicados, não chamadas diretas acopladas. Isso permite que novos consumidores de capacidade de IA sejam adicionados sem que o AI Hub precise conhecer, antecipadamente, cada módulo que um dia consumirá seus serviços.

**Stateless Requests, Persistent Memory.** Cada requisição individual ao AI Hub é tratada como stateless — não depende de estado retido na própria camada de processamento da requisição —, enquanto a continuidade e o histórico são responsabilidade exclusiva do Memory Engine, um componente dedicado e persistente. Essa separação permite que a camada de processamento escale horizontalmente sem restrição, enquanto a continuidade de contexto é preservada de forma centralizada e confiável.

**Modular Intelligence.** Cada componente do AI Hub — Prompt Engine, Context Manager, Memory Engine, Provider Layer, e os demais descritos neste documento — é desenhado como uma unidade independente, substituível isoladamente, sem que sua substituição exija reescrever os componentes vizinhos. Inteligência artificial modular é a aplicação do princípio geral de modularidade da plataforma à camada mais estratégica de todo o sistema.

---

## 6. Arquitetura Conceitual

A arquitetura conceitual do AI Hub segue uma hierarquia estrita de camadas, na qual nenhuma camada pode ser contornada por outra.

```
                    Módulos de Negócio
      (CRM · Finance · Communication · Growth · Automation · ...)
                            │
                            │  solicitação de capacidade de IA
                            ▼
                        ┌───────────┐
                        │  AI Hub   │
                        │ (AI Gateway) │
                        └───────────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
        Prompt Engine  Context Manager  Memory Engine
              │             │             │
              └─────────────┼─────────────┘
                            ▼
                     Provider Manager
                            │
                            ▼
                     Provider Factory
                            │
                            ▼
                     Provider Layer
                            │
        ┌──────────┬────────┼────────┬──────────┬──────────────┐
        ▼          ▼        ▼        ▼          ▼              ▼
      OpenAI     Claude   Gemini   DeepSeek    Ollama    Future Providers
```

Nenhum módulo de negócio, em nenhuma circunstância, atravessa diretamente para o Provider Layer. Toda solicitação entra pelo AI Gateway, é enriquecida pelas camadas de Prompt, Contexto e Memória, é resolvida em um provedor concreto pelo Provider Manager e pela Provider Factory, e apenas então é processada por um provedor real. A resposta percorre o caminho inverso, sendo registrada, medida e auditada antes de retornar ao módulo solicitante.

Essa hierarquia garante uma propriedade central: qualquer mudança abaixo do Provider Manager — trocar de provedor, adicionar um novo modelo, ajustar uma política de fallback — é invisível para tudo o que está acima dele. Do ponto de vista de um módulo de negócio, o AI Hub é uma capacidade única e estável, independentemente de quantos provedores existam por trás dela em um determinado momento.

Complementarmente, a arquitetura conceitual reconhece um segundo eixo, transversal a essa hierarquia vertical: o eixo de suporte e governança, formado por componentes que não processam a requisição diretamente, mas que a cercam e a regulam — Cache Manager, Cost Manager, Policy Engine, Guardrails, Logging, Tracing, Metrics e Audit, entre outros descritos no capítulo seguinte. Esses componentes não aparecem no fluxo principal da requisição porque não decidem o conteúdo da resposta — eles decidem se a requisição pode prosseguir, quanto ela custa, o que deve ser registrado sobre ela, e o que deve ser bloqueado antes que chegue ao provedor ou depois que a resposta retorne dele.

---

## 7. Componentes Internos

Esta seção descreve, em profundidade, cada componente interno do AI Hub — sua responsabilidade central, os limites do que ele não deve fazer, seu papel no fluxo geral, e suas integrações com os demais componentes.

### AI Gateway

O AI Gateway é o único ponto de entrada do AI Hub. Toda solicitação de capacidade de inteligência artificial, vinda de qualquer módulo de negócio, chega primeiro ao Gateway. Sua responsabilidade é validar a solicitação, identificar o módulo e a empresa de origem, aplicar as primeiras verificações de autorização, e encaminhar a solicitação ao restante do pipeline interno. O Gateway não compõe prompts, não decide qual provedor será usado e não processa lógica de negócio — sua responsabilidade é estritamente de borda: aceitar, validar, e encaminhar. Um Gateway que começa a acumular lógica de decisão deixou de ser um Gateway e se tornou um ponto de acoplamento oculto, o que este documento explicitamente rejeita.

### Provider Manager

O Provider Manager decide, para cada solicitação, qual provedor de inteligência artificial deve efetivamente processá-la, com base em política configurada, disponibilidade em tempo real, custo, e capacidade exigida pela solicitação. Ele é o componente que torna a plataforma verdadeiramente agnóstica a provedor: uma mudança na política de roteamento — por exemplo, priorizar um provedor mais barato para tarefas simples e reservar um provedor mais caro e capaz para tarefas complexas — acontece inteiramente dentro do Provider Manager, sem qualquer impacto em módulos de negócio ou em outros componentes do Hub.

### Provider Factory

A Provider Factory é responsável por instanciar e configurar o cliente técnico de comunicação com cada provedor concreto — OpenAI, Claude, Gemini, DeepSeek, Ollama, ou qualquer provedor futuro. Ela encapsula as diferenças de protocolo, autenticação e formato de cada provedor por trás de uma interface única e uniforme, de modo que o Provider Manager e tudo o que está acima dele nunca precisem conhecer as particularidades técnicas de um provedor específico. Adicionar um novo provedor à plataforma significa, na prática, adicionar uma nova implementação concreta à Provider Factory — nunca alterar nenhum componente que já existia.

### Model Registry

O Model Registry mantém o catálogo central de todos os modelos disponíveis na plataforma, através de todos os provedores suportados, junto com suas capacidades declaradas, seus limites técnicos, seu custo por unidade de uso, e sua versão vigente. Nenhum componente do AI Hub decide, por conta própria, se um modelo é capaz de processar uma tarefa específica — essa decisão consulta o Model Registry, que é a fonte única de verdade sobre o que cada modelo pode e não pode fazer.

### Prompt Engine

O Prompt Engine é responsável por compor o prompt final enviado a um provedor, a partir de templates versionados e das camadas de contexto fornecidas pelo Context Manager. É detalhado extensamente no Capítulo 9 deste documento, mas sua responsabilidade central, resumida aqui, é: nenhum texto de instrução a um modelo de linguagem é escrito ad hoc por um módulo de negócio — todo prompt nasce, é versionado e é validado dentro do Prompt Engine.

### Context Manager

O Context Manager reúne todas as camadas de contexto relevantes para uma solicitação específica — contexto do usuário, da empresa, do módulo de origem, da conversa em andamento, do histórico relevante, do perfil de negócio e da identidade de marca — e as entrega ao Prompt Engine de forma estruturada. É detalhado no Capítulo 10. Sua responsabilidade central é garantir que nenhuma resposta seja gerada sem que o contexto disponível já tenha sido considerado.

### Memory Manager

O Memory Manager administra a persistência e a recuperação de memória de curta e longa duração, tanto da empresa quanto do usuário individual e da própria IA enquanto entidade contínua. É detalhado no Capítulo 11. Ele opera de forma desacoplada da camada de processamento de requisição, exatamente como descrito no princípio Stateless Requests, Persistent Memory.

### Knowledge Connector

O Knowledge Connector é a ponte entre o AI Hub e o Knowledge Hub, responsável por consultar documentos, políticas internas e conhecimento acumulado da empresa sempre que uma solicitação se beneficia dessa informação. Ele não armazena conhecimento — armazenamento e organização de conhecimento pertencem ao Knowledge Hub — sua responsabilidade é consultar e trazer o que for relevante para dentro do contexto de uma solicitação específica.

### Business Profile Connector

O Business Profile Connector consulta o Business Profile Engine para trazer, a cada solicitação, o entendimento já acumulado sobre aquele negócio específico — segmento, vocabulário, prioridades típicas daquele tipo de operação. É esse componente que permite à mesma pergunta feita por um usuário de uma clínica e por um usuário de uma floricultura receber respostas adaptadas a cada realidade, sem que o Prompt Engine precise conhecer, ele mesmo, a lógica de classificação de segmento.

### Branding Connector

O Branding Connector consulta o Branding Hub para trazer a identidade de marca da empresa — tom de voz, formalidade, vocabulário preferido, restrições de linguagem — de modo que qualquer conteúdo gerado pela IA em nome daquela empresa respeite sua identidade, e não apenas sua aparência visual. É detalhado no Capítulo 14.

### Cache Manager

O Cache Manager armazena, por tempo limitado e sob política explícita, resultados de solicitações repetidas ou previsíveis, reduzindo tanto latência quanto custo. Ele nunca armazena resposta de forma indiscriminada — solicitações que dependem de contexto altamente variável ou dado sensível não são candidatas a cache, e a decisão de o que é elegível a cache é uma política explícita, não um comportamento padrão implícito.

### Retry Manager

O Retry Manager administra tentativas de repetição de uma solicitação que falhou por motivo transitório — indisponibilidade momentânea de um provedor, erro de rede, limite de taxa atingido — com política de espera progressiva, evitando tanto abandono prematuro de uma solicitação válida quanto sobrecarga de um provedor já sob estresse.

### Queue Manager

O Queue Manager organiza solicitações que não podem, ou não precisam, ser processadas de forma síncrona imediata, permitindo que a plataforma absorva picos de demanda sem degradar a experiência de solicitações urgentes. Ele trabalha em conjunto com o Retry Manager para garantir que nenhuma solicitação legítima seja descartada silenciosamente por sobrecarga momentânea do sistema.

### Token Manager

O Token Manager mede o consumo de tokens de cada solicitação, antes e depois do processamento, e aplica limites configurados por empresa, por módulo, ou por usuário. É o componente que torna possível responder, com precisão, à pergunta "quanto esta empresa está consumindo, e em quê".

### Cost Manager

O Cost Manager converte consumo de token em custo real, aplica orçamentos e alertas configurados, e informa o Provider Manager sempre que uma decisão de roteamento deve considerar restrição orçamentária. É detalhado extensamente no Capítulo 21.

### Policy Engine

O Policy Engine aplica regras de negócio e de governança a cada solicitação — quais módulos podem solicitar quais capacidades, quais empresas têm acesso a quais modelos, quais restrições de conteúdo se aplicam a qual contexto. É o componente que transforma decisões de governança, definidas em linguagem de negócio, em regras efetivamente aplicadas a cada solicitação processada.

### Guardrails

Guardrails são as restrições ativas que impedem que uma solicitação ou uma resposta ultrapasse limites previamente definidos — geração de conteúdo fora do escopo permitido, exposição de dado sensível, ou instrução que tenta contornar a política da plataforma. Guardrails atuam tanto na entrada quanto na saída da solicitação, complementando, mas não substituindo, o Policy Engine.

### Safety Layer

A Safety Layer é a camada dedicada a identificar e mitigar riscos específicos de sistemas de IA generativa — tentativas de manipulação de instrução, geração de conteúdo prejudicial, ou comportamento fora do padrão esperado do modelo. É detalhada no Capítulo 17, junto com os demais aspectos de segurança da plataforma.

### Moderation

O componente de Moderation avalia conteúdo — tanto solicitações recebidas quanto respostas geradas — contra políticas de conteúdo aceitável, sinalizando ou bloqueando material que viole essas políticas antes que alcance o usuário final ou seja registrado como resposta válida da plataforma.

### Logging

O componente de Logging registra, de forma estruturada, todo evento relevante processado pelo AI Hub — não apenas erros, mas o ciclo de vida completo de cada solicitação, desde a entrada no Gateway até a resposta final. É a base sobre a qual Tracing, Metrics e Audit são construídos.

### Tracing

O Tracing conecta os registros individuais de Logging em uma linha de execução completa e navegável, permitindo reconstruir, para qualquer solicitação específica, a sequência exata de decisões tomadas por cada componente do Hub. É detalhado no Capítulo 18.

### Metrics

O componente de Metrics agrega dado operacional — latência, volume de solicitações, taxa de erro, consumo de token — em indicadores que alimentam dashboards operacionais e de negócio, permitindo observar a saúde do AI Hub em tempo real e ao longo do tempo.

### Observability

Observability, como conceito, é a combinação coordenada de Logging, Tracing e Metrics, tratada aqui como um compromisso arquitetural único: nenhum componente do AI Hub é considerado completo sem produzir os três tipos de dado necessários para que seu comportamento seja plenamente observável.

### Audit

O componente de Audit preserva um registro imutável e de longo prazo das decisões mais sensíveis processadas pelo AI Hub — em particular aquelas com implicação de governança, segurança ou conformidade regulatória — de forma independente da retenção operacional padrão de Logging, que pode ter ciclo de vida mais curto.

### Configuration

O componente de Configuration centraliza os parâmetros operacionais do AI Hub — limites, políticas ativas, provedores habilitados por empresa — e garante que essas configurações sejam versionadas e auditáveis, em vez de espalhadas em variáveis soltas por diferentes partes do sistema.

### Feature Flags

Feature Flags permitem habilitar ou desabilitar capacidades específicas do AI Hub de forma gradual e reversível — por empresa, por módulo, ou pela plataforma inteira — sem exigir um novo ciclo de implantação para cada mudança de disponibilidade de uma capacidade.

### AI Settings

O componente de AI Settings expõe, de forma controlada, os parâmetros de comportamento de IA que uma empresa ou um administrador de plataforma pode ajustar — por exemplo, o nível de formalidade padrão, ou a preferência entre respostas mais rápidas e respostas mais elaboradas — sem que esse ajuste exija qualquer intervenção de engenharia.

Cada um destes componentes tem um limite estrito de responsabilidade, e a violação desse limite — um componente assumindo responsabilidade de outro — é tratada como um defeito arquitetural a ser corrigido, não como uma otimização pragmática a ser tolerada.

---

## 8. Fluxo Completo

O fluxo completo de uma solicitação de inteligência artificial, do início ao fim, percorre a seguinte sequência:

```
Usuário
   │  interage com um módulo de negócio
   ▼
Módulo de Negócio (ex.: CRM)
   │  identifica necessidade de IA e solicita ao AI Hub
   ▼
AI Gateway
   │  valida e autentica a solicitação
   ▼
Context Manager
   │  reúne contexto do usuário, da empresa, do módulo, da conversa
   ▼
Knowledge Connector · Business Profile Connector · Branding Connector
   │  enriquecem o contexto com conhecimento, perfil de negócio e identidade de marca
   ▼
Memory Manager
   │  recupera memória relevante de curta e longa duração
   ▼
Prompt Engine
   │  compõe o prompt final a partir de template versionado + contexto + memória
   ▼
Policy Engine · Guardrails
   │  validam que a solicitação composta respeita as políticas ativas
   ▼
Provider Manager
   │  decide qual provedor/modelo deve processar a solicitação
   ▼
Provider Factory
   │  instancia o cliente técnico do provedor escolhido
   ▼
Provider Layer (OpenAI · Claude · Gemini · DeepSeek · Ollama · outros)
   │  processa a solicitação e retorna uma resposta
   ▼
Safety Layer · Moderation
   │  avaliam a resposta antes de liberá-la
   ▼
Resposta
   │  retorna ao módulo de negócio solicitante
   ▼
Logging · Tracing · Metrics · Audit
   │  registram toda a jornada da solicitação
   ▼
Analytics Hub
   consome o dado agregado para relatórios e insights de negócio
```

Cada etapa desse fluxo é obrigatória — nenhuma solicitação alcança o Provider Layer sem antes passar por composição de contexto, verificação de memória, composição de prompt e validação de política. Essa obrigatoriedade não é uma restrição de desempenho aceita a contragosto: é a própria definição do que significa "toda inteligência artificial passa pelo AI Hub". Uma solicitação que pulasse qualquer uma dessas etapas estaria, por definição, contornando o Hub, e esse cenário é tratado como uma falha arquitetural grave, não como uma otimização válida.

---

## 9. Prompt Engine

O Prompt Engine é o componente responsável por transformar uma solicitação de capacidade — "gerar uma resposta a este cliente", "resumir este documento" — em um prompt concreto, pronto para ser enviado a um provedor de inteligência artificial.

Prompt Templates são a unidade fundamental de trabalho do Prompt Engine. Nenhum prompt é escrito diretamente, em texto livre, no momento da solicitação — todo prompt nasce de um template previamente definido, revisado e aprovado, que aceita variáveis específicas de cada solicitação. Isso elimina a duplicação de lógica de prompt entre módulos diferentes e garante que uma melhoria em um template beneficie, imediatamente, toda solicitação que o utiliza.

Versionamento é aplicado a todo template, com a mesma disciplina aplicada a código de produção. Uma mudança em um template é revisada, testada e implantada como uma mudança de sistema, nunca como uma edição informal de texto. Isso permite, também, reverter um template para uma versão anterior se uma mudança recente produzir degradação de qualidade perceptível.

Variáveis são os pontos de injeção de contexto dentro de um template — o nome do cliente, o histórico relevante, o segmento da empresa — preenchidas dinamicamente a cada solicitação, sempre a partir de dado fornecido pelo Context Manager, nunca compostas livremente pelo módulo solicitante.

O Prompt Engine organiza a composição final de um prompt em camadas distintas e sobrepostas, cada uma com uma origem e uma responsabilidade diferente:

O System Prompt define o comportamento fundamental e as restrições inegociáveis da IA da plataforma — o que ela é, o que nunca deve fazer, os limites de segurança e de escopo que se aplicam a toda interação, independentemente de empresa ou módulo.

O Business Prompt incorpora o entendimento do Business Profile Engine sobre aquela empresa específica — seu segmento, seu vocabulário típico, suas prioridades operacionais.

O Brand Prompt incorpora a identidade de marca daquela empresa, trazida pelo Branding Connector — tom de voz, formalidade, restrições de linguagem específicas daquela marca.

O User Prompt é a solicitação específica do momento — a pergunta, a tarefa, o pedido concreto que originou a chamada ao AI Hub.

Essas quatro camadas são combinadas pelo Prompt Composer, o subcomponente responsável por montar o prompt final na ordem e na estrutura corretas, garantindo que camadas de maior prioridade — o System Prompt, em particular — nunca sejam sobrepostas ou anuladas por camadas de prioridade menor.

O Prompt Validator inspeciona o prompt composto antes do envio ao provedor, verificando que nenhuma variável ficou sem substituição, que o tamanho está dentro dos limites aceitáveis do modelo escolhido, e que nenhuma instrução conflitante foi introduzida pela combinação das camadas.

A Prompt Library é o repositório central de todos os templates disponíveis na plataforma, organizados por capacidade e por módulo consumidor, servindo como catálogo consultável tanto para desenvolvimento de novas capacidades quanto para auditoria de comportamento existente.

---

## 10. Context Manager

Nenhuma resposta de qualidade pode ser gerada sem contexto suficiente, e reunir esse contexto de forma consistente é a responsabilidade central do Context Manager.

O contexto do usuário identifica quem está interagindo com a plataforma naquele momento — seu papel dentro da empresa, suas permissões, suas preferências já conhecidas — informação que molda o nível de detalhe e o tom apropriado de uma resposta.

O contexto da empresa traz a identidade daquele Workspace específico — seu segmento, sua fase de operação, sua configuração ativa — a mesma base de informação que sustenta a personalização descrita no conceito de Adaptive Experience.

O contexto do módulo identifica de onde a solicitação se origina — CRM, Finance, Growth — permitindo que o AI Hub ajuste expectativa de formato e de vocabulário de acordo com a natureza daquele módulo, sem que o módulo precise instruir isso explicitamente a cada chamada.

O contexto da conversa mantém a continuidade dentro de uma interação específica em andamento, garantindo que uma pergunta de acompanhamento seja entendida à luz do que já foi dito momentos antes, dentro da mesma sessão.

O contexto histórico estende essa continuidade para além de uma única sessão, trazendo padrões e informações relevantes acumulados ao longo de interações anteriores, com a mesma empresa ou o mesmo usuário, dentro dos limites de retenção definidos pela estratégia de memória.

O contexto do Business Profile e o contexto do Branding, ambos já mencionados no Capítulo 9, chegam ao Context Manager através dos respectivos conectores, e são tratados como camadas de contexto de mesma natureza que as demais — dado estruturado que informa a composição do prompt, nunca texto livre inserido de forma improvisada.

O Context Manager não decide o que fazer com o contexto reunido — essa decisão pertence ao Prompt Engine. Sua responsabilidade termina em entregar, de forma completa, estruturada e atualizada, tudo o que é relevante para que a camada seguinte componha a melhor solicitação possível ao modelo.

---

## 11. Memory Engine

A estratégia de memória do AI Hub distingue duas naturezas fundamentalmente diferentes de continuidade, com implicações diferentes de retenção, custo e uso.

Memória de curta duração cobre o histórico imediato de uma interação em andamento — o que foi dito nos últimos turnos de uma conversa — e existe para garantir coerência dentro de uma única sessão de uso. Sua retenção é limitada, e seu propósito é estritamente conversacional.

Memória de longa duração preserva informação relevante além do limite de uma única sessão — preferências já expressas, decisões já tomadas, padrões de comportamento já observados — e existe para que a plataforma se comporte como um copiloto que efetivamente conhece aquele negócio, não como um assistente que reinicia do zero a cada novo acesso.

Dentro dessas duas naturezas, o AI Hub distingue ainda três titularidades distintas de memória. A memória da empresa preserva conhecimento acumulado sobre aquele negócio como um todo — independente de qual usuário específico interagiu em cada momento. A memória do usuário preserva preferências e padrões individuais de uma pessoa específica dentro daquela empresa. E a memória da IA preserva o próprio histórico de decisões e ajustes que a inteligência artificial da plataforma acumulou ao interagir com aquele contexto específico, permitindo que sua qualidade de resposta melhore de forma contínua, não apenas estática.

A estratégia de memória do AI Hub trata cada uma dessas seis combinações — curta ou longa duração, cruzada com empresa, usuário ou IA — como um compartimento distinto, com política própria de retenção, de acesso e de expiração, gerenciado centralmente pelo Memory Manager descrito no Capítulo 7. Nenhum módulo de negócio acessa esses compartimentos diretamente — toda consulta e toda escrita de memória passam pelo Memory Manager, que aplica as regras de isolamento entre empresas detalhadas no Capítulo 20.

---

## 12. Knowledge Hub Integration

O Knowledge Hub é o guardião do conhecimento acumulado por uma empresa dentro da plataforma — documentos, políticas internas, materiais de referência, conteúdo produzido ao longo do tempo. O AI Hub não duplica essa responsabilidade; ele a consome, através do Knowledge Connector, sempre que uma solicitação se beneficia de conhecimento específico daquela empresa.

Esse consumo acontece antes da composição do prompt, não depois da resposta. Quando um usuário faz uma pergunta cuja resposta correta depende de um documento específico da empresa — uma política interna, um catálogo de produtos, um manual de procedimento —, o Knowledge Connector consulta o Knowledge Hub, identifica o material relevante, e entrega esse material ao Context Manager como mais uma camada de contexto disponível ao Prompt Engine.

Essa arquitetura evita dois erros comuns em sistemas de IA empresarial. O primeiro é depender inteiramente do conhecimento geral do modelo de linguagem, ignorando que a resposta correta, na maioria das vezes, está documentada dentro da própria empresa e não no conhecimento geral de um modelo treinado externamente. O segundo é tentar reimplementar, dentro do próprio AI Hub, uma capacidade de armazenamento e busca de documentos que já é responsabilidade nativa do Knowledge Hub — violando diretamente o princípio de reutilização já estabelecido no manifesto da plataforma.

A resposta gerada, ao incorporar conhecimento trazido pelo Knowledge Connector, deve ser tão precisa quanto o material consultado permite — e, quando esse material for insuficiente ou ausente, a resposta deve refletir essa limitação de forma honesta, em vez de preenchê-la com informação genérica apresentada como se fosse específica daquela empresa.

---

## 13. Business Profile Integration

O comportamento da inteligência artificial da plataforma não é uniforme entre empresas de segmentos diferentes, e essa variação é intencional, não acidental. O Business Profile Connector traz, a cada solicitação, o entendimento acumulado pelo Business Profile Engine sobre aquele negócio específico, e esse entendimento molda diretamente a resposta produzida.

Uma floricultura opera em torno de sazonalidade, ocasiões especiais e produtos perecíveis — e a IA que assiste essa empresa deve reconhecer esse vocabulário e essas prioridades sem que ninguém precise explicá-las a cada interação. Um pet shop lida com ciclos de recompra previsíveis atrelados à idade e às necessidades do animal, e a IA deve reconhecer esse padrão como relevante para recomendações e comunicação com o cliente. Uma clínica opera sob exigências de confidencialidade e formalidade que uma loja de varejo comum não precisa considerar da mesma forma, e a IA deve ajustar tom e cautela de acordo. Um restaurante lida com operação em tempo real e janelas de decisão curtas, exigindo respostas mais diretas e imediatamente acionáveis. Uma marca de moda opera fortemente em torno de tendência, estação e apelo visual, e a IA deve refletir essa sensibilidade estética na forma como se comunica. Uma academia mede sucesso em retenção e frequência, não apenas em transação isolada, e a IA deve orientar suas sugestões para esse tipo de indicador. Um escritório de advocacia exige precisão terminológica e formalidade elevada, com tolerância mínima a ambiguidade, algo que a IA deve respeitar de forma consistente em cada resposta gerada em seu nome.

Nenhuma dessas adaptações exige lógica específica escrita módulo a módulo. Elas emergem da combinação entre o entendimento already trazido pelo Business Profile Connector e a composição do Business Prompt dentro do Prompt Engine, exatamente como descrito no Capítulo 9. É essa arquitetura que permite à mesma infraestrutura de IA atender segmentos radicalmente diferentes sem que a plataforma precise construir, e manter, uma versão de IA separada para cada tipo de negócio.

---

## 14. Branding Integration

Assim como o Business Profile molda o conteúdo e a prioridade de uma resposta, o Branding molda a forma como essa resposta se apresenta em nome da empresa.

O Branding Connector traz, a cada solicitação de geração de conteúdo, a identidade de marca já estabelecida pelo Branding Hub — cores associadas à marca, quando relevante ao formato de saída; o tom de voz característico daquela empresa, que pode variar de formal e técnico a descontraído e próximo; a linguagem preferida, incluindo termos que a empresa usa deliberadamente e termos que evita por posicionamento ou por política interna; e a identidade e a marca como um todo, no sentido de que qualquer conteúdo gerado deve soar como se tivesse sido escrito por alguém que representa genuinamente aquela empresa, não por um sistema genérico que apenas aplicou um verniz superficial de personalização.

Essa integração é o que sustenta, na camada de linguagem, o mesmo compromisso que o Branding Hub já sustenta na camada visual: que a empresa sinta que a plataforma foi construída para ela, não adaptada superficialmente a partir de um padrão genérico. Um relatório gerado pela IA, uma resposta a um cliente, um texto de campanha — todos devem carregar a voz daquela empresa específica, não uma voz neutra de sistema que o cliente precisa editar manualmente antes de usar.

---

## 15. Provider Layer

A Provider Layer é a camada mais externa do AI Hub, responsável pela comunicação técnica efetiva com cada provedor de inteligência artificial suportado pela plataforma.

A plataforma suporta, hoje e por desenho, múltiplos provedores simultaneamente: OpenAI, Claude, Gemini, DeepSeek, Ollama — este último relevante em cenários que exigem processamento local ou maior controle sobre onde o dado é processado —, Azure OpenAI, como uma via adicional de acesso a modelos da OpenAI sob um contrato e uma infraestrutura de nuvem diferentes, e qualquer provedor futuro que venha a surgir no mercado.

Nenhum desses provedores recebe tratamento arquitetural privilegiado. Cada um é implementado como uma unidade concreta dentro da Provider Factory, seguindo a mesma interface abstrata que todos os demais, o que significa que adicionar um novo provedor nunca exige alterar o Provider Manager, o Prompt Engine, ou qualquer módulo de negócio consumidor.

Troca transparente de provedor é a propriedade mais visível dessa arquitetura, e a mais estratégica: a plataforma pode migrar seu provedor padrão, adicionar um segundo provedor para redundância, ou rotear diferentes tipos de solicitação para diferentes provedores de acordo com custo e capacidade, sem que isso seja perceptível para nenhum módulo de negócio, e sem que o usuário final da plataforma perceba qualquer diferença de comportamento além, eventualmente, de uma melhoria de qualidade ou de custo.

---

## 16. Model Registry

O Model Registry mantém, para cada modelo disponível através de cada provedor suportado, um conjunto padronizado de informação usada por todo o restante do AI Hub para tomar decisões de roteamento e de composição de solicitação.

Modelos disponíveis são registrados individualmente, mesmo quando pertencem ao mesmo provedor, porque diferentes modelos de um mesmo provedor frequentemente têm capacidades e custos distintos entre si.

Capacidades descrevem o que cada modelo é declaradamente apto a processar — geração de texto, análise de imagem, geração de código, raciocínio estendido — permitindo que o Provider Manager só considere, para uma solicitação específica, os modelos efetivamente capazes de atendê-la.

Limites documentam restrições técnicas de cada modelo — tamanho máximo de contexto aceito, taxa máxima de chamadas, formatos de entrada e saída suportados — informação consultada pelo Prompt Validator antes do envio de qualquer solicitação.

Custos são registrados por unidade de uso — tipicamente por token de entrada e de saída — e alimentam diretamente o Cost Manager, permitindo que decisões de roteamento considerem custo real, não uma estimativa aproximada.

Versionamento é aplicado ao próprio registro de cada modelo, porque provedores atualizam e descontinuam modelos com frequência, e a plataforma precisa saber, a qualquer momento, exatamente qual versão de qual modelo está sendo usada para processar uma determinada capacidade — informação essencial tanto para reprodutibilidade de comportamento quanto para investigação de incidentes.

---

## 17. Segurança

A segurança do AI Hub cobre riscos que são específicos de sistemas baseados em inteligência artificial generativa, além dos riscos convencionais de segurança de aplicação que já se aplicam ao restante da plataforma.

Prompt Injection — a tentativa de manipular o comportamento do modelo através de instrução maliciosa embutida em conteúdo aparentemente inofensivo, como um documento consultado ou uma mensagem de um usuário — é mitigada através da separação estrita de camadas dentro do Prompt Engine, garantindo que conteúdo de origem externa ou de usuário nunca seja tratado com a mesma autoridade que o System Prompt, e através da Safety Layer e dos Guardrails, que inspecionam tanto entrada quanto saída em busca de padrões de manipulação conhecidos.

Data Leakage — a exposição indevida de informação sensível de uma empresa através de uma resposta gerada para outra, ou através de um provedor externo — é mitigada estruturalmente pela segregação entre empresas descrita no Capítulo 20, e por política explícita sobre quais dados podem ser enviados a provedores externos e em que condições.

Segregação entre empresas garante que nenhuma solicitação processada em nome de uma empresa possa, em qualquer circunstância, ter acesso a memória, contexto ou conhecimento de outra empresa, mesmo quando ambas compartilham a mesma infraestrutura técnica subjacente. Essa segregação é tratada como propriedade estrutural do sistema, não como uma verificação adicional aplicada ao final de cada consulta.

LGPD — a conformidade com a Lei Geral de Proteção de Dados — exige que todo processamento de dado pessoal através do AI Hub tenha finalidade declarada, consentimento quando aplicável, e mecanismo de exclusão respeitado. Isso se aplica com particular atenção à memória de longa duração, que por natureza retém dado pessoal ao longo do tempo, e que precisa ser passível de exclusão completa quando solicitado.

Criptografia é aplicada tanto a dado em trânsito, entre os componentes internos do AI Hub e entre o Hub e os provedores externos, quanto a dado em repouso, nos compartimentos de memória e nos registros de auditoria.

Permissões e controle de acesso determinam quais módulos podem solicitar quais capacidades, e quais usuários dentro de uma empresa podem acionar quais tipos de interação de IA — decisão aplicada pelo Policy Engine a cada solicitação recebida pelo AI Gateway, nunca deixada a critério de verificação isolada dentro de um módulo de negócio individual.

---

## 18. Observabilidade

A observabilidade do AI Hub é organizada em torno de um princípio simples: nenhuma solicitação processada deve ser opaca depois de concluída.

Logs registram, de forma estruturada, cada etapa relevante da jornada de uma solicitação — não apenas o resultado final, mas as decisões intermediárias tomadas por cada componente ao longo do fluxo descrito no Capítulo 8.

Tracing conecta esses registros individuais em uma linha de execução única e navegável por solicitação, permitindo que qualquer investigação comece por uma resposta específica e reconstrua, passo a passo, exatamente como ela foi produzida.

Latency é medida em cada etapa do fluxo, não apenas no tempo total, permitindo identificar exatamente qual componente — composição de contexto, consulta de memória, chamada ao provedor — está contribuindo para uma eventual degradação de desempenho.

Token Usage é registrado por solicitação, por módulo e por empresa, alimentando tanto o Cost Manager quanto os dashboards de consumo disponíveis à própria empresa.

Custos são calculados a partir do Token Usage e do Model Registry, e disponibilizados tanto em tempo real quanto em consolidação periódica.

Tempo de processamento total, desde a entrada no AI Gateway até a resposta retornada ao módulo solicitante, é uma métrica de experiência direta, correlacionada com a percepção de responsividade da plataforma inteira.

Falhas são registradas com o mesmo nível de detalhe que solicitações bem-sucedidas, incluindo o componente onde a falha ocorreu e a ação de contingência tomada pelo Retry Manager ou pelo mecanismo de Graceful Degradation.

Alertas são disparados quando indicadores operacionais ultrapassam limites configurados — taxa de erro elevada, latência acima do esperado, consumo de token acima do orçamento —, permitindo intervenção antes que o problema se torne visível ao usuário final.

Dashboards consolidam todo esse dado operacional em painéis consultáveis por engenharia e por operação da plataforma, e alimentam, através de integração direta, o Analytics Hub descrito no Capítulo 23.

---

## 19. Escalabilidade

O AI Hub é desenhado para escalar em dois eixos complementares.

Escalabilidade horizontal permite que múltiplas instâncias do AI Gateway e dos componentes de processamento operem em paralelo, absorvendo aumento de volume de solicitações através da adição de mais instâncias, não através do aumento de capacidade de uma única instância. Isso é viabilizado diretamente pelo princípio de Stateless Requests já descrito no Capítulo 5: como cada requisição não depende de estado retido na camada de processamento, qualquer instância disponível pode atender qualquer solicitação.

Escalabilidade vertical continua relevante para componentes que se beneficiam de maior capacidade individual — em particular processamento local via Ollama, quando aplicável, ou operações de análise mais intensivas dentro do próprio Hub.

Cache reduz a carga efetiva sobre o Provider Layer ao evitar reprocessar solicitações previsíveis ou repetidas, dentro da política já descrita para o Cache Manager no Capítulo 7.

Queues absorvem picos de demanda, permitindo que solicitações não urgentes aguardem processamento sem impactar a latência de solicitações que exigem resposta imediata.

Workers processam essas filas de forma paralela e escalável, adicionados ou removidos de acordo com a demanda observada em tempo real.

Rate Limits protegem tanto a plataforma quanto os provedores externos de sobrecarga, aplicados por empresa, por módulo e pela plataforma como um todo, e coordenados com a política de Retry para evitar que uma limitação de taxa se torne uma falha percebida pelo usuário.

Streaming permite que respostas mais longas sejam entregues de forma incremental ao módulo solicitante, e por ele ao usuário final, reduzindo a percepção de espera mesmo quando o tempo total de processamento não muda.

---

## 20. Multiempresa

A Adaptive Business Platform opera em regime de multiempresa desde sua concepção, e o AI Hub aplica esse mesmo isolamento com o mesmo rigor que qualquer outro componente da plataforma.

Nenhuma solicitação de inteligência artificial processada em nome de uma empresa tem, em qualquer circunstância, acesso a dado de outra empresa — memória, contexto, conhecimento ou histórico de conversa. Esse isolamento não é uma verificação adicional aplicada no momento de uma consulta; é uma propriedade estrutural de como cada compartimento de memória, cada consulta ao Knowledge Hub e cada composição de contexto são identificados e segregados desde a origem da solicitação, através do identificador de Workspace que acompanha toda solicitação desde sua entrada no AI Gateway.

Isso vale mesmo quando duas empresas compartilham o mesmo modelo, o mesmo provedor, e a mesma infraestrutura técnica de processamento — o isolamento é lógico e absoluto, independentemente de quanta infraestrutura física seja compartilhada por trás dele. Uma falha nesse isolamento seria tratada, nesta arquitetura, com a mesma severidade de uma falha de segurança crítica, porque a confiança de uma empresa em nunca ter seu dado exposto a outra é uma condição essencial para que a plataforma seja adotável em qualquer escala.

---

## 21. Custos

O controle de custo é tratado, no AI Hub, com a mesma disciplina arquitetural aplicada a segurança e a observabilidade — não como uma preocupação financeira externa à engenharia, mas como uma propriedade de sistema.

O Token Manager mede consumo em tempo real, antes de uma solicitação ser processada e depois que a resposta é recebida, permitindo tanto estimativa prévia quanto confirmação posterior de custo.

Budget é definido por empresa, e opcionalmente por módulo, estabelecendo um teto de consumo esperado dentro de um determinado período, contra o qual o consumo real é continuamente comparado.

Alertas são disparados conforme o consumo se aproxima do orçamento definido, permitindo ação corretiva antes que o limite seja de fato ultrapassado.

Limites, quando efetivamente atingidos, podem ser configurados para bloquear novas solicitações, degradar para um modelo mais econômico, ou apenas notificar sem interromper — a escolha entre esses comportamentos é uma decisão de política, não uma restrição técnica fixa.

Otimizações de custo acontecem em múltiplas camadas simultaneamente: cache evitando reprocessamento desnecessário, composição de prompt evitando contexto redundante ou excessivo, e escolha de modelo proporcional à complexidade real da tarefa solicitada.

Model Routing direciona solicitações mais simples para modelos mais econômicos e reserva modelos de maior capacidade, e maior custo, para tarefas que efetivamente exigem esse nível de sofisticação — decisão tomada pelo Provider Manager com base na capacidade declarada no Model Registry e na política de custo vigente.

Fallback garante que, quando o modelo ou o provedor preferencial não está disponível ou excede o orçamento, a solicitação seja redirecionada para uma alternativa viável, seguindo o princípio de Graceful Degradation, em vez de simplesmente falhar.

---

## 22. Inteligência Evolutiva

A inteligência artificial da Adaptive Business Platform não é estática entre uma versão de software e a próxima — ela aprende continuamente, dentro de limites bem definidos de privacidade e de escopo.

Esse aprendizado acontece, sobretudo, através do acúmulo estruturado de memória de longa duração, descrito no Capítulo 11: quanto mais uma empresa opera dentro da plataforma, mais contexto relevante fica disponível para informar respostas futuras, e mais refinado se torna o entendimento do Business Profile Engine sobre aquele negócio específico.

Esse aprendizado é isolado por empresa. O que a plataforma aprende sobre uma empresa nunca é transferido, de forma identificável, para melhorar a experiência de outra — o isolamento multiempresa descrito no Capítulo 20 se aplica também à camada de aprendizado, não apenas à camada de armazenamento. Isso não impede que a plataforma, como um todo, aprenda com padrões agregados e anonimizados observados através de múltiplas empresas, mas essa camada de aprendizado agregado é tratada separadamente, com sua própria política explícita de anonimização, e nunca é confundida com o aprendizado específico e identificável de uma empresa individual.

O compromisso central desta seção é que evolução de inteligência nunca é obtida à custa de privacidade. Uma plataforma que aprende mais sobre um negócio ao longo do tempo, sem nunca comprometer o isolamento e a confidencialidade daquele negócio, é o padrão que este documento estabelece como não negociável.

---

## 23. Integração com todos os Hubs

O AI Hub não opera isoladamente — ele é consumido por, e fornece capacidade a, todos os demais Hubs da plataforma, cada um com um padrão de uso característico.

O CRM Hub consome o AI Hub para gerar sugestões de resposta a clientes, resumir histórico de relacionamento, e priorizar oportunidades com base em padrão de comportamento observado.

O Finance Hub consome o AI Hub para análise de fluxo de caixa, geração de relatórios em linguagem natural a partir de dado financeiro estruturado, e identificação de anomalias que merecem atenção humana.

O Communication Hub consome o AI Hub para compor mensagens, sugerir respostas e manter consistência de tom entre diferentes canais de comunicação da empresa.

O Automation Hub consome o AI Hub para decidir, dentro de fluxos automatizados, qual ação tomar diante de uma condição que não foi antecipada de forma totalmente determinística por regra fixa.

O Growth Hub consome o AI Hub extensivamente, para geração de conteúdo, sugestão de campanha, análise de desempenho de canal e recomendação de próximo passo editorial ou de mídia paga.

O Branding Hub fornece ao AI Hub, através do Branding Connector já descrito no Capítulo 14, a identidade de marca que informa todo conteúdo gerado em nome da empresa.

O Knowledge Hub fornece ao AI Hub, através do Knowledge Connector já descrito no Capítulo 12, o conhecimento acumulado que enriquece respostas específicas de cada empresa.

O Identity Hub fornece ao AI Gateway a informação de autenticação e permissão necessária para validar cada solicitação antes que ela avance no pipeline interno do Hub.

O Analytics Hub consome o dado de observabilidade produzido pelo AI Hub — descrito no Capítulo 18 —, transformando-o em indicadores de negócio sobre uso, custo e eficácia da inteligência artificial ao longo do tempo.

O Business Profile Engine fornece ao AI Hub, através do Business Profile Connector já descrito no Capítulo 13, o entendimento de segmento que adapta o comportamento da IA a cada tipo de negócio.

O Integration Hub é o canal através do qual, quando aplicável, uma capacidade de IA processada pelo AI Hub precisa alcançar um sistema externo à plataforma — sempre respeitando a regra arquitetural geral de que nenhuma integração externa acontece fora do Integration Hub, o que se aplica ao AI Hub exatamente como se aplica a qualquer outro Hub da plataforma.

Em cada uma dessas integrações, a direção do contrato é sempre a mesma: o Hub consumidor solicita uma capacidade em termos de negócio, e o AI Hub decide, internamente, como atendê-la — nunca o inverso.

---

## 24. Architecture Decision Records

As decisões abaixo são registradas formalmente como Architecture Decision Records do AI Hub, e nenhuma delas pode ser revertida sem um novo ADR que documente explicitamente o motivo da mudança e as alternativas consideradas.

**ADR-001 — Nenhum módulo conversa diretamente com provedores de IA.** Toda comunicação com OpenAI, Claude, Gemini, DeepSeek, Ollama ou qualquer outro provedor acontece exclusivamente através da Provider Layer do AI Hub. Contexto: permitir comunicação direta produziria, de forma inevitável, o padrão fragmentado descrito no Capítulo 3. Alternativas descartadas: permitir exceções pontuais para módulos de alta prioridade — rejeitada por criar precedente que corroeria a regra ao longo do tempo.

**ADR-002 — Toda inteligência artificial passa pelo AI Hub.** Não existe capacidade de IA na plataforma que não seja solicitada, processada e registrada pelo AI Hub. Contexto: esta é a aplicação direta da filosofia central descrita no Capítulo 4. Alternativas descartadas: permitir que módulos com necessidade muito específica implementem sua própria integração isolada — rejeitada por eliminar toda garantia de observabilidade e governança centralizada.

**ADR-003 — Contexto é separado do Prompt.** O Context Manager e o Prompt Engine são componentes distintos, com responsabilidades distintas, mesmo que operem em sequência imediata um do outro. Contexto: essa separação permite que a lógica de reunião de contexto evolua independentemente da lógica de composição de texto final, e reforça o princípio Context Before Prompt descrito no Capítulo 5.

**ADR-004 — Memória é independente do modelo.** A persistência de memória não está acoplada a nenhum provedor ou modelo específico, e continua disponível mesmo que o provedor usado para processar uma solicitação mude. Contexto: acoplar memória a um provedor específico tornaria qualquer troca de provedor equivalente a uma perda de histórico, o que é inaceitável dado o princípio de Provider Agnostic.

**ADR-005 — Provider Agnostic é regra estrutural, não preferência.** Nenhum componente do AI Hub pode ser desenhado assumindo permanência de um único provedor. Contexto: o mercado de modelos de linguagem muda com velocidade que tornaria qualquer compromisso de longo prazo com um único provedor um risco estratégico inaceitável para uma plataforma pensada para durar dez anos.

**ADR-006 — Toda solicitação é rastreável de ponta a ponta.** Nenhuma resposta gerada pela plataforma pode existir sem uma cadeia de rastreamento completa, do módulo solicitante à resposta final. Contexto: sem essa garantia, investigar comportamento inadequado de IA se torna impossível, comprometendo tanto governança quanto confiança do cliente na plataforma.

**ADR-007 — Custo é uma propriedade observável de primeira classe.** Todo consumo de token é medido e atribuído a uma empresa, a um módulo e a uma solicitação específica, sem exceção. Contexto: a ausência dessa atribuição é a causa raiz mais comum de custo descontrolado em plataformas de IA, conforme descrito no Capítulo 3.

**ADR-008 — Isolamento entre empresas é absoluto e estrutural.** Nenhuma solicitação de uma empresa pode, sob nenhuma circunstância, ter acesso a dado de outra, independentemente de infraestrutura técnica compartilhada. Contexto: esta é uma condição de confiança inegociável para uma plataforma multiempresa, detalhada no Capítulo 20.

**ADR-009 — Nenhuma ação de alto impacto é executada sem supervisão humana explícita.** Ações com implicação financeira, jurídica ou reputacional relevante exigem confirmação humana, independentemente do nível de confiança já demonstrado pela IA em decisões anteriores. Contexto: aplicação direta do princípio Human Oversight descrito no Capítulo 5, e alinhado à mesma regra de aprovação humana já estabelecida no manifesto geral da plataforma para qualquer gasto de mídia paga ou decisão de alto impacto.

**ADR-010 — Prompts em produção são sempre versionados.** Nenhuma alteração de prompt é aplicada em produção sem passar por revisão e versionamento equivalente ao aplicado a mudança de código. Contexto: um prompt mal ajustado pode degradar comportamento da plataforma inteira de forma tão severa quanto um defeito de software, e precisa do mesmo rigor de controle de mudança.

---

## 25. Roadmap

No curto prazo, a prioridade é estabelecer a espinha dorsal descrita neste documento em sua forma mais essencial: o AI Gateway como ponto único de entrada, a Provider Factory suportando ao menos os provedores mais imediatamente necessários, o Prompt Engine com suas quatro camadas de composição, e a observabilidade mínima — Logging, Tracing e Metrics — funcionando desde a primeira solicitação processada em produção. Sem essa base, nenhuma capacidade adicional descrita neste documento pode ser construída com segurança.

No médio prazo, a prioridade se desloca para profundidade de contexto e de memória: o Context Manager operando com todas as suas camadas — usuário, empresa, módulo, conversa, histórico, Business Profile e Branding —, o Memory Engine com as seis combinações de titularidade e duração plenamente funcionais, e o Cost Manager com política de orçamento e alerta ativa por empresa. É também neste horizonte que a integração plena com Knowledge Hub, Business Profile Engine e Branding Hub deve amadurecer, transformando o AI Hub de uma camada de acesso a modelos em uma camada de inteligência verdadeiramente contextualizada.

No longo prazo, a prioridade é a inteligência evolutiva descrita no Capítulo 22 em sua forma mais completa: aprendizado contínuo e isolado por empresa, refinamento automático de prompt com base em padrão de qualidade observado ao longo do tempo, roteamento de modelo cada vez mais sofisticado com base em custo, qualidade e capacidade específica de cada tarefa, e uma camada de governança madura o suficiente para que decisões de política sejam ajustadas por configuração, não por intervenção de engenharia. Este é também o horizonte em que a plataforma deve estar preparada para adicionar qualquer provedor futuro que venha a surgir no mercado, com o mesmo esforço mínimo já garantido, por desenho, desde o primeiro dia.

---

## 26. Conclusão

O AI Hub é o cérebro da Adaptive Business Platform. Sem ele, a plataforma seria apenas um conjunto de módulos de negócio, cada um com sua própria integração isolada de inteligência artificial, cada um repetindo os mesmos erros que arquiteturas tradicionais cometem há anos — acoplamento a provedor, duplicação de prompt, custo descontrolado, ausência de memória, ausência de observabilidade.

Com ele, a plataforma se torna algo estruturalmente diferente: um organismo inteligente, no qual toda capacidade de IA compartilha a mesma fundação de contexto, memória, segurança e governança, independentemente de qual módulo a solicitou ou qual provedor efetivamente a processou. É essa fundação única que permite à plataforma cumprir sua missão central — adaptar-se ao negócio, em vez de exigir que o negócio se adapte a ela — em escala, com segurança, e de forma sustentável ao longo dos próximos dez anos.

Todo desenvolvedor que constrói sobre esta plataforma constrói sobre esta premissa: inteligência artificial não é uma funcionalidade que um módulo implementa. É uma capacidade que um módulo solicita ao AI Hub. Essa distinção, sozinha, é o que separa uma plataforma verdadeiramente inteligente de uma coleção de funcionalidades que apenas usam inteligência artificial.
