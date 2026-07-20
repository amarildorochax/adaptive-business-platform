# SaaS Architecture — Arquitetura Multiempresa da Plataforma

**Adaptive Business Platform · Documento Técnico Oficial**

---

## 1. Introdução

Este documento define como a Adaptive Business Platform funciona como Software as a Service — como ela é vendida, provisionada, isolada por cliente, configurada, escalada e operada para milhares de empresas simultaneamente, ao longo de muitos anos, sem que o crescimento do número de clientes exija reescrever a arquitetura central.

Três documentos oficiais já existem e não são repetidos aqui. `PLATFORM_MANIFESTO.md` define missão, princípios e filosofia de produto — por que a plataforma existe e o que ela nunca deve se tornar. `AI_HUB.md` define, em profundidade, o subsistema de inteligência artificial — como toda capacidade de IA é centralizada, contextualizada e governada. `SYSTEM_BLUEPRINT.md` define o mapa estrutural da plataforma — camadas, Hubs, fluxos e regras de comunicação entre componentes.

Este documento ocupa um espaço diferente dos três anteriores: onde o Blueprint mostra a arquitetura técnica de camadas e Hubs, este documento explica a arquitetura comercial e operacional que torna essa mesma plataforma vendável, provisionável e administrável como um produto SaaS — o modelo de Tenant, a hierarquia de contas e usuários, os planos comerciais, o controle de permissões, a jornada de onboarding, e os cenários de administração multiempresa como agências e franquias. Onde um conceito já foi definido em profundidade em um dos três documentos anteriores — isolamento entre Tenants, comunicação entre Hubs, segurança da camada de IA — ele é referenciado explicitamente aqui, nunca reexplicado.

O padrão de qualidade deste documento é o mesmo dos três anteriores: escrito para servir como referência de treinamento de novos arquitetos e desenvolvedores, hoje e daqui a muitos anos, independentemente de quantas vezes a equipe responsável por construir a plataforma tenha mudado entre o momento em que este documento foi escrito e o momento em que é lido.

---

## 2. O que é a Adaptive Business Platform

A Adaptive Business Platform não é um CRM. Um CRM gerencia relacionamento com cliente; esta plataforma inclui essa capacidade, mas não se define por ela. Não é um ERP. Um ERP centraliza processos operacionais e financeiros de uma empresa; esta plataforma inclui essa capacidade, mas não se define por ela. Não é uma plataforma de automação. Automação é um dos Hubs que a compõe, não sua identidade central. E não é uma plataforma de inteligência artificial no sentido de um produto construído em torno de um único assistente conversacional — a inteligência artificial é fundação, conforme já estabelecido em `AI_HUB.md`, mas fundação não é a mesma coisa que produto.

A Adaptive Business Platform é uma plataforma empresarial adaptativa: um sistema único que se comporta de forma diferente para cada empresa que a utiliza, ajustando automaticamente interface, inteligência, módulos disponíveis, indicadores relevantes e identidade visual ao perfil de cada negócio, sem exigir que essa adaptação seja configurada manualmente por quem a opera.

Do ponto de vista de arquitetura SaaS, essa definição tem uma consequência direta: a plataforma precisa suportar, sob o mesmo núcleo técnico, clientes tão diferentes entre si quanto uma floricultura de bairro e uma rede de clínicas com múltiplas unidades — cada um vendo uma versão da plataforma que parece ter sido construída sob medida, enquanto, por baixo, todos compartilham exatamente a mesma base de código, a mesma infraestrutura e o mesmo modelo de dados. Esse é o desafio central que a arquitetura SaaS descrita neste documento resolve.

---

## 3. Filosofia SaaS

A filosofia geral da plataforma já está descrita em `PLATFORM_MANIFESTO.md`. Esta seção aplica essa filosofia especificamente à decisão de operar como Software como Serviço, e não como software licenciado e instalado individualmente por cada cliente.

Software como Serviço significa que a plataforma é operada centralmente, por uma única equipe, para todos os clientes simultaneamente — nenhum cliente instala, atualiza ou mantém sua própria cópia do sistema. Essa decisão é o que viabiliza todo o restante deste documento: sem operação centralizada, não haveria como garantir configuração adaptativa uniforme, nem evolução contínua sem fricção de migração cliente a cliente.

Escalabilidade, aqui, não é apenas uma propriedade técnica — é uma condição comercial. Uma plataforma SaaS que não escala de forma previsível não consegue precificar de forma sustentável, porque o custo de atender um novo cliente deixa de ser marginal e passa a ser incerto. A arquitetura descrita neste documento existe para que adicionar o milésimo Tenant custe, em termos de esforço de engenharia, o mesmo que adicionar o primeiro.

Configuração acima de customização é uma escolha deliberada e central a esta plataforma. Customização, no sentido tradicional de software empresarial, significa alterar código ou lógica de negócio para cada cliente específico — uma prática que fragmenta a base de código em múltiplas variantes divergentes, cada uma exigindo manutenção própria. Configuração significa que o mesmo código se comporta de forma diferente com base em dado e em parâmetro, nunca em uma ramificação de código dedicada a um cliente específico. Esta plataforma escolhe configuração deliberadamente contra customização, porque é essa escolha que torna a promessa central do Manifesto — adaptação automática, sem exigir projeto de implementação — tecnicamente sustentável em escala.

Multiempresa é tratado como propriedade estrutural desde a primeira linha de código, não como uma capacidade adicionada depois. Isso é aprofundado ao longo deste documento, em particular nos Capítulos 5 e 6.

Evolução contínua significa que a plataforma nunca para de mudar, e que essa mudança precisa alcançar todos os clientes ao mesmo tempo, de forma uniforme — nunca uma versão para um cliente e outra versão, defasada, para outro.

Atualizações transparentes são a consequência direta da evolução contínua: um cliente nunca precisa agendar uma janela de manutenção, aprovar uma migração, ou notar, de forma disruptiva, que uma nova versão foi implantada. A atualização acontece por trás da experiência contínua de uso, exatamente como esperado de qualquer serviço de nuvem moderno.

Baixo acoplamento e arquitetura modular já foram estabelecidos como princípios centrais em `SYSTEM_BLUEPRINT.md` — aqui, eles reaparecem apenas como pré-condição para que multiempresa e evolução contínua sejam, de fato, alcançáveis: um sistema fortemente acoplado não pode ser atualizado de forma transparente para milhares de clientes ao mesmo tempo sem risco elevado de regressão simultânea e generalizada.

---

## 4. Arquitetura Geral do SaaS

```
                              Cliente
                        (a Empresa que contrata)
                                 │
                                 ▼
                              Tenant
                    (unidade máxima de isolamento)
                                 │
                                 ▼
                              Empresa
                       (Workspace operacional)
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
                Usuário      Usuário      Usuário
                    │            │            │
                    ▼            ▼            ▼
                 Perfil       Perfil       Perfil
           (Papel + Permissões concedidas)
                                 │
                                 ▼
                             Módulos
                (ativados conforme plano e Business Profile)
                                 │
                                 ▼
                               Hubs
        (CRM, Finance, Growth, Automation, Communication,
         Branding, Knowledge, Analytics, Business Profile Engine)
                                 │
                                 ▼
                              AI Hub
                (única via de acesso a inteligência artificial)
                                 │
                                 ▼
                          Infraestrutura
        (Event Bus, Filas, Cache, Observability, Data Layer —
         detalhados em SYSTEM_BLUEPRINT.md)
```

Esta visão geral é a coluna vertebral de todo o restante do documento: um Cliente contrata a plataforma e se torna um Tenant; dentro desse Tenant existe uma ou mais Empresas operando como Workspace; cada Empresa tem Usuários, cada Usuário tem um Perfil de acesso; os Módulos disponíveis a cada Empresa dependem tanto do plano comercial contratado quanto do Business Profile identificado; os Módulos são a superfície visível dos Hubs já descritos no Blueprint; todo Hub que precisa de inteligência passa pelo AI Hub; e tudo isso é sustentado pela Infraestrutura já detalhada no Blueprint, sem que este documento precise repeti-la.

---

## 5. Tenant Model

O modelo de Tenant é o alicerce comercial e técnico de toda a arquitetura multiempresa. Esta seção define, com precisão, cada termo que compõe esse modelo — precisão que evita a ambiguidade comum em plataformas SaaS onde "conta", "organização" e "empresa" são usados de forma intercambiável e, com o tempo, passam a significar coisas ligeiramente diferentes em partes diferentes do sistema.

**Tenant** é a unidade máxima de isolamento técnico da plataforma. Todo dado, toda configuração, toda memória de IA, todo conhecimento pertence a exatamente um Tenant, e nenhum Tenant tem acesso técnico ao dado de outro, independentemente de infraestrutura física compartilhada — regra já estabelecida em `SYSTEM_BLUEPRINT.md` e aqui tratada como base para tudo o que segue.

**Empresa** é a unidade de negócio operando dentro de um Tenant. Na maioria dos casos, um Tenant contém exatamente uma Empresa — o cenário mais simples e mais comum, correspondente a uma pequena ou média empresa contratando a plataforma para sua própria operação. Em cenários de agência, franquia ou grupo empresarial, detalhados no Capítulo 21, um único Tenant pode conter múltiplas Empresas, cada uma com seu próprio Workspace, Business Profile e Branding, mas compartilhando uma camada de administração consolidada.

**Conta** é o registro comercial e de faturamento associado ao Tenant — quem paga, qual plano está contratado, qual é o ciclo de cobrança. A Conta é uma entidade administrativa, distinta da Empresa: uma mesma Conta pode, em cenários de agência, sustentar múltiplas Empresas sob Tenants distintos ou sob um único Tenant compartilhado, conforme o modelo de relacionamento escolhido.

**Organização** é o termo usado para descrever o agrupamento de múltiplas Empresas sob uma mesma governança administrativa, mesmo quando essas Empresas mantêm Tenants tecnicamente distintos entre si. Uma Organização não implica compartilhamento de dado operacional — implica apenas visibilidade administrativa consolidada, como detalhado no Capítulo 21.

**Workspace** é o ambiente de trabalho efetivo de uma Empresa — o que um Usuário vê e opera no dia a dia. Um Workspace é sempre associado a exatamente uma Empresa e, por consequência, a exatamente um Tenant.

**Usuário** é uma pessoa com credencial de acesso à plataforma, associada a um ou mais Workspaces através de um Perfil específico em cada um.

**Convites** são o mecanismo pelo qual um novo Usuário ganha acesso a um Workspace existente — emitidos por alguém com permissão administrativa dentro daquele Workspace, e resolvidos através do Identity Hub já descrito em `SYSTEM_BLUEPRINT.md`.

**Propriedade** identifica o Usuário, ou o conjunto de Usuários, com autoridade máxima sobre um Tenant — tipicamente o papel de Owner, detalhado no Capítulo 11, com autoridade que nenhum outro Perfil possui, incluindo a capacidade de transferir essa mesma propriedade a outro Usuário.

**Administração** é o conjunto de capacidades de configuração e gestão de acesso disponíveis dentro de um Workspace, distintas da operação do negócio em si — convidar usuários, ajustar permissões, configurar módulos ativos.

**Hierarquia** descreve a relação estrutural entre esses conceitos: um Tenant pode conter uma ou mais Empresas; uma Empresa tem um ou mais Workspaces, na prática normalmente um único Workspace por Empresa; um Workspace tem um ou mais Usuários; e uma Organização pode agrupar múltiplos Tenants sob uma governança administrativa comum.

```
Organização (opcional, apenas em cenários de agência/franquia/grupo)
   │
   ├── Tenant A ── Empresa A ── Workspace A ── Usuários A (Perfis)
   ├── Tenant B ── Empresa B ── Workspace B ── Usuários B (Perfis)
   └── Tenant C ── Empresa C ── Workspace C ── Usuários C (Perfis)
```

**Relacionamentos** entre essas entidades seguem uma regra simples: a hierarquia descrita acima é sempre de um para muitos, nunca de muitos para muitos — um Usuário pode ter acesso a múltiplos Workspaces, mas cada acesso é um relacionamento distinto e independente, com seu próprio Perfil, nunca um único Perfil compartilhado entre Workspaces diferentes.

---

## 6. Multiempresa

O isolamento técnico entre Tenants já foi descrito, em nível de arquitetura de dados e de fluxo, em `SYSTEM_BLUEPRINT.md`. Esta seção detalha, em nível operacional, cada categoria de informação que precisa desse isolamento e o mecanismo específico que o garante para cada uma.

Isolamento lógico é o princípio geral: múltiplos Tenants compartilham a mesma infraestrutura física, mas cada consulta, cada gravação e cada evento carrega um identificador de Tenant que é verificado em todo ponto de acesso, nunca assumido implicitamente.

Dados operacionais — registros de CRM, transações financeiras, campanhas de Growth — são fisicamente segregados por Tenant na Data Layer, com todo acesso passando por uma verificação de Tenant resolvida no momento da autenticação, nunca decidida por um parâmetro que o próprio cliente da API poderia manipular.

Arquivos — documentos enviados, imagens, materiais gerados — seguem a mesma regra de segregação, armazenados sob um espaço de nome exclusivo por Tenant, de forma que um identificador de arquivo de um Tenant nunca seja, mesmo acidentalmente, resolvível dentro do contexto de outro.

IA é isolada na camada de contexto e de memória, exatamente como detalhado em `AI_HUB.md`: nenhuma solicitação processada em nome de um Tenant tem acesso a memória, contexto ou histórico de outro, mesmo quando ambos são atendidos pelo mesmo provedor de modelo de linguagem no mesmo instante.

Knowledge é isolado por Tenant no Knowledge Hub — o conhecimento indexado para uma Empresa nunca é consultável, nem mesmo de forma agregada e anonimizada, por outra, salvo nos cenários explícitos de agregação de mercado descritos no Capítulo 22 do `AI_HUB.md`, que operam sob política própria e nunca por acidente de configuração.

Branding é isolado por Tenant — a identidade visual e de tom de uma Empresa nunca aparece, nem parcialmente, em conteúdo gerado ou exibido a outra.

Automações são isoladas por Tenant, incluindo qualquer regra configurada pela própria Empresa através do Automation Hub — uma automação criada por um cliente nunca é executada, nem parcialmente, no contexto de outro.

Eventos são isolados por Tenant no Event Bus, conforme já estabelecido em `SYSTEM_BLUEPRINT.md`: um evento publicado por um Tenant nunca é entregue a um consumidor operando em nome de outro.

Permissões são isoladas por Tenant — um Usuário com Perfil de Administrador em um Workspace não carrega, implicitamente, nenhuma autoridade sobre outro Workspace, mesmo que a mesma pessoa tenha acesso a ambos.

A forma mais comum de vazamento de informação entre empresas em plataformas SaaS mal projetadas não é uma falha de criptografia ou de rede — é um identificador de Tenant esquecido em uma consulta, um cache compartilhado sem chave de segregação, ou um processo em lote que itera sobre múltiplos Tenants sem isolar corretamente o contexto de cada iteração. Por isso, a arquitetura desta plataforma trata a presença do identificador de Tenant como obrigatória em toda consulta, toda gravação, todo evento e todo processo em lote, sem exceção configurável — a ausência desse identificador não deve resultar em acesso amplo por padrão, deve resultar em falha explícita da operação.

---

## 7. Business Profile Engine

O Business Profile Engine já foi introduzido em `PLATFORM_MANIFESTO.md` e posicionado estruturalmente em `SYSTEM_BLUEPRINT.md`. Esta seção não repete sua definição — foca em como o perfil de negócio que ele produz influencia, especificamente, a arquitetura SaaS descrita neste documento.

O Business Profile de uma Empresa determina quais Menus aparecem em destaque na navegação, ocultando capacidades irrelevantes para aquele segmento sem removê-las tecnicamente do sistema — uma floricultura não vê, por padrão, menus voltados a gestão de estoque hospitalar, mas esses menus continuam existindo na plataforma, disponíveis a qualquer Empresa cujo perfil os torne relevantes.

Determina quais KPIs aparecem primeiro em dashboards e relatórios, priorizando o indicador que aquele tipo de negócio historicamente mais usa para decisão, sem impedir acesso aos demais indicadores disponíveis na plataforma.

Determina quais Widgets são sugeridos por padrão em um dashboard recém-criado, e quais Templates de comunicação, campanha ou documento são oferecidos como ponto de partida.

Determina quais Fluxos de trabalho o Automation Hub sugere como automações candidatas — o mesmo mecanismo de sugestão, mas alimentado por perfis de negócio diferentes, produz sugestões completamente distintas para uma clínica e para uma loja de varejo.

Informa o AI Hub, através do Business Profile Connector já descrito em `AI_HUB.md`, o vocabulário e as prioridades que moldam toda resposta gerada em nome daquela Empresa — sem que este documento repita o detalhe já coberto ali.

Informa o Branding, na medida em que o tom aplicado pelo Branding Hub é calibrado em conjunto com o segmento identificado — uma comunicação formal por padrão para um escritório de advocacia, uma comunicação mais próxima e direta por padrão para uma loja de moda jovem, ainda que o Branding em si seja uma camada distinta, detalhada no capítulo seguinte.

Determina quais Automações são recomendadas com maior prioridade — não porque o Automation Hub conheça o segmento diretamente, mas porque ele consome o mesmo evento `ProfileChanged` já descrito em `SYSTEM_BLUEPRINT.md`.

Do ponto de vista de arquitetura SaaS, o valor central do Business Profile Engine é evitar que a plataforma precise manter versões de produto separadas por segmento — a mesma base de código e o mesmo conjunto de Módulos produzem experiências radicalmente diferentes, porque a camada de configuração adaptativa, detalhada no Capítulo 13, consome o mesmo perfil de negócio de formas diferentes em cada ponto de contato.

---

## 8. Branding Inteligente

Cada Empresa dentro da plataforma possui identidade própria, e essa identidade é aplicada de forma automática a toda superfície onde a Empresa se apresenta — sem exigir configuração manual em cada uma dessas superfícies individualmente.

A partir da Logo enviada pela Empresa, o Branding Hub deriva uma Paleta de cores consistente com a marca, uma escolha de Tipografia compatível com o tom visual identificado, e um Estilo geral de componente de interface que reflete essa identidade sem exigir que a Empresa descreva, em detalhe técnico, o que deseja.

O Tom de comunicação — formal, próximo, técnico, descontraído — é definido em conjunto com o Business Profile, e aplicado consistentemente a toda comunicação gerada em nome da Empresa, seja por um humano usando um Template sugerido, seja pela inteligência artificial gerando uma resposta através do AI Hub.

Assets — imagens, ícones, elementos gráficos — associados àquela marca são organizados e disponibilizados para reuso em qualquer Módulo que produza conteúdo visual em nome da Empresa, evitando que cada Módulo precise de sua própria biblioteca de ativos visuais desconectada das demais.

Templates de documento, relatório, apresentação e campanha já nascem configurados com essa identidade aplicada, ao invés de exigir que a Empresa aplique manualmente cor por cor e fonte por fonte a cada novo material produzido.

O Dashboard da Empresa reflete essa identidade em sua própria superfície — não apenas em conteúdo gerado para o cliente final, mas na própria experiência de uso da plataforma pela equipe daquela Empresa, reforçando a sensação de exclusividade central ao produto, já descrita no Manifesto.

Comunicação — mensagens enviadas a Leads e Clientes através do Communication Hub — carrega essa mesma identidade de tom e, quando aplicável, de elemento visual, de forma consistente entre canais diferentes: WhatsApp, e-mail e redes sociais devem soar como a mesma marca, não como três sistemas desconectados aplicando personalização de forma independente.

Do ponto de vista de arquitetura SaaS, o ponto central é que Branding nunca é implementado como uma feature configurável manualmente pela Empresa — é derivado automaticamente, propagado por evento (`BrandUpdated`, já descrito em `SYSTEM_BLUEPRINT.md`), e consumido de forma uniforme por todo Módulo que produz qualquer superfície visível ao Cliente ou ao usuário final daquela Empresa.

---

## 9. Modularidade

A plataforma é composta por Módulos — unidades de capacidade de negócio, cada uma associada a um Hub específico — que podem ser individualmente ativados ou desativados por Empresa, de acordo com plano contratado, Business Profile identificado, ou escolha explícita do Administrador daquele Workspace.

Módulos obrigatórios são aqueles sem os quais a plataforma não opera de forma coerente para nenhuma Empresa — tipicamente vinculados ao Identity Hub, ao AI Hub em seu núcleo, e a capacidades mínimas de CRM e Dashboard. Módulos opcionais são todos os demais — Growth, Automation avançada, Finance completo, Knowledge — ativáveis de forma independente, sem que sua ausência comprometa a operação dos módulos obrigatórios.

Dependências entre Módulos são declaradas explicitamente: um Módulo pode exigir que outro esteja ativo como pré-condição — por exemplo, um Módulo de campanhas de e-mail pode depender de um Módulo de segmentação de contato já ativo — mas essa dependência é sempre declarada e verificada no momento da ativação, nunca descoberta apenas em tempo de execução através de uma falha inesperada.

Versionamento de Módulo permite que uma nova versão de capacidade seja disponibilizada de forma independente das demais, e que diferentes Empresas possam, temporariamente, operar em versões diferentes de um mesmo Módulo durante uma transição — nunca de forma permanente, mas de forma suficiente para permitir migração gradual e segura de uma base de clientes muito grande.

Ativação de um Módulo é o processo pelo qual ele passa a estar disponível dentro de um Workspace específico — verificando dependências, aplicando configuração inicial adequada ao Business Profile daquela Empresa, e emitindo o evento correspondente para que os demais Módulos e Hubs relevantes possam reagir.

Desativação segue o caminho inverso, preservando o dado já produzido por aquele Módulo — desativar um Módulo nunca implica exclusão de dado histórico, apenas remoção de acesso operacional até uma eventual reativação futura.

Extensibilidade é a propriedade que permite adicionar um Módulo inteiramente novo à plataforma sem alterar nenhum Módulo já existente — consequência direta dos princípios de baixo acoplamento e comunicação por evento já estabelecidos em `SYSTEM_BLUEPRINT.md`.

Marketplace futuro é a extensão natural dessa extensibilidade: um espaço onde Módulos desenvolvidos por terceiros, seguindo o mesmo contrato de integração que os Módulos nativos da plataforma, podem ser oferecidos a Empresas específicas — já antecipado, em nível de visão de produto, no Manifesto, e aqui reafirmado como consequência arquitetural direta da modularidade descrita nesta seção, não como uma capacidade que exigiria uma reformulação estrutural para existir.

---

## 10. Planos da Plataforma

A arquitetura de planos comerciais é construída sobre o mesmo mecanismo de Feature Flags já introduzido em `AI_HUB.md` — um Módulo ou uma capacidade específica dentro de um Módulo pode estar disponível, ou não, para uma Empresa específica, com base em uma configuração central, sem que isso exija nenhuma ramificação de código.

```
                       Feature Flags por Plano
   ┌─────────────────────────────────────────────────────────┐
   │  Starter        Professional     Business     Enterprise │
   │  ─────────       ────────────    ─────────    ────────── │
   │  Módulos         + Automation    + Finance     + Módulos │
   │  essenciais       avançada        completo      customi- │
   │  (CRM, Dash-     + Growth        + múltiplos    záveis   │
   │  board, IA        básico          Workspaces    + SLA    │
   │  básica)                          (agência)      dedicado│
   └─────────────────────────────────────────────────────────┘
```

Starter representa o ponto de entrada — os Módulos essenciais para uma Empresa começar a operar dentro da plataforma, incluindo a jornada completa de onboarding descrita no Capítulo 12, mas com limites de uso de inteligência artificial e de automação mais restritos, geridos pelo Cost Manager e pelo Token Manager já descritos em `AI_HUB.md`.

Professional adiciona capacidade de automação mais sofisticada e um conjunto inicial de capacidades de Growth, voltado a Empresas que já passaram da fase de operação básica e estão ativamente investindo em aquisição.

Business adiciona capacidade financeira completa e a possibilidade de operar múltiplos Workspaces sob uma única Conta — o primeiro ponto em que a arquitetura de Organização, descrita no Capítulo 5 e aprofundada no Capítulo 21, se torna diretamente relevante para o cliente.

Enterprise adiciona capacidade de customização de Módulo dentro dos limites da arquitetura de configuração adaptativa — nunca customização de código, conforme o princípio já estabelecido no Capítulo 3 —, além de acordo de nível de serviço dedicado, sustentado pela mesma infraestrutura de observabilidade e escalabilidade já descrita em `SYSTEM_BLUEPRINT.md`.

Este documento não define preço nem posicionamento comercial de cada plano — essa é uma decisão de produto e de mercado, fora do escopo de um documento de arquitetura. O que este documento define é o mecanismo: todo plano é uma combinação nomeada de Feature Flags, resolvida no momento em que uma requisição atravessa o Policy Engine já descrito em `AI_HUB.md`, nunca uma versão de código separada da plataforma. Um upgrade ou downgrade de plano é, tecnicamente, uma mudança de configuração — nunca uma migração de sistema.

---

## 11. Controle de Permissões

A plataforma define um conjunto nomeado de Perfis, cada um representando um padrão típico de responsabilidade dentro de uma Empresa, embora Perfis possam ser ajustados por Workspace conforme a granularidade de Permissões descrita adiante.

```
                              Owner
                                │
                          Administrador
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
             Gerente        Financeiro      Marketing
                │                                │
                ▼                                ▼
            Operador                        Atendimento
                                                  │
                                                  ▼
                                             Convidado
```

Owner é o Perfil de maior autoridade dentro de um Tenant — tipicamente quem contratou a plataforma em nome da Empresa —, com capacidade exclusiva de transferir essa mesma propriedade, encerrar a Conta, ou alterar o plano contratado.

Administrador tem autoridade operacional plena dentro do Workspace, incluindo convidar e remover Usuários e ajustar Permissões de outros Perfis, mas não possui as capacidades exclusivas do Owner descritas acima.

Gerente tem visão e controle operacional amplo dentro de uma área específica — CRM, Growth, Operações — sem acesso à configuração administrativa geral do Workspace.

Operador executa tarefas do dia a dia dentro dos Módulos ativados, sem capacidade de alterar configuração de Módulo ou de Permissão de outros Usuários.

Financeiro tem acesso amplo de leitura e de operação especificamente dentro do Finance Hub, com acesso restrito ou apenas de leitura aos demais Hubs — refletindo o mesmo padrão de segregação de responsabilidade já descrito, para um contexto análogo, em `docs/requirements/growth/GOOGLE_ADS.md` e nos demais documentos de especificação funcional do Growth Hub.

Marketing tem acesso amplo de operação dentro do Growth Hub e do Communication Hub, com acesso de leitura a indicadores do Analytics Hub relevantes à sua área.

Atendimento tem acesso operacional ao Communication Hub e ao CRM Hub, focado na interação direta com Lead e Cliente, sem acesso a configuração de campanha ou a dado financeiro.

Convidado é o Perfil de menor autoridade — acesso de leitura limitado, tipicamente concedido a um consultor externo ou a um stakeholder que precisa apenas visualizar um relatório ou um dashboard específico, sem capacidade de alterar nenhum dado.

Permissões granulares operam abaixo desses Perfis nomeados: cada Perfil é, na prática, um conjunto pré-configurado de Permissões atômicas — ler Lead, criar Campanha, aprovar gasto de mídia, exportar relatório financeiro —, e um Administrador pode ajustar esse conjunto para um Usuário específico sem precisar criar um Perfil inteiramente novo para essa exceção pontual.

O modelo de controle de acesso primário da plataforma é RBAC — Role-Based Access Control —, no qual toda Permissão é concedida através da associação a um Perfil, e o Perfil é a unidade central de gestão de acesso. Esse modelo é suficiente para a esmagadora maioria dos cenários de uso e é o que sustenta a arquitetura descrita nesta seção.

A evolução prevista para essa arquitetura, à medida que a plataforma amadurece e passa a atender cenários de maior complexidade organizacional, é ABAC — Attribute-Based Access Control —, no qual uma Permissão pode depender não apenas do Perfil de um Usuário, mas de atributos contextuais adicionais: por exemplo, um Gerente de Growth com permissão de aprovar campanha apenas até um determinado valor de orçamento, ou um Financeiro com acesso a dado de uma unidade específica dentro de uma Organização com múltiplas Empresas. Essa evolução, quando implementada, estende o RBAC já existente — não o substitui —, e é tratada aqui como direção arquitetural futura, não como capacidade presente hoje.

---

## 12. Jornada de Onboarding

```
Cadastro
   │  criação da Conta e do Tenant inicial
   ▼
Empresa
   │  Workspace provisionado, primeiro Usuário torna-se Owner
   ▼
Business Profile
   │  segmento e objetivos informados → Business Profile Engine classifica
   ▼
Upload da Logo
   │  identidade visual bruta entregue ao Branding Hub
   ▼
Branding
   │  paleta, tipografia e tom derivados automaticamente
   ▼
Escolha dos Módulos
   │  Módulos recomendados conforme plano contratado e Business Profile
   ▼
Primeira Configuração
   │  parâmetros mínimos confirmados pelo Owner (nunca extensos)
   ▼
Primeira IA
   │  AI Hub já responde com contexto de segmento e marca aplicados
   ▼
Primeira Automação
   │  Automation Hub sugere fluxo típico do segmento identificado
   ▼
Primeiro Dashboard
   │  KPIs e widgets já priorizados conforme Business Profile
```

Cada etapa desta jornada corresponde a um Hub específico já descrito nos documentos anteriores, e nenhuma etapa exige que o Owner tome uma decisão técnica — toda decisão apresentada a ele é de negócio (qual segmento, qual objetivo, qual módulo ativar), nunca de configuração técnica de sistema.

A etapa de Escolha dos Módulos merece uma observação arquitetural específica: os Módulos apresentados como recomendados não são os mesmos para toda Empresa — eles são filtrados, primeiro, pelo plano comercial contratado, conforme o Capítulo 10, e em seguida priorizados pela recomendação do Business Profile Engine, conforme o Capítulo 7. O Owner sempre pode ativar qualquer Módulo disponível em seu plano, mesmo que não recomendado — a recomendação acelera a decisão, nunca a restringe.

O tempo total entre Cadastro e Primeiro Dashboard é a métrica de sucesso mais direta desta jornada, e o compromisso arquitetural implícito nela é que nenhuma etapa exija espera por intervenção humana de suporte ou de implementação — a jornada inteira é executável de ponta a ponta sem que ninguém, além do próprio Owner, precise agir.

---

## 13. Configuração Adaptativa

A configuração adaptativa é o mecanismo técnico por trás do conceito de Adaptive Experience já introduzido no Manifesto. Esta seção detalha como esse mecanismo opera, sem alterar código, para cada superfície listada.

```
     Business Profile + Plano + Preferências explícitas do Usuário
                              │
                              ▼
                     Motor de Configuração
           (resolve, para cada superfície, o conjunto de
            parâmetros aplicável a esta Empresa específica)
                              │
        ┌──────┬──────┬──────┼──────┬──────┬──────┬──────┐
        ▼      ▼      ▼      ▼      ▼      ▼      ▼      ▼
      Menus Widgets  KPIs  Fluxos Recomen- Automa- Modelos Templates
                                    dações   ções   de IA
```

Menus são renderizados a partir de uma lista de itens candidatos — todos os Módulos ativos naquele Workspace — filtrada e ordenada pela prioridade que o Business Profile atribui a cada um, nunca por uma versão de código diferente do componente de menu em si.

Widgets disponíveis em um Dashboard são resolvidos da mesma forma — um catálogo comum de Widgets, do qual um subconjunto é sugerido por padrão de acordo com o perfil identificado, mas nenhum Widget é tecnicamente exclusivo de um segmento específico.

KPIs seguem o mesmo padrão: o conjunto de indicadores calculáveis pela plataforma é o mesmo para toda Empresa; o que muda, por perfil, é quais desses indicadores aparecem primeiro e em destaque.

Fluxos de trabalho sugeridos pelo Automation Hub são resolvidos a partir de um catálogo de Fluxos candidatos, priorizado pelo mesmo mecanismo.

Recomendações — geradas tanto por regra determinística quanto, quando aplicável, pelo AI Hub — são compostas levando em conta o Business Profile como uma das camadas de contexto já descritas em `AI_HUB.md`, não reimplementadas neste documento.

Automações sugeridas seguem a mesma lógica de priorização de Fluxos, mas no nível de configuração pronta para ativação com um único gesto do Usuário, ao invés de apenas um catálogo consultável.

Modelos de IA, no sentido do modelo de linguagem efetivamente escolhido para uma solicitação, podem variar por plano — um plano Starter tende a rotear para modelos mais econômicos, enquanto um plano Enterprise pode priorizar modelos de maior capacidade — decisão tomada pelo Provider Manager já descrito em `AI_HUB.md`, informada pela configuração de plano descrita no Capítulo 10 deste documento.

Templates de documento, campanha e comunicação são filtrados e ordenados pela mesma combinação de Business Profile e Branding, garantindo que o primeiro Template sugerido a uma Empresa já reflita, tanto em conteúdo quanto em identidade visual, o contexto daquele negócio específico.

O ponto central desta seção, que resume toda a arquitetura de configuração adaptativa, é que nenhuma dessas oito superfícies é implementada como uma versão de código por segmento — todas são a mesma superfície de código, parametrizada por dado, o que é exatamente a aplicação prática do princípio "configuração acima de customização" já estabelecido no Capítulo 3.

---

## 14. Comunicação entre Módulos

A comunicação entre Módulos, dentro da arquitetura SaaS, segue exatamente as mesmas regras já detalhadas em `SYSTEM_BLUEPRINT.md`: eventos publicados em um barramento comum, baixo acoplamento entre Hubs de domínio, e integração mediada pelos Hubs, nunca por dependência direta entre dois Módulos de Empresas ou de áreas de negócio diferentes.

O que este documento acrescenta, específico à camada SaaS, é que essa comunicação é sempre escopada por Tenant: um Módulo ativo para a Empresa A publicando um evento nunca alcança um Módulo equivalente ativo para a Empresa B, mesmo quando ambos os Módulos são exatamente a mesma versão de código, executando na mesma infraestrutura compartilhada — reforço direto do isolamento já detalhado no Capítulo 6.

Um segundo ponto específico à camada SaaS é que a ativação ou desativação de um Módulo, descrita no Capítulo 9, é ela mesma comunicada por evento — nenhum Módulo consulta, de forma síncrona e repetida, se outro Módulo está ativo; ele reage ao evento correspondente, mantendo seu próprio estado local sincronizado, exatamente pelo mesmo princípio de baixo acoplamento que rege toda a plataforma.

---

## 15. Arquitetura de Dados

Esta seção descreve, em nível conceitual, as categorias de dado que a plataforma administra, sem definir banco de dados, esquema ou tecnologia de persistência específica — essas decisões pertencem a documentos de design técnico derivados, não a este documento de arquitetura.

Dados da Empresa cobrem todo registro operacional de negócio — Leads, Clientes, transações, campanhas, automações configuradas — sempre associados a exatamente um Tenant, conforme o Capítulo 6.

Dados do Usuário cobrem identidade, credencial, preferência pessoal e histórico de atividade de uma pessoa específica, gerido em conjunto pelo Identity Hub.

Configurações cobrem o estado de Módulos ativos, Feature Flags aplicadas, parâmetros de Business Profile e de Branding — o dado que determina como a plataforma se comporta para aquela Empresa específica, distinto do dado operacional que a Empresa produz ao usar a plataforma.

Eventos cobrem o registro de tudo o que já aconteceu e foi publicado no Event Bus, com retenção suficiente para permitir tanto processamento assíncrono quanto reconstrução de histórico para fins de auditoria.

Logs cobrem o registro técnico operacional já detalhado em `SYSTEM_BLUEPRINT.md`, com ciclo de vida tipicamente mais curto que o dos Eventos de negócio.

Arquivos cobrem todo material binário — imagens, documentos, mídia — associado a uma Empresa, isolado conforme já descrito no Capítulo 6.

Conhecimento cobre o material indexado pelo Knowledge Hub, consultável pelo AI Hub conforme já descrito em `AI_HUB.md`.

Memória da IA cobre os compartimentos de memória de curta e longa duração já detalhados em `AI_HUB.md`, tratados aqui apenas como mais uma categoria de dado sujeita às mesmas regras de isolamento e de conformidade com a LGPD já estabelecidas.

Cada uma dessas categorias tem seu próprio ciclo de vida esperado — algumas de retenção longa e praticamente permanente, como Dados da Empresa; outras de retenção mais curta e configurável, como Logs — mas todas compartilham, sem exceção, a mesma regra fundamental de associação obrigatória a um Tenant, e a mesma exigência de isolamento absoluto entre Tenants diferentes.

---

## 16. Segurança

A segurança da camada de IA já foi detalhada em `AI_HUB.md`, e o fluxo geral de autenticação, autorização e auditoria já foi diagramado em `SYSTEM_BLUEPRINT.md`. Esta seção acrescenta o que é específico à camada SaaS: gestão de sessão e proteção contra acesso cruzado entre Tenants em nível de aplicação, não apenas em nível de dado.

Autenticação identifica o Usuário através de credencial verificável, resolvida pelo Identity Hub, e determina, no mesmo momento, a que Tenant e a que Workspace essa sessão está associada — uma sessão nunca é ambígua quanto a esse contexto, mesmo quando o mesmo Usuário tem acesso a múltiplos Workspaces.

Autorização confirma, a cada ação, se o Perfil associado àquela sessão específica tem a Permissão necessária, conforme o modelo detalhado no Capítulo 11.

A LGPD é tratada com o mesmo rigor já descrito em `AI_HUB.md`, com uma extensão específica de camada SaaS: o direito de exclusão de um Usuário ou de uma Empresa precisa alcançar não apenas o dado operacional, mas cada uma das categorias descritas no Capítulo 15 — incluindo memória de IA, conhecimento indexado e arquivo armazenado —, e o encerramento de uma Conta deve prever, de forma explícita, o que acontece com cada uma dessas categorias após o encerramento, dentro do prazo de retenção legal aplicável.

Segregação, aqui, se refere especificamente à prevenção de acesso cruzado entre Tenants na camada de sessão de aplicação: um token de autenticação válido para o Workspace A nunca é aceito como válido para uma operação no Workspace B, mesmo que emitido para o mesmo Usuário, e mesmo que ambos os Workspaces pertençam à mesma Organização descrita no Capítulo 21.

Auditoria preserva o registro imutável de toda ação sensível de administração — mudança de Perfil, convite de novo Usuário, alteração de plano, exclusão de dado — exatamente como já detalhado em `SYSTEM_BLUEPRINT.md`, aqui reforçado como particularmente crítico em cenários de Organização com administração consolidada, onde uma ação tomada por um administrador de agência afeta múltiplas Empresas-cliente simultaneamente.

Criptografia é aplicada a todo dado em trânsito e em repouso, com atenção específica a Configurações e a Dados da Empresa de natureza financeira, sujeitos ao mesmo padrão de proteção aplicado a qualquer dado pessoal sensível.

Logs de segurança — distintos dos Logs operacionais gerais — registram especificamente tentativa de autenticação falha, mudança de Permissão, e qualquer padrão de acesso anômalo, alimentando alertas dedicados de segurança, separados dos alertas operacionais gerais já descritos em `SYSTEM_BLUEPRINT.md`.

Sessões têm tempo de vida limitado e são invalidadas de forma explícita quando uma Permissão relevante muda — se um Administrador remove o acesso de um Usuário a um Workspace, a sessão ativa daquele Usuário para aquele Workspace é invalidada de forma imediata, não apenas na próxima renovação natural de token.

Proteção contra acesso cruzado é o resultado combinado de todas as medidas acima: mesmo uma falha em uma única camada de proteção não deveria, isoladamente, permitir acesso de um Tenant a dado de outro — a arquitetura é desenhada para exigir múltiplas falhas simultâneas e independentes antes que um vazamento entre empresas se torne tecnicamente possível.

---

## 17. Escalabilidade

Os mecanismos de Horizontal Scaling, Queues, Workers, Cache, Streaming, Provider Failover e Circuit Breaker já foram detalhados em `SYSTEM_BLUEPRINT.md` e não são repetidos aqui. Esta seção acrescenta os elementos específicos à operação SaaS multiempresa em larga escala que o Blueprint não cobriu.

Escalabilidade Vertical continua relevante para cargas de trabalho específicas de uma única Empresa muito grande dentro de um Tenant Enterprise — um volume de dado ou de processamento concentrado que se beneficia de maior capacidade de uma única instância, em complemento, nunca em substituição, à escalabilidade horizontal que sustenta o crescimento do número de Tenants.

CDN — Content Delivery Network — distribui globalmente os ativos estáticos e as respostas cacheáveis da plataforma, incluindo os Assets de Branding específicos de cada Empresa descritos no Capítulo 8, reduzindo latência para Usuários geograficamente distantes da infraestrutura central de processamento.

Alta disponibilidade significa que a indisponibilidade de uma única instância, de uma única zona de infraestrutura, ou até de uma região inteira, não deve resultar em indisponibilidade da plataforma para nenhum Tenant — alcançada através de redundância geográfica e de failover automático entre zonas, coordenado pela mesma Infrastructure Layer já descrita em `SYSTEM_BLUEPRINT.md`.

Resiliência é a capacidade da plataforma de se recuperar de uma falha parcial sem intervenção manual — indo além da Alta disponibilidade ao garantir que, mesmo diante de uma falha real e não apenas hipotética, o sistema retome operação normal automaticamente, com o menor impacto possível a Tenants não diretamente afetados pela causa raiz da falha.

O ponto específico de escalabilidade multiempresa que este documento acrescenta é que nenhum mecanismo de escala pode, jamais, comprometer o isolamento entre Tenants descrito no Capítulo 6 — uma otimização de cache compartilhado, por exemplo, é aceitável apenas quando a chave de cache inclui o identificador de Tenant como parte obrigatória e não removível de sua composição, nunca como uma otimização que assume, implicitamente, que o dado cacheado é seguro para reuso entre clientes diferentes.

---

## 18. Observabilidade

Os quatro sinais de observabilidade — Logs, Tracing, Metrics e Health Checks — já foram detalhados em `SYSTEM_BLUEPRINT.md`, assim como Dashboards e Alertas operacionais. Esta seção acrescenta a dimensão específica de observabilidade por Tenant, essencial em uma plataforma SaaS multiempresa.

Monitoramento, nesta camada, significa observar não apenas a saúde agregada da plataforma, mas a saúde da experiência de cada Tenant individualmente — um Tenant específico enfrentando latência elevada ou taxa de erro acima do normal precisa ser identificável isoladamente, não apenas diluído em uma média agregada que poderia mascarar um problema concentrado em poucos clientes.

Uso dos Módulos é medido por Tenant, informando tanto decisões de produto — quais Módulos são efetivamente usados versus apenas ativados — quanto o próprio Business Profile Engine, que pode refinar seu entendimento de um segmento observando o padrão real de uso, além da classificação inicial declarada.

Uso da IA é medido por Tenant através do Token Manager já descrito em `AI_HUB.md`, e consolidado aqui na camada SaaS como parte do painel operacional de cada Conta, permitindo tanto ao cliente quanto à operação da plataforma acompanhar consumo em relação ao plano contratado.

Custos são calculados por Tenant a partir do mesmo dado de uso, permitindo tanto o controle de margem por cliente quanto a eventual oferta de planos com limites de uso diferenciados, conforme já descrito no Capítulo 10.

O ponto central desta seção é que toda a observabilidade técnica já descrita no Blueprint precisa ser segmentável por Tenant sem exceção — um painel de observabilidade que só mostra dado agregado da plataforma inteira é insuficiente para uma operação SaaS madura, porque a unidade de negócio real da plataforma não é "o sistema", é "cada Tenant individualmente".

---

## 19. Evolução da Plataforma

A capacidade de adicionar novos Módulos sem quebrar a arquitetura existente é consequência direta dos princípios de modularidade e baixo acoplamento já estabelecidos — mas, na camada SaaS especificamente, essa evolução carrega uma restrição adicional que não existe em software instalado individualmente por cliente: qualquer mudança precisa ser compatível, simultaneamente, com milhares de Tenants em produção, cada um potencialmente em um estágio diferente de adoção de uma capacidade específica.

Isso significa que um novo Módulo é sempre adicionado como capacidade opcional, nunca como mudança obrigatória aplicada de uma só vez a toda a base de clientes — a ativação segue o mesmo mecanismo de Feature Flags já descrito no Capítulo 10, permitindo lançamento gradual, primeiro a um subconjunto de Tenants, depois à base completa, sem exigir uma janela de manutenção coordenada.

Isso também significa que uma mudança em um Módulo já existente precisa ser retrocompatível com o comportamento que Tenants já ativos esperam, ou precisa ser acompanhada de um mecanismo de migração explícito e gradual — nunca uma alteração silenciosa que muda o comportamento de um Módulo já em uso sem aviso, para nenhum Tenant.

A arquitetura evolutiva descrita aqui é a aplicação, na camada SaaS, do mesmo princípio de "evolução contínua sobre entrega definitiva" já estabelecido no Manifesto: a plataforma nunca está definitivamente pronta, e cada nova capacidade adicionada precisa ser desenhada assumindo que uma capacidade ainda mais nova será adicionada por cima dela no futuro, sem que isso exija revisitar decisões já tomadas.

---

## 20. Integração com os Hubs

O relacionamento técnico entre cada Hub e o restante da plataforma já foi detalhado, camada por camada e fluxo por fluxo, em `SYSTEM_BLUEPRINT.md`, e não é repetido aqui. O que esta seção acrescenta é a perspectiva comercial: como a disponibilidade de cada Hub para uma Empresa específica se relaciona com os conceitos definidos neste documento.

O AI Hub está disponível a toda Empresa, em todo plano, com nível de uso — medido em consumo de token, conforme o Capítulo 18 — variável conforme o plano contratado, nunca com a capacidade em si bloqueada integralmente. O CRM Hub e o Communication Hub compõem o núcleo de Módulos obrigatórios descrito no Capítulo 9, disponíveis desde o plano Starter. O Automation Hub e o Growth Hub têm sua profundidade de capacidade expandida a partir do plano Professional. O Finance Hub completo e a operação de múltiplos Workspaces sob uma Organização, através da relação com o Business Hub mais amplo, tornam-se relevantes a partir do plano Business, conforme já descrito no Capítulo 10. O Knowledge Hub e o Analytics Hub avançado acompanham essa mesma progressão de plano. O Branding Hub e o Business Profile Engine, por serem centrais à própria proposta de adaptação automática da plataforma, estão disponíveis desde o primeiro contato do cliente, na jornada de onboarding descrita no Capítulo 12, independentemente de plano. O Identity Hub e o Integration Hub são infraestrutura transversal, presente e obrigatória em toda Empresa, em todo plano, sem variação de disponibilidade — apenas de profundidade de configuração, como o número de Conectores externos simultâneos permitidos em planos superiores.

---

## 21. Arquitetura para Agências

Este documento reconhece três cenários de administração multiempresa consolidada, cada um com uma relação diferente entre Tenant, Empresa e Organização, conforme os conceitos definidos no Capítulo 5.

```
                         AGÊNCIA
   Organização
      │
      ├── Tenant Cliente 1 ── Empresa 1 (Workspace isolado)
      ├── Tenant Cliente 2 ── Empresa 2 (Workspace isolado)
      └── Tenant Cliente 3 ── Empresa 3 (Workspace isolado)

   Um único Usuário-operador da agência acessa múltiplos
   Tenants através de um Perfil de Convidado/Gerente
   concedido individualmente em cada Workspace-cliente —
   nunca através de acesso direto ao dado bruto de um
   Tenant a partir de outro.
```

Uma Agência administra dezenas de Empresas-cliente, cada uma como um Tenant tecnicamente independente, com isolamento absoluto entre elas conforme o Capítulo 6. O que a arquitetura de Organização oferece à Agência é uma camada de acesso consolidado: um único conjunto de credenciais operando, com Permissão explicitamente concedida em cada Workspace-cliente individualmente, sem que isso implique qualquer relaxamento do isolamento de dado entre os clientes da Agência.

```
                        FRANQUIA
   Organização (Empresa-mãe)
      │
      ├── Tenant Unidade A ── Empresa A (Workspace isolado)
      ├── Tenant Unidade B ── Empresa B (Workspace isolado)
      └── Tenant Unidade C ── Empresa C (Workspace isolado)

   Empresa-mãe consolida indicadores agregados via
   Analytics Hub, sob Permissão de leitura consolidada —
   sem acesso operacional direto ao dia a dia de cada unidade.
```

Uma Franquia opera de forma estruturalmente semelhante, com uma distinção de propósito: a Empresa-mãe tipicamente não administra o dia a dia de cada unidade, mas consolida indicadores agregados de desempenho — vendas, campanhas, atendimento — através de um acesso de leitura consolidado ao Analytics Hub de cada Tenant-unidade, sob a mesma Permissão explícita e a mesma ausência de acesso operacional direto já descrita para o cenário de Agência.

```
                    GRUPO EMPRESARIAL
   Organização (Holding)
      │
      ├── Tenant Marca 1 ── Empresa 1 (Branding e Business
      │                                Profile próprios)
      ├── Tenant Marca 2 ── Empresa 2 (Branding e Business
      │                                Profile próprios)
      └── Tenant Marca 3 ── Empresa 3 (Branding e Business
                                       Profile próprios)

   Cada marca opera com identidade e perfil de negócio
   totalmente distintos; a Holding administra Conta e
   Plano de forma centralizada.
```

Um Grupo Empresarial administrando várias marcas segue o mesmo padrão de Tenants tecnicamente independentes, com uma diferença adicional relevante: cada marca dentro do grupo tipicamente possui Business Profile e Branding completamente distintos entre si — uma marca de moda popular e uma marca de moda de luxo dentro do mesmo grupo devem se comportar, na plataforma, como negócios inteiramente diferentes, mesmo compartilhando a mesma Conta e o mesmo Plano administrado centralmente pela Holding.

Em todos os três cenários, a regra estrutural que nunca é relaxada é a mesma: isolamento técnico absoluto entre Tenants, e acesso administrativo consolidado concedido explicitamente, Permissão por Permissão, Workspace por Workspace — nunca implícito e nunca automático apenas por pertencer à mesma Organização.

---

## 22. Roadmap Arquitetural

No curto prazo, a prioridade é validar o Tenant Model descrito no Capítulo 5 em sua forma mais simples — um Tenant por Empresa, sem cenário de Organização ainda ativo —, com o modelo RBAC do Capítulo 11 e a jornada de onboarding do Capítulo 12 funcionando de ponta a ponta para o plano Starter.

No médio prazo, a prioridade é a introdução dos planos Professional e Business descritos no Capítulo 10, junto com o primeiro suporte real a Organização com múltiplos Tenants — habilitando o cenário de Agência descrito no Capítulo 21 como o primeiro caso de administração multiempresa consolidada a ser suportado, por ser o de menor complexidade relativa entre os três cenários descritos.

No longo prazo, a prioridade é o amadurecimento do plano Enterprise, a introdução do modelo ABAC como extensão ao RBAC já existente, o suporte pleno aos cenários de Franquia e Grupo Empresarial, e a maturidade do Marketplace de Módulos de terceiros já antecipado no Capítulo 9 — o horizonte em que a plataforma se torna administrável não apenas por sua própria equipe de engenharia, mas por um ecossistema mais amplo de parceiros construindo sobre a arquitetura descrita neste documento.

---

## 23. Architecture Decision Records

**ADR-001 — Toda Empresa pertence a um Tenant.** Nenhum dado operacional existe fora do contexto de um Tenant identificável. Contexto: esta é a condição estrutural mínima para que o isolamento multiempresa descrito no Capítulo 6 seja sequer possível de se aplicar.

**ADR-002 — Business Profile define comportamento inicial, nunca permanente.** A classificação de segmento produzida no onboarding orienta a configuração adaptativa inicial, mas continua sendo refinada ao longo do uso real, conforme o Capítulo 18. Alternativa descartada: tratar o Business Profile como uma classificação fixa definida uma única vez — rejeitada por congelar a adaptação no nível de precisão do primeiro dia de uso.

**ADR-003 — Branding nunca altera regra de negócio.** Identidade visual e de tom afeta exclusivamente apresentação e comunicação, nunca lógica de cálculo, de fluxo ou de permissão. Contexto: misturar as duas responsabilidades tornaria impossível auditar regra de negócio de forma independente da identidade visual de cada cliente.

**ADR-004 — Feature Flags controlam toda diferenciação de funcionalidade entre planos.** Nenhuma diferença de capacidade entre planos comerciais é implementada como branch de código separado. Contexto: aplicação direta do princípio "configuração acima de customização" do Capítulo 3.

**ADR-005 — Todos os Módulos seguem a mesma arquitetura modular, sem exceção para Módulos internos "especiais".** Um Módulo desenvolvido pela própria equipe de engenharia segue exatamente o mesmo contrato de integração que um Módulo futuro de terceiro no Marketplace. Contexto: qualquer exceção interna criaria dois padrões de integração divergentes, minando a extensibilidade descrita no Capítulo 9.

**ADR-006 — RBAC é o modelo de permissão padrão; ABAC é extensão, não substituição.** Toda Permissão nova adicionada à plataforma deve poder ser expressa em termos de RBAC antes de considerar uma extensão via atributo. Contexto: preservar simplicidade de gestão de acesso para a maioria dos Tenants, que nunca precisará de granularidade além de RBAC.

**ADR-007 — Um Tenant nunca é assumido implicitamente; é sempre resolvido explicitamente na autenticação.** Nenhuma consulta, gravação ou evento pode prosseguir sem um identificador de Tenant explícito e verificado. Contexto: esta é a defesa central contra o tipo de vazamento de dado entre empresas descrito no Capítulo 6.

**ADR-008 — Organização é uma camada administrativa, nunca uma camada de dado compartilhado.** Uma Organização agrupa Tenants para fins de gestão de acesso consolidado, nunca para fins de compartilhamento de dado operacional entre eles. Contexto: os três cenários do Capítulo 21 dependem dessa distinção para preservar isolamento mesmo sob administração centralizada.

**ADR-009 — Ativação e desativação de Módulo nunca exclui dado histórico.** Desativar um Módulo remove acesso operacional, não o dado já produzido por ele. Contexto: uma Empresa que reativa um Módulo meses depois deve encontrar seu histórico intacto, não uma reinicialização.

**ADR-010 — Nenhuma mudança de plataforma é aplicada de forma obrigatória e simultânea a toda a base de Tenants.** Toda evolução relevante é lançada de forma gradual, via Feature Flag, começando por um subconjunto de Tenants. Contexto: aplicação direta da restrição de evolução SaaS descrita no Capítulo 19 — mudança obrigatória e simultânea em milhares de Tenants é o cenário de maior risco de regressão em massa que esta arquitetura existe para evitar.

**ADR-011 — Sessão é invalidada imediatamente na mudança de Permissão relevante, nunca apenas na expiração natural do token.** Contexto: uma remoção de acesso que só se torna efetiva na próxima renovação de sessão é, na prática, uma janela de acesso indevido tolerada — inaceitável dado o padrão de segurança já estabelecido em `AI_HUB.md`.

---

## 24. Glossário

**Tenant** — unidade máxima de isolamento técnico da plataforma; todo dado pertence a exatamente um Tenant.

**Workspace** — ambiente de trabalho operacional de uma Empresa, sempre associado a um único Tenant.

**Hub** — agrupamento de módulos por propósito de negócio, conforme já definido em `PLATFORM_MANIFESTO.md` e detalhado estruturalmente em `SYSTEM_BLUEPRINT.md`.

**Business Profile** — entendimento automático do segmento e do perfil de uma Empresa, produzido pelo Business Profile Engine.

**Branding** — identidade visual e de tom de uma Empresa, derivada automaticamente e propagada a toda superfície da plataforma.

**Feature Flag** — mecanismo que habilita ou desabilita uma capacidade específica para um Tenant, sem exigir alteração de código.

**RBAC** — Role-Based Access Control; modelo de controle de acesso no qual Permissões são concedidas através da associação a um Perfil nomeado.

**ABAC** — Attribute-Based Access Control; extensão ao RBAC na qual uma Permissão pode depender de atributos contextuais adicionais além do Perfil.

**Provider** — implementação concreta de acesso a um provedor externo de inteligência artificial, detalhado em `AI_HUB.md`.

**Automation** — motor que orquestra lógica condicional e sequencial entre Módulos, reagindo a eventos publicados na plataforma.

**Knowledge** — conhecimento acumulado de uma Empresa, organizado e indexado pelo Knowledge Hub, consultável pelo AI Hub.

**AI Context** — conjunto de camadas de contexto — usuário, empresa, módulo, conversa, histórico, Business Profile, Branding — reunidas pelo Context Manager antes da composição de um prompt, detalhado em `AI_HUB.md`.

**Memory** — persistência de curta e longa duração mantida pelo AI Hub, isolada por Tenant.

**Observability** — combinação de Logs, Tracing, Metrics e Health Checks que torna o comportamento de qualquer Hub investigável.

**Tenant Isolation** — garantia estrutural de que nenhum dado, contexto, memória ou evento de um Tenant é acessível a partir de outro, independentemente de infraestrutura física compartilhada.

**Marketplace** — espaço futuro de Módulos desenvolvidos por terceiros, integrados à plataforma sob o mesmo contrato de Módulos nativos.

**Adaptive Experience** — comportamento de personalização automática e contínua de toda a experiência de uso, já definido em `PLATFORM_MANIFESTO.md`.

**Organização** — agrupamento administrativo de múltiplas Empresas/Tenants sob uma governança consolidada, sem implicar compartilhamento de dado operacional entre elas.

**Owner** — Perfil de maior autoridade dentro de um Tenant, com capacidade exclusiva de transferência de propriedade e encerramento de Conta.

**Plano** — combinação nomeada de Feature Flags que determina o conjunto de capacidades disponível a um Tenant.

---

## 25. Conclusão

A Adaptive Business Platform foi projetada para crescer continuamente — em número de Empresas atendidas, em profundidade de capacidade por Hub, e em complexidade de cenário administrativo, do Tenant único mais simples à Organização de Grupo Empresarial mais elaborada. Nenhum desses eixos de crescimento exige alterar a arquitetura central descrita neste documento: o Tenant Model do Capítulo 5, o isolamento multiempresa do Capítulo 6 e as regras de comunicação já herdadas de `SYSTEM_BLUEPRINT.md` permanecem estáveis independentemente de quantos Tenants, Módulos ou cenários de Organização a plataforma vier a suportar.

Novos Hubs e novos Módulos poderão ser adicionados seguindo exatamente o contrato de modularidade descrito no Capítulo 9, sem que sua adição exija revisitar o modelo de Tenant, o modelo de permissão, ou qualquer um dos mecanismos de isolamento já estabelecidos. É essa estabilidade estrutural, e não a ausência de mudança, que permite à plataforma evoluir continuamente sem acumular dívida arquitetural proporcional ao seu próprio crescimento.

Este documento é a referência oficial da arquitetura SaaS da Adaptive Business Platform. Junto com `PLATFORM_MANIFESTO.md`, `AI_HUB.md` e `SYSTEM_BLUEPRINT.md`, ele forma o conjunto completo de documentação arquitetural que qualquer pessoa construindo sobre esta plataforma deve conhecer: o Manifesto explica por quê, o AI Hub explica como a inteligência funciona por dentro, o Blueprint explica onde cada peça vive e como elas se encontram, e este documento explica como a mesma plataforma opera, com segurança e sem fricção, para milhares de empresas ao mesmo tempo.
