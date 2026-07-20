# Identity Hub — Arquitetura de Referência

**Adaptive Business Platform · Documento Técnico Oficial**

---

## 1. Introdução

Este documento é a referência arquitetural oficial do Identity Hub — o mecanismo responsável por autenticação, autorização, gestão de usuários e confiança de toda a Adaptive Business Platform.

Sete documentos oficiais já existem e não são repetidos aqui. `PLATFORM_MANIFESTO.md` estabelece a missão e os princípios gerais da plataforma. `SYSTEM_BLUEPRINT.md` posiciona o Identity Hub no mapa geral de Hubs, descreve o fluxo geral de Autenticação, Autorização, Permissões, Segregação entre Módulos e Auditoria em seu Capítulo 12, e estabelece a Security Layer como camada transversal presente em toda comunicação da plataforma. `SAAS_ARCHITECTURE.md` já define, em profundidade, o Tenant Model completo — Tenant, Empresa, Conta, Organização, Workspace, Usuário, Convites, Propriedade, Administração, Hierarquia — em seu Capítulo 5, o modelo RBAC com oito Perfis nomeados e a evolução prevista para ABAC em seu Capítulo 11, e o isolamento multiempresa, incluindo os cenários de Agência, Franquia e Grupo Empresarial, em seus Capítulos 6 e 21. `AI_HUB.md` estabelece a segregação entre empresas aplicada à camada de inteligência artificial e o próprio conceito de Policy Engine, ali aplicado à governança de uso de modelos de linguagem. `BUSINESS_PROFILE_ENGINE.md` e `BRANDING_HUB.md` definem, cada um, como o entendimento de negócio e a identidade de marca de uma empresa são geridos. `AUTOMATION_ENGINE.md` define como Permissões são consultadas por uma Condition antes da execução de uma Action de alto impacto. Onde qualquer um desses sete documentos já explicou um conceito em profundidade suficiente, este documento referencia o arquivo correspondente em vez de reproduzi-lo, e aprofunda exclusivamente o que é responsabilidade própria do Identity Hub: os mecanismos concretos de autenticação, a resolução técnica de autorização, a gestão de sessão e dispositivo, e a confiança que sustenta toda interação na plataforma.

Identidade não é um Módulo entre outros — é um serviço transversal, consumido por todo Hub da plataforma antes que qualquer outra operação possa acontecer. Nenhum Hub de domínio — CRM, Finance, Growth, Automation, Communication, Branding, Knowledge, Business Profile Engine — processa uma única requisição sem que o Identity Hub já tenha resolvido quem está fazendo essa requisição, em nome de qual Empresa, sob qual Perfil, e com quais Permissões. Se o AI Hub é o cérebro da plataforma e o Business Profile Engine é o seu DNA, conforme já estabelecido nos respectivos documentos, o Identity Hub é o sistema imunológico: ele não produz o trabalho de negócio da plataforma, mas garante que apenas quem deveria ter acesso o tenha, e que todo acesso concedido seja rastreável até sua origem.

---

## 2. Missão

A missão do Identity Hub é garantir autenticação, autorização, identidade, confiança, auditoria e controle de acesso de forma centralizada, segura e escalável.

Autenticação confirma quem está por trás de uma requisição. Autorização confirma o que essa identidade, já confirmada, tem permissão de fazer. Identidade é o registro persistente de quem uma pessoa ou um sistema é dentro da plataforma, através do tempo. Confiança é o grau de certeza que a plataforma atribui a uma sessão específica, calibrado por sinal contínuo, não apenas pela verificação inicial de credencial. Auditoria preserva o registro imutável de toda decisão de acesso relevante. E controle de acesso é a soma operacional de todos esses elementos, aplicada a cada requisição, em cada Hub, sem exceção.

Nenhum desses seis compromissos é opcional ou aplicado parcialmente — a centralização completa de todos eles em um único Hub é o que torna a plataforma inteira auditável e segura de forma consistente, em vez de depender da disciplina individual de cada Hub de domínio implementando sua própria verificação de acesso.

---

## 3. Problema que Resolve

Quando autenticação e permissão são implementadas de forma dispersa — cada Módulo verificando credencial e autorização à sua própria maneira —, cinco categorias de risco se acumulam de forma previsível.

Duplicação aparece porque a lógica de "verificar se este usuário está autenticado" e "verificar se ele tem permissão para esta ação" tende a ser reimplementada, de forma ligeiramente diferente, em cada Módulo que precisa dela — o mesmo padrão de fragmentação já diagnosticado para inteligência artificial em `AI_HUB.md`, Capítulo 3, e para automação em `AUTOMATION_ENGINE.md`, Capítulo 3, aplicado aqui ao domínio de acesso.

Inconsistência é a consequência direta da duplicação: dois Módulos que reimplementam separadamente a mesma verificação de Permissão tendem, com o tempo, a divergir sutilmente — um pode considerar uma sessão válida por mais tempo que o outro, um pode verificar um nível de Perfil e outro um nível ligeiramente diferente para a mesma operação de negócio.

Privilégios incorretos surgem quando não existe uma única fonte de verdade sobre o que cada Perfil pode fazer — um Módulo pode conceder acesso que outro Módulo, para a mesma ação de negócio, teria negado, produzindo um sistema onde a superfície real de permissão de um Usuário é a soma imprevisível de decisões divergentes tomadas por Módulos diferentes.

Vulnerabilidades se acumulam porque verificação de credencial e de sessão são áreas de segurança particularmente sensíveis a erro sutil de implementação — cada reimplementação isolada é uma nova oportunidade de introduzir uma falha que uma implementação central, revisada e testada uma única vez, teria evitado.

Dificuldade de auditoria surge porque, sem um único ponto de decisão de acesso, reconstruir "quem acessou o quê, quando, e com base em qual autorização" exige correlacionar registros de múltiplos Módulos, cada um com seu próprio formato e sua própria granularidade de log — exatamente o tipo de investigação que a Auditoria centralizada, já exigida em `SYSTEM_BLUEPRINT.md`, Capítulo 12, existe para tornar direta.

O Identity Hub resolve essas cinco categorias de risco centralizando toda decisão de autenticação e de autorização em um único mecanismo, consumido por todo Hub de domínio da mesma forma — nenhum Hub implementa sua própria verificação de credencial, sua própria lógica de Permissão, ou seu próprio mecanismo de sessão.

---

## 4. Filosofia

Identity First. Nenhuma operação de negócio acontece antes que a identidade por trás da requisição seja resolvida — identidade não é verificada como uma etapa entre outras, é a pré-condição de toda etapa subsequente.

Least Privilege. Toda Permissão concedida é a mínima necessária para a função de um Perfil, nunca uma concessão ampla por conveniência de implementação — princípio já implícito no modelo de Perfis de `SAAS_ARCHITECTURE.md`, Capítulo 11, aqui elevado a filosofia estrutural do próprio Identity Hub.

Zero Trust. Nenhuma requisição é implicitamente confiável por sua origem — uma requisição vinda de dentro da própria rede da plataforma é verificada com o mesmo rigor que uma requisição vinda de um cliente externo; confiança é sempre verificada, nunca assumida por proximidade de rede ou por sessão previamente estabelecida sem revalidação contínua.

Centralização. Toda decisão de autenticação e de autorização passa pelo Identity Hub — nenhum Módulo verifica credencial ou resolve Permissão por conta própria.

Auditoria obrigatória. Toda concessão, negação ou alteração de acesso é registrada de forma imutável, sem exceção configurável.

Tenant Isolation. Identidade, sessão e Permissão de um Tenant nunca são acessíveis, nem incidentalmente, a partir de outro — mesmo princípio já estabelecido em `SAAS_ARCHITECTURE.md`, Capítulo 6, aqui aplicado especificamente à camada de identidade.

Security by Design. Toda capacidade do Identity Hub é desenhada assumindo, desde a concepção, que será alvo de tentativa de ataque — nunca com segurança adicionada como revisão posterior.

Identity as a Platform Service. Identidade não pertence a nenhum Hub de domínio específico — é um serviço transversal da plataforma, consumido por todos, da mesma forma que o AI Hub é consumido por todos para inteligência.

---

## 5. Design Principles

**Identity First.** Já descrito no Capítulo 4 como filosofia central; reafirmado aqui como princípio de design aplicado a cada novo componente construído sobre a plataforma.

**Zero Trust.** Nenhuma requisição é confiável por padrão; toda requisição é verificada, independentemente de sua origem aparente.

**Least Privilege.** Toda Permissão concedida é a mínima necessária, nunca concedida por conveniência de implementação de um Módulo consumidor.

**Defense in Depth.** Nenhuma camada de segurança sozinha é considerada suficiente — autenticação, autorização, verificação de sessão e monitoramento contínuo operam em conjunto, de modo que a falha de uma camada isolada não comprometa o sistema inteiro.

**Authentication Before Authorization.** Nenhuma verificação de Permissão acontece antes que a identidade da requisição já tenha sido autenticada — a ordem entre essas duas etapas nunca é invertida nem executada em paralelo de forma que uma dependa de suposição sobre o resultado da outra.

**Centralized Identity.** Toda identidade, de usuário humano ou de sistema, é registrada e resolvida em um único lugar, nunca duplicada localmente por um Módulo consumidor.

**Role Driven Access.** Toda Permissão é primariamente concedida através da associação a um Papel nomeado, conforme o modelo RBAC já estabelecido em `SAAS_ARCHITECTURE.md`, Capítulo 11 — este documento aprofunda a mecânica de resolução, não redefine os Perfis já nomeados ali.

**Policy Driven Authorization.** Regras de autorização mais complexas que uma simples associação de Papel são expressas como Policy, avaliada pelo Policy Engine descrito no Capítulo 7, nunca como lógica condicional embutida em um Módulo consumidor.

**Auditable Everything.** Toda decisão de acesso — concedida ou negada — é registrada, sem exceção, pelo Audit Manager descrito no Capítulo 7.

**Tenant Isolation.** Nenhuma identidade, sessão, credencial ou Permissão de um Tenant é resolvível no contexto de outro, detalhado no Capítulo 13.

**Session Security.** Toda sessão é tratada como um ativo sensível, sujeita a expiração, revogação e verificação contínua, detalhado no Capítulo 11.

**Explicit Permissions.** Nenhuma Permissão é inferida implicitamente a partir de outra — cada Permissão concedida é uma decisão explícita, registrada e reversível.

**Composable Security.** Mecanismos de autenticação (senha, Passkey, SSO), de autorização (RBAC, ABAC, Policy) e de sessão operam como camadas independentes e combináveis, nunca como um único bloco monolítico que exigiria reescrita completa para adicionar um novo método.

**Provider Agnostic Identity.** A plataforma não depende de um único provedor externo de identidade — suporta múltiplos provedores de autenticação federada simultaneamente, sem que nenhum Módulo consumidor precise conhecer qual provedor específico autenticou uma sessão, mesmo princípio de agnosticismo de provedor já estabelecido para inteligência artificial em `AI_HUB.md`, Capítulo 5, aplicado aqui a identidade externa.

**Continuous Verification.** A confiança atribuída a uma sessão não é fixa desde o momento da autenticação inicial — é reavaliada continuamente com base em sinal de comportamento e de dispositivo, detalhado no Capítulo 7, componente Trust Engine.

---

## 6. Arquitetura Conceitual

```
                              Usuário
                        (credencial ou token)
                                 │
                                 ▼
                            Identity Hub
              (Identity Manager orquestra os componentes
               internos descritos no Capítulo 7)
                                 │
                                 ▼
                          Authentication
              (confirma quem está por trás da requisição)
                                 │
                                 ▼
                          Authorization
              (confirma o que essa identidade pode fazer)
                                 │
                    ┌────────────┼────────────┐
                    ▼                         ▼
                Policies                  Permissions
        (regras avaliadas pelo       (RBAC/ABAC resolvidos
         Policy Engine)               pelo Permission Resolver)
                    │                         │
                    └────────────┬────────────┘
                                 ▼
                              Tenant
              (contexto de isolamento — SAAS_ARCHITECTURE.md)
                                 │
                                 ▼
                            Application
                        (Application Layer)
                                 │
                                 ▼
                          Business Hubs
              (CRM, Finance, Growth, Automation, Communication,
               Branding, Knowledge, Business Profile Engine, AI Hub)
                                 │
                                 ▼
                               Audit
                    (Audit Manager registra a decisão)
                                 │
                                 ▼
                                Logs
                    (Observability — SYSTEM_BLUEPRINT.md)
```

Este diagrama resume a cadeia completa deste documento: um Usuário apresenta credencial ou token; o Identity Hub confirma Authentication; em seguida resolve Authorization, combinando Policies e Permissions; o resultado é sempre resolvido dentro do contexto de um Tenant específico; a Application Layer prossegue apenas com esse contexto já resolvido; os Business Hubs operam sobre uma requisição já autenticada e autorizada; e toda a cadeia produz um registro de Audit, capturado pelos Logs da plataforma. Nenhuma etapa deste diagrama é opcional ou contornável por um Hub de domínio específico — a mesma cadeia se aplica a toda requisição, de qualquer origem, em qualquer Hub.

---

## 7. Componentes Internos

### Identity Manager

O Identity Manager é o ponto de entrada e orquestrador central do Identity Hub, equivalente em função ao Automation Manager e ao Brand Manager já descritos nos documentos anteriores. Ele coordena os demais componentes especializados e garante que o resultado de uma resolução de identidade seja consistente antes de ser retornado a qualquer Hub consumidor.

### Authentication Manager

O Authentication Manager orquestra o processo de confirmação de identidade, delegando a um dos mecanismos específicos — senha, Passkey, OAuth, SAML — detalhados no Capítulo 9, sem implementar, ele mesmo, a lógica de nenhum mecanismo individual.

### Authorization Engine

O Authorization Engine orquestra a resolução de Permissão, combinando o resultado do RBAC Engine e do ABAC Engine descritos adiante, através do Permission Resolver, para produzir uma decisão final de autorização para uma ação específica.

### RBAC Engine

O RBAC Engine resolve Permissões a partir da associação de um Usuário a um Papel, conforme o modelo já definido em `SAAS_ARCHITECTURE.md`, Capítulo 11 — este componente é a implementação técnica daquele modelo, não uma redefinição dele.

### ABAC Engine

O ABAC Engine resolve Permissões que dependem de atributo contextual adicional além do Papel — por exemplo, um limite de valor de aprovação específico de um Usuário, ou um escopo de acesso restrito a uma unidade específica dentro de uma Organização — implementando a evolução já prevista em `SAAS_ARCHITECTURE.md`, Capítulo 11, como extensão ao RBAC, nunca como substituição dele.

### Policy Engine

O Policy Engine avalia regras de autorização expressas de forma declarativa — combinações de condição que determinam se uma ação é permitida — consumido tanto pelo ABAC Engine quanto por qualquer Hub que precise de uma decisão de autorização mais elaborada que uma simples verificação de Papel. Este Policy Engine é distinto do Policy Engine já descrito em `AI_HUB.md`, que aplica regras especificamente à governança de uso de modelos de linguagem — o Policy Engine do Identity Hub aplica regras de autorização de acesso em geral, e o Policy Engine do AI Hub o consulta, quando necessário, para uma decisão de autorização que ultrapasse o escopo específico de governança de IA.

### User Manager

O User Manager administra o ciclo de vida de um Usuário — criação, atualização de dado de perfil pessoal, desativação — dentro do modelo já estabelecido em `SAAS_ARCHITECTURE.md`, Capítulo 5.

### Organization Manager

O Organization Manager administra a estrutura de Organização, agrupando múltiplos Tenants sob uma governança administrativa consolidada, conforme já definido em `SAAS_ARCHITECTURE.md`, Capítulos 5 e 21 — este componente é a implementação técnica que sustenta aquele modelo.

### Team Manager

O Team Manager administra Equipes — agrupamentos de Usuários dentro de um Workspace, tipicamente organizados por Departamento ou por área de atuação, um nível de organização mais granular que o Perfil individual, detalhado no Capítulo 12.

### Invitation Manager

O Invitation Manager administra o ciclo de vida de um Convite — emissão, aceite, expiração, revogação — implementando o mecanismo já introduzido em `SAAS_ARCHITECTURE.md`, Capítulo 5.

### Session Manager

O Session Manager administra o ciclo de vida de uma sessão autenticada — criação, renovação, expiração, revogação — detalhado no Capítulo 11.

### Device Manager

O Device Manager mantém o registro de dispositivos associados a um Usuário, informando o Trust Engine sobre o histórico de uso de um dispositivo específico ao calcular o nível de confiança de uma sessão.

### Trust Engine

O Trust Engine calcula, de forma contínua, o nível de confiança atribuído a uma sessão em andamento, com base em sinal de comportamento, de dispositivo e de contexto — aplicação direta do princípio Continuous Verification já descrito no Capítulo 5, não um cálculo único executado apenas no momento da autenticação inicial.

### MFA Manager

O MFA Manager administra a verificação multifator — um segundo fator de autenticação exigido além da credencial primária — detalhado no Capítulo 9.

### Passkey Manager

O Passkey Manager administra credenciais baseadas em chave criptográfica associada a um dispositivo, um mecanismo de autenticação sem senha detalhado no Capítulo 9.

### OAuth Manager

O OAuth Manager administra fluxos de autorização delegada através do protocolo OAuth, tipicamente usado tanto para login social quanto para autorização de acesso de uma integração externa a dado da plataforma em nome de um Usuário.

### OIDC Manager

O OIDC Manager administra autenticação federada através do protocolo OpenID Connect, construído sobre OAuth, usado especificamente para confirmar identidade, não apenas autorização de acesso.

### SAML Manager

O SAML Manager administra autenticação federada através do protocolo SAML, tipicamente relevante para integração com provedor de identidade corporativo de uma Empresa cliente de plano Enterprise, já antecipado em `SAAS_ARCHITECTURE.md`, Capítulo 10.

### SSO Manager

O SSO Manager orquestra Single Sign-On entre os múltiplos Workspaces que um mesmo Usuário pode acessar, conforme o modelo de relacionamento já descrito em `SAAS_ARCHITECTURE.md`, Capítulo 5 — um Usuário autenticado uma única vez não precisa reautenticar a cada Workspace ao qual já tem acesso concedido, ainda que cada acesso permaneça um relacionamento distinto e independente.

### API Key Manager

O API Key Manager administra credenciais de acesso não interativo, usadas por uma integração externa ou por um script automatizado para autenticar-se contra a plataforma sem um Usuário humano presente na interação.

### Service Account Manager

O Service Account Manager administra identidades não humanas — contas de serviço usadas por um processo interno ou por uma integração de sistema a sistema — tratadas com o mesmo rigor de autenticação e de Permissão explícita aplicado a um Usuário humano, nunca com privilégio implícito ampliado por serem automatizadas.

### Token Manager

O Token Manager emite, valida e revoga tokens de sessão e de acesso — a credencial técnica que representa uma sessão já autenticada em cada requisição subsequente. Este Token Manager é distinto do Token Manager já descrito em `AI_HUB.md`, que mede consumo de token de modelo de linguagem para fins de custo — os dois compartilham nome por convenção de domínio, mas nenhuma relação funcional entre eles existe.

### Permission Resolver

O Permission Resolver combina o resultado do RBAC Engine, do ABAC Engine e do Policy Engine em uma decisão final e única de autorização para uma ação específica, resolvendo qualquer conflito entre regras através de uma ordem de precedência já definida, nunca deixando uma decisão de autorização ambígua ou dependente da ordem de avaliação escolhida arbitrariamente em tempo de execução.

### Consent Manager

O Consent Manager registra e administra o consentimento dado por um Usuário para finalidade específica de uso de dado pessoal, sustentando a conformidade com a LGPD detalhada no Capítulo 15.

### Audit Manager

O Audit Manager preserva o registro imutável de toda decisão de acesso relevante — concessão, negação, mudança de Permissão — alinhado ao mesmo padrão de auditoria imutável já estabelecido em todos os documentos anteriores desta série.

### Security Event Manager

O Security Event Manager identifica e classifica eventos de segurança específicos — tentativa de autenticação falha repetida, padrão de acesso anômalo — alimentando tanto alertas em tempo real quanto o Trust Engine.

### Identity Analytics

O Identity Analytics transforma dado agregado de autenticação e de acesso em indicador consultável — volume de login por método, taxa de sucesso de autenticação, frequência de uso de MFA — consumido pelo Analytics Hub já descrito em `SYSTEM_BLUEPRINT.md`.

### Identity History

O Identity History preserva o registro cronológico de mudança relevante de identidade de um Usuário — alteração de Papel, mudança de credencial — sustentando tanto o Identity Versioning quanto investigação futura.

### Identity Versioning

O Identity Versioning aplica identificação de versão ao estado de Permissão de um Usuário ao longo do tempo, permitindo reconstruir exatamente qual conjunto de Permissões estava em vigor em um momento específico do passado — mesmo princípio já estabelecido para Profile Versioning e Brand Versioning nos documentos anteriores, aplicado aqui ao estado de acesso.

### Identity Recovery

O Identity Recovery administra o processo de recuperação de acesso quando um Usuário perde sua credencial primária, detalhado no Capítulo 9, sempre sujeito a verificação adicional suficiente para prevenir que o mecanismo de recuperação se torne, ele mesmo, uma via de ataque.

### Identity Federation

O Identity Federation administra a relação de confiança entre a plataforma e um provedor de identidade externo — através de OAuth, OIDC ou SAML —, permitindo que uma Empresa cliente use sua própria infraestrutura de identidade corporativa já existente, em vez de gerir credenciais duplicadas exclusivamente dentro da plataforma.

### Identity Cache

O Identity Cache armazena, por tempo limitado e sob política explícita, o resultado já resolvido de uma decisão de autorização frequentemente repetida, reduzindo latência sem comprometer a garantia de que uma revogação de Permissão seja refletida dentro de um intervalo aceitável — nunca armazenando uma decisão de acesso por tempo suficiente para que uma mudança de Permissão relevante permaneça sem efeito prático.

Cada um destes componentes tem um limite estrito de responsabilidade, e nenhum deles acumula lógica de outro componente vizinho — a mesma disciplina de modularidade interna já aplicada em todos os documentos anteriores desta série se aplica, com o mesmo rigor, aqui.

---

## 8. Modelo de Identidade

Tenant, Organização, Empresa, Workspace, Usuário, Convites, Propriedade, Administração, Hierarquia e Relacionamentos já foram definidos em profundidade em `SAAS_ARCHITECTURE.md`, Capítulo 5, e não são repetidos aqui. Este capítulo acrescenta exclusivamente os elementos que são responsabilidade própria do Identity Hub e que aquele documento não detalhou.

Equipe é um agrupamento de Usuários dentro de um Workspace, administrado pelo Team Manager, tipicamente organizado por Departamento ou área de atuação — um nível de organização complementar ao Perfil individual, útil quando uma Empresa precisa atribuir contexto adicional, como um gestor responsável por um conjunto de Usuários, sem que isso altere a Permissão individual de cada um.

Perfil, Papel e Permissão já foram introduzidos em `SAAS_ARCHITECTURE.md`, Capítulo 11, com oito Papéis nomeados — Owner, Administrador, Gerente, Operador, Financeiro, Marketing, Atendimento, Convidado. Este documento acrescenta a mecânica de resolução: um Perfil é a instância concreta de um Usuário dentro de um Workspace específico, associada a um Papel nomeado; o Papel é o agrupamento reutilizável de Permissões; e a Permissão é a unidade atômica de autorização, resolvida em tempo de requisição pelo Permission Resolver a partir da combinação de RBAC, ABAC e Policy, nunca armazenada como uma lista estática e fixa por Usuário.

Sessão é o registro de uma autenticação ativa, administrado pelo Session Manager, detalhado no Capítulo 11 — uma entidade técnica distinta do Usuário e do Perfil, com seu próprio ciclo de vida, tempo de expiração e nível de confiança calculado pelo Trust Engine.

Dispositivo é o registro de um equipamento ou navegador específico associado a uma sessão, administrado pelo Device Manager, usado tanto para conveniência — um dispositivo já reconhecido pode exigir verificação adicional menos frequente — quanto para segurança — um dispositivo nunca antes visto associado a uma sessão eleva automaticamente a exigência de verificação, calculada pelo Trust Engine.

Credenciais são o conjunto de mecanismos que um Usuário utiliza para provar sua identidade — senha, Passkey, chave de API, certificado de federação — cada uma administrada pelo componente específico já descrito no Capítulo 7, nunca por uma lógica genérica única incapaz de distinguir as particularidades de segurança de cada tipo.

```
              MODELO DE IDENTIDADE (elementos específicos deste Hub)
   ┌─────────────────────────────────────────────────────────┐
   │  Equipe — agrupamento de Usuários dentro de um Workspace   │
   │                                                             │
   │  Perfil / Papel / Permissão — instância, agrupamento e      │
   │  unidade atômica de autorização, resolvidos em tempo de     │
   │  requisição pelo Permission Resolver                        │
   │                                                             │
   │  Sessão — autenticação ativa, com ciclo de vida próprio      │
   │                                                             │
   │  Dispositivo — equipamento associado a uma sessão,           │
   │  informando o cálculo de confiança do Trust Engine           │
   │                                                             │
   │  Credenciais — mecanismos de prova de identidade              │
   │  (senha, Passkey, chave de API, federação)                    │
   └─────────────────────────────────────────────────────────┘
```

Relacionamentos entre esses elementos seguem a mesma regra de um-para-muitos já estabelecida em `SAAS_ARCHITECTURE.md`, Capítulo 5: um Usuário pode ter múltiplas Sessões ativas simultaneamente, cada Sessão associada a exatamente um Dispositivo, e cada Perfil associado a exatamente um Workspace, nunca compartilhado entre Workspaces diferentes mesmo quando o mesmo Usuário os acessa.

---

## 9. Autenticação

Senha é o mecanismo mais tradicional de autenticação, administrado pelo Authentication Manager com política de complexidade e de expiração configurável, tratada como o mecanismo de menor confiança relativa entre os disponíveis, dado seu histórico conhecido de vulnerabilidade a reutilização e a vazamento.

Passkeys, administradas pelo Passkey Manager, são credenciais baseadas em chave criptográfica associada a um dispositivo específico, eliminando a necessidade de memorizar ou transmitir um segredo compartilhado — o mecanismo de autenticação de maior confiança relativa disponível nativamente na plataforma.

Magic Link autentica um Usuário através de um vínculo de acesso único enviado a um canal já verificado, tipicamente e-mail, útil como mecanismo de menor fricção para acesso pouco frequente, sempre com expiração curta e uso único.

OAuth, administrado pelo OAuth Manager, permite login através de um provedor externo já confiável — Google, Microsoft — sem que a plataforma precise armazenar uma credencial própria para aquele Usuário.

OIDC, administrado pelo OIDC Manager, estende OAuth especificamente para confirmação de identidade, não apenas autorização de acesso, e é o protocolo preferencial quando o objetivo é autenticação federada plena.

SAML, administrado pelo SAML Manager, atende cenários corporativos onde a Empresa cliente já opera seu próprio provedor de identidade e deseja que seus Usuários acessem a plataforma através dele, sem credencial adicional específica da plataforma.

SSO, administrado pelo SSO Manager já descrito no Capítulo 7, permite que um Usuário autenticado uma única vez acesse múltiplos Workspaces sem reautenticação repetida.

MFA, administrado pelo MFA Manager, exige um segundo fator de verificação — código temporário, notificação push, chave física — além da credencial primária, elevando significativamente a confiança de uma autenticação, e tratado como obrigatório para Perfis de maior autoridade, como Owner e Administrador, conforme detalhado no Capítulo 15.

Biometria é usada como segundo fator ou como desbloqueio local de uma Passkey já registrada em um dispositivo, nunca transmitida nem armazenada centralmente pela plataforma — a verificação biométrica em si acontece no próprio dispositivo do Usuário, e a plataforma recebe apenas a confirmação criptográfica resultante.

Autenticação adaptativa ajusta a exigência de verificação com base no nível de confiança calculado pelo Trust Engine — uma sessão de um dispositivo já reconhecido, em um padrão de comportamento consistente, pode exigir apenas o fator primário, enquanto uma sessão de um dispositivo novo, ou com padrão de comportamento anômalo identificado pelo Security Event Manager, pode exigir MFA adicional mesmo quando o Usuário não o teria configurado como obrigatório em circunstância normal.

Recuperação de conta, administrada pelo Identity Recovery, permite que um Usuário recupere acesso quando perde sua credencial primária, sempre através de um canal já verificado anteriormente e sujeito a verificação adicional suficiente para que o próprio mecanismo de recuperação nunca se torne uma via de ataque mais fácil que a autenticação normal que pretende substituir.

```
                       MECANISMOS DE AUTENTICAÇÃO
   ┌───────────────────────────────────────────────────────────┐
   │  Menor confiança relativa                                    │
   │       Senha ──► Magic Link ──► OAuth/OIDC/SAML ──► Passkey   │
   │                                              Maior confiança  │
   │                                                                │
   │  MFA e Biometria elevam a confiança de qualquer mecanismo     │
   │  primário acima; Autenticação adaptativa ajusta a exigência   │
   │  com base no nível calculado pelo Trust Engine                │
   └───────────────────────────────────────────────────────────┘
```

---

## 10. Autorização

RBAC resolve Permissão a partir da associação de um Usuário a um Papel nomeado, conforme já estabelecido em `SAAS_ARCHITECTURE.md`, Capítulo 11 — o mecanismo padrão e suficiente para a esmagadora maioria dos cenários de autorização da plataforma.

ABAC estende RBAC com atributo contextual adicional, conforme já antecipado naquele mesmo capítulo como evolução, nunca substituição — implementado pelo ABAC Engine descrito no Capítulo 7.

Policies expressam regra de autorização declarativa, avaliada pelo Policy Engine, usada quando uma decisão de acesso depende de combinação de condição mais elaborada que uma simples verificação de Papel ou de atributo isolado.

Claims são afirmações verificadas sobre uma identidade, incluídas no Token emitido pelo Token Manager — por exemplo, a afirmação de que um Usuário pertence a um Tenant específico e possui um determinado Papel — consumidas por qualquer Hub que precise verificar essa informação sem consultar novamente o Identity Hub a cada uso.

Scopes delimitam o alcance de um Token específico — particularmente relevante para API Key Manager e Service Account Manager, onde um Token emitido para uma integração externa deve ter acesso restrito exatamente ao conjunto de operação necessário, nunca ao mesmo alcance completo de um Usuário humano autenticado interativamente.

Ownership determina que um Usuário específico é o proprietário de um recurso — um Lead, um Documento, uma Automação — concedendo a esse Usuário Permissão implícita sobre aquele recurso específico além da Permissão geral já concedida por seu Papel, sempre revogável e transferível conforme regra de negócio do Hub de domínio proprietário daquele recurso.

Delegação permite que um Usuário transfira temporariamente parte de sua própria autoridade a outro, sem alterar o Papel formal de nenhum dos dois — relevante, por exemplo, quando um Gerente delega aprovação de uma categoria específica de ação durante um período de ausência.

Permissões temporárias concedem acesso por um intervalo de tempo definido, expirando automaticamnte sem exigir revogação manual explícita — usadas tipicamente para acesso de consultor externo ou para elevação pontual de privilégio durante uma situação específica.

Permissões contextuais dependem do contexto específico da requisição no momento de sua avaliação — por exemplo, um valor de transação acima de um limite exigindo Permissão adicional que não seria necessária para uma transação de valor menor, mesmo dentro do mesmo tipo de ação — resolvidas pelo ABAC Engine em conjunto com o Policy Engine.

```
                            AUTORIZAÇÃO
   ┌───────────────────────────────────────────────────────────┐
   │  RBAC (padrão) ──► ABAC (extensão por atributo) ──►          │
   │  Policy (regra declarativa mais elaborada)                    │
   │                                                                │
   │  Claims e Scopes — informação carregada pelo Token             │
   │  Ownership e Delegação — autoridade sobre recurso específico   │
   │  Permissões temporárias e contextuais — variação no tempo      │
   │  e no contexto da requisição                                    │
   └───────────────────────────────────────────────────────────┘
```

---

## 11. Sessões

Criação de sessão acontece imediatamente após uma Authentication bem-sucedida, administrada pelo Session Manager, associada a um Dispositivo específico e a um nível inicial de confiança calculado pelo Trust Engine.

Renovação estende o tempo de vida de uma sessão ativa antes de sua expiração, tipicamente de forma transparente enquanto o Usuário permanece ativo, sem exigir reautenticação repetida desnecessária.

Expiração encerra uma sessão automaticamente após um intervalo de inatividade ou após um tempo máximo de vida absoluto, mesmo que a sessão permaneça tecnicamente em uso — um limite de segurança que nenhuma renovação contínua pode ultrapassar indefinidamente.

Revogação encerra uma sessão de forma imediata e explícita, antes de sua expiração natural — disparada, por exemplo, quando uma Permissão relevante é alterada, conforme já estabelecido em `SAAS_ARCHITECTURE.md`, Capítulo 16, ou quando o próprio Usuário solicita encerramento de uma sessão específica a partir de outro dispositivo.

Sessões simultâneas são permitidas por padrão — um mesmo Usuário pode manter sessões ativas em múltiplos dispositivos ao mesmo tempo —, mas cada uma é administrada de forma independente pelo Session Manager, com seu próprio nível de confiança e sujeita a revogação individual sem afetar as demais.

Dispositivos são registrados pelo Device Manager a cada nova sessão, e um dispositivo já reconhecido, com histórico de uso consistente, contribui positivamente ao cálculo de confiança do Trust Engine.

Sessões confiáveis são aquelas com nível de confiança elevado, calculado a partir de dispositivo já reconhecido, padrão de comportamento consistente e ausência de sinal de anomalia — exigindo verificação adicional menos frequente conforme o princípio de autenticação adaptativa já descrito no Capítulo 9.

Sessões suspeitas são identificadas pelo Security Event Manager a partir de padrão anômalo — localização geográfica inconsistente com o histórico recente, tentativa de acesso a recurso fora do padrão habitual daquele Usuário — e podem ser automaticamente rebaixadas em nível de confiança, exigindo reautenticação ou MFA adicional antes de prosseguir, mesmo em meio a uma sessão já em andamento.

---

## 12. Organizações e Equipes

Convites já foram detalhados em `SAAS_ARCHITECTURE.md`, Capítulo 5 — este capítulo não repete o mecanismo, apenas o posiciona como responsabilidade técnica do Invitation Manager descrito no Capítulo 7.

Hierarquia dentro de uma Organização segue o modelo já estabelecido naquele mesmo documento, Capítulo 21 — este capítulo acrescenta que a Hierarquia entre Tenants de uma Organização é administrada tecnicamente pelo Organization Manager, distinto da hierarquia de Papel dentro de um único Workspace, administrada pelo RBAC Engine.

Departamentos são a forma mais comum de organização de uma Equipe, administrada pelo Team Manager, útil para agrupar Usuários por área de atuação sem que isso altere, por si só, nenhuma Permissão — um Departamento é uma estrutura organizacional, não uma unidade de autorização.

Papéis dentro de uma Equipe seguem o mesmo modelo RBAC já estabelecido em `SAAS_ARCHITECTURE.md`, aplicado individualmente a cada Usuário daquela Equipe, nunca herdado coletivamente apenas por pertencer a um Departamento específico.

Gestores são Usuários com Papel de autoridade sobre uma Equipe específica, tipicamente com Permissão de aprovar Delegação e de visualizar atividade agregada daquela Equipe, sem que isso amplie automaticamente sua Permissão sobre recursos individuais de negócio fora desse escopo de gestão.

Administração de uma Organização, distinta da Administração de um único Workspace já descrita em `SAAS_ARCHITECTURE.md`, Capítulo 5, é o conjunto de capacidades de gestão consolidada disponível a um operador de Agência, Franquia ou Grupo Empresarial, administrada pelo Organization Manager.

Usuários externos — um consultor, um parceiro, um fornecedor — recebem acesso através do mesmo mecanismo de Convite, tipicamente sob o Perfil Convidado já descrito em `SAAS_ARCHITECTURE.md`, Capítulo 11, ou sob Permissões temporárias já descritas no Capítulo 10 deste documento, quando o acesso deve expirar automaticamente ao final de um engajamento definido.

Colaboração entre Usuários de diferentes Equipes, ou até de diferentes Workspaces sob a mesma Organização, é sempre mediada por Permissão explícita — nunca por proximidade organizacional implícita — reforçando o princípio Explicit Permissions já descrito no Capítulo 5.

---

## 13. Tenant Isolation

O isolamento multiempresa em nível de dado, evento, conhecimento e identidade de marca já foi detalhado em `SAAS_ARCHITECTURE.md`, Capítulo 6. Este capítulo acrescenta, especificamente, como o Identity Hub garante esse isolamento na camada de autenticação e de sessão.

```
                    ┌─────────────────────────────┐
                    │        Identity Hub          │
                    │  (compartilhado fisicamente,  │
                    │   segregado logicamente)      │
                    └──────────┬──────────┬────────┘
                               │          │
              ┌────────────────┘          └────────────────┐
              ▼                                             ▼
      ┌───────────────┐                             ┌───────────────┐
      │  Tenant A      │                             │  Tenant B      │
      │                │                             │                │
      │  Token contém  │                             │  Token contém  │
      │  claim de       │                             │  claim de       │
      │  Tenant A ──────┼── verificado a cada          │  Tenant B ──────┼── verificado a cada
      │  requisição      │   requisição                │  requisição      │   requisição
      │  Sessão isolada │                             │  Sessão isolada │
      │  Permissão      │                             │  Permissão      │
      │  resolvida só   │                             │  resolvida só   │
      │  no contexto A  │                             │  no contexto B  │
      └───────────────┘                             └───────────────┘

      Nenhum Token emitido para o Tenant A é aceito em uma
      requisição resolvida no contexto do Tenant B.
```

Toda credencial e todo Token emitido pelo Token Manager carrega um Claim de Tenant, verificado a cada requisição — nenhuma sessão autenticada para um Tenant é aceita como válida em uma operação resolvida no contexto de outro, mesmo quando o mesmo Usuário possui Perfil ativo em ambos, conforme já estabelecido em `SAAS_ARCHITECTURE.md`, Capítulo 16.

Para os cenários de Agência, Franquia e Grupo Empresarial já detalhados naquele documento, Capítulo 21, o Identity Hub aplica exatamente a mesma regra sem exceção: um operador de Agência com acesso consolidado a múltiplos Tenants-cliente possui, tecnicamente, uma Sessão e um Perfil distintos para cada Workspace-cliente que acessa, nunca uma única Sessão com Permissão cruzada entre Tenants. O SSO Manager permite que essa alternância entre Workspaces aconteça sem reautenticação repetida, mas cada alternância resolve uma nova Sessão, com seu próprio Claim de Tenant, nunca uma Sessão ambígua válida simultaneamente para múltiplos Tenants.

---

## 14. Integração com os Hubs

O Identity Hub fornece identidade a todo Hub da plataforma através do mesmo padrão: autenticação resolvida uma única vez no AI Gateway, ou equivalente ponto de entrada de cada Hub, e Permissão verificada a cada operação que a exija, sem que nenhum Hub reimplemente essa verificação por conta própria.

O AI Hub consulta o Identity Hub para autenticar a origem de toda solicitação processada pelo AI Gateway, já descrito em `AI_HUB.md`, Capítulo 7, antes de qualquer composição de contexto ou de prompt.

O Business Profile Engine e o Branding Hub consultam o Identity Hub para verificar Permissão de alteração de perfil de negócio ou de identidade de marca, tipicamente restrita a Perfis de Administrador conforme já estabelecido em seus respectivos documentos.

O Automation Engine consulta o Identity Hub através do Condition Engine, já descrito em `AUTOMATION_ENGINE.md`, Capítulo 10, para verificar Permissão antes de executar uma Action que a exija, e através do Approval Engine para identificar o Perfil com autoridade de aprovação de uma Action de alto impacto.

O CRM Hub, o Communication Hub, o Finance Hub e o Growth Hub consultam o Identity Hub para toda operação de negócio sujeita a Permissão específica de Perfil, conforme o modelo já estabelecido em `SAAS_ARCHITECTURE.md`, Capítulo 11 — Financeiro com acesso amplo ao Finance Hub, Marketing com acesso amplo ao Growth Hub, e assim por diante.

O Knowledge Hub consulta o Identity Hub para restringir consulta de documento sensível a Perfis com Permissão adequada, quando uma Empresa configura essa granularidade adicional sobre seu próprio conhecimento indexado.

O Analytics Hub consulta o Identity Hub para determinar quais indicadores um Perfil específico tem Permissão de visualizar — por exemplo, o já mencionado acesso restrito de um Marketing a indicador financeiro consolidado.

O Integration Hub consulta o Identity Hub, especificamente o API Key Manager e o Service Account Manager já descritos no Capítulo 7, para autenticar toda integração externa antes de permitir qualquer chamada de saída em nome de uma Empresa.

Nenhuma dessas integrações é uma exceção ao padrão geral — todo Hub consulta o mesmo Identity Hub, através do mesmo contrato, e nenhum implementa sua própria lógica paralela de autenticação ou de resolução de Permissão.

---

## 15. Segurança

Zero Trust, já descrito como filosofia no Capítulo 4, se traduz operacionalmente em: toda requisição, de qualquer origem, passa por Authentication e Authorization completas, sem exceção baseada em rede de origem ou em sessão previamente estabelecida sem revalidação periódica pelo Trust Engine.

Proteção contra Account Takeover combina MFA obrigatório para Perfis de maior autoridade, Autenticação adaptativa reagindo a sinal de dispositivo e comportamento incomum, e Identity Recovery com verificação suficiente para impedir que um atacante assuma controle de uma conta através do próprio mecanismo de recuperação.

Rate Limiting restringe o número de tentativas de autenticação permitidas em um intervalo de tempo, por Usuário e por origem, mitigando tanto tentativa de força bruta quanto uso abusivo do próprio mecanismo de autenticação.

Brute Force é mitigado pelo Rate Limiting em conjunto com bloqueio temporário progressivo após tentativas falhas consecutivas, administrado pelo Authentication Manager.

Credential Stuffing — o uso de credencial vazada de outro serviço para tentar acesso a esta plataforma — é mitigado pela mesma combinação de Rate Limiting e pela recomendação ativa de Passkey como mecanismo primário, que elimina completamente esse vetor de ataque para o Usuário que o adota.

Session Hijacking é mitigado pela verificação contínua do Trust Engine, que identifica mudança abrupta de padrão de comportamento ou de dispositivo dentro de uma mesma sessão já estabelecida, e pela revogação imediata de sessão já estabelecida em `SAAS_ARCHITECTURE.md`, Capítulo 16.

CSRF é mitigado através de verificação de origem de requisição integrada ao Token Manager, garantindo que uma ação sensível só seja aceita quando originada de um contexto de aplicação legítimo.

Replay Attack — a reutilização de uma requisição já processada anteriormente, capturada por um interceptador — é mitigado por Token de vida curta e por verificação de unicidade em operações sensíveis.

Phishing — tentativa de obter credencial através de engano direto ao Usuário — é mitigado principalmente pela adoção de Passkey, que não pode ser digitada nem transmitida a um site fraudulento da mesma forma que uma senha, e secundariamente por MFA, que reduz o dano de uma senha comprometida por phishing.

Logs, administrados em conjunto pelo Audit Manager e pelo Security Event Manager, registram toda tentativa de autenticação, bem-sucedida ou falha, e toda decisão de autorização relevante.

Alertas são disparados pelo Security Event Manager quando um padrão específico — volume elevado de tentativa falha, acesso de localização incomum, elevação de Permissão fora do padrão — é identificado, permitindo intervenção antes que um incidente se concretize.

Auditoria, já descrita como princípio no Capítulo 5, é aplicada de forma obrigatória e sem exceção configurável a toda decisão de acesso.

LGPD é respeitada através do Consent Manager, que registra a finalidade específica para a qual cada dado pessoal de identidade foi coletado, e do próprio Identity Recovery e Identity Versioning, que garantem que um pedido de exclusão de dado pessoal seja tecnicamente executável até mesmo sobre o histórico de identidade de um Usuário, respeitando o mesmo compromisso de direito de exclusão já estabelecido em todos os documentos anteriores desta série.

Consentimento é obtido no momento em que um dado pessoal adicional é coletado além do estritamente necessário para autenticação — por exemplo, um dado biométrico usado como segundo fator — e permanece revogável a qualquer momento pelo próprio Usuário, sem que essa revogação comprometa sua capacidade de continuar autenticando-se através de outro mecanismo já disponível.

---

## 16. Observabilidade

Logs registram toda tentativa de autenticação, toda decisão de autorização, e toda mudança relevante de identidade, com o mesmo padrão estrutural já estabelecido em `SYSTEM_BLUEPRINT.md`, Capítulo 13.

Tracing conecta esses registros individuais em uma linha completa e navegável por sessão, permitindo reconstruir exatamente a jornada de uma sessão específica desde sua autenticação inicial até seu encerramento.

Identity Analytics, já descrito no Capítulo 7, agrega esse dado em indicador consultável de negócio e de segurança.

Eventos de identidade — autenticação bem-sucedida, falha de autenticação, mudança de Permissão, revogação de sessão — são publicados no Event Bus já descrito em `SYSTEM_BLUEPRINT.md`, permitindo que qualquer Hub interessado reaja a eles, como o Automation Engine reagindo a um evento de mudança de Permissão para disparar uma notificação relevante.

Alertas, já descritos no Capítulo 15 como mecanismo de segurança, são também um mecanismo de observabilidade operacional geral — uma taxa elevada de falha de autenticação pode indicar tanto um ataque em andamento quanto um problema técnico legítimo em um provedor de autenticação federada específico, e ambos merecem investigação.

Health Checks reportam a disponibilidade operacional do próprio Identity Hub, particularmente crítica dado que nenhum outro Hub da plataforma pode operar sem que o Identity Hub esteja disponível para resolver Authentication e Authorization.

Anomalias são identificadas pelo Security Event Manager e pelo Trust Engine em conjunto, cruzando padrão de dispositivo, de comportamento e de contexto geográfico, alimentando tanto alerta de segurança em tempo real quanto refinamento contínuo do próprio cálculo de confiança.

Métricas agregam volume de autenticação por método, latência de resolução de Authorization, e taxa de sucesso de cada mecanismo disponível, informando tanto a operação técnica quanto decisão futura de produto sobre quais mecanismos priorizar.

Um sinal de observabilidade específico deste Hub, sem equivalente direto em nenhum dos Hubs já documentados nesta série, é a distribuição de nível de confiança calculada pelo Trust Engine ao longo do tempo, segmentada por Tenant. Uma queda sustentada no nível médio de confiança das sessões de um Tenant específico — mesmo sem nenhum evento isolado grave o suficiente para disparar um Alerta individual — é um indício de degradação gradual da postura de segurança daquela Empresa, seja por adoção crescente de dispositivos não gerenciados, seja por padrão de acesso cada vez mais disperso geograficamente. Esse indicador é tratado como sinal de acompanhamento proativo, consultável pelo próprio Administrador do Tenant através do Identity Analytics, não apenas como métrica interna de operação da plataforma.

---

## 17. Escalabilidade

Milhões de usuários e milhões de sessões simultâneas são suportados através do mesmo princípio de escalabilidade horizontal já estabelecido em `SYSTEM_BLUEPRINT.md`, Capítulo 14 — nenhum componente do Identity Hub retém estado de sessão localmente em uma única instância de processamento; o Session Manager mantém esse estado de forma centralizada e persistente, permitindo que qualquer instância disponível resolva qualquer sessão.

Cache, administrado pelo Identity Cache já descrito no Capítulo 7, reduz a carga de resolução repetida de Authorization para operações de alta frequência, sempre com tempo de vida limitado o suficiente para que uma revogação de Permissão produza efeito dentro de um intervalo aceitável.

Distribuição geográfica de instâncias de processamento reduz latência de autenticação para Usuários geograficamente distantes da infraestrutura central, seguindo o mesmo princípio de Alta disponibilidade e CDN já descrito em `SAAS_ARCHITECTURE.md`, Capítulo 17.

Alta disponibilidade garante que a indisponibilidade de uma única instância do Identity Hub não comprometa a capacidade de qualquer Usuário de autenticar-se ou de ter sua Permissão resolvida — dada a centralidade do Identity Hub para toda a plataforma, este é um dos componentes com o requisito de disponibilidade mais rigoroso de toda a arquitetura.

Failover garante que, em caso de falha de uma instância ou de uma zona de infraestrutura inteira, uma sessão já estabelecida continue válida e resolvível a partir de outra instância, sem exigir reautenticação do Usuário simplesmente por conta de uma falha de infraestrutura não relacionada à sua própria sessão.

Provider Failover, específico à Identity Federation já descrita no Capítulo 7, garante que a indisponibilidade momentânea de um provedor externo de identidade — usado via OAuth, OIDC ou SAML — não impeça, quando tecnicamente possível, que um Usuário com mecanismo alternativo já configurado continue acessando a plataforma através dele.

Horizontal Scaling, já estabelecido como princípio geral em `SYSTEM_BLUEPRINT.md`, aplica-se ao Identity Hub através da adição de mais instâncias de processamento de Authentication e Authorization, nunca através do aumento de capacidade de uma única instância central que se tornaria, ela mesma, um ponto único de falha para toda a plataforma.

---

## 18. Casos de Uso

**Novo usuário.** Uma Empresa recém-cadastrada tem seu primeiro Usuário provisionado como Owner, conforme já descrito em `SAAS_ARCHITECTURE.md`, Capítulo 11. O User Manager cria o registro de identidade; o RBAC Engine associa o Papel Owner; o Session Manager cria a primeira Sessão após Authentication bem-sucedida, tipicamente via Senha ou OAuth no primeiro acesso.

**Convite para equipe.** O Owner convida um segundo Usuário através do Invitation Manager, atribuindo o Papel Marketing. O convidado aceita o Convite, o User Manager cria seu registro de identidade associado àquele Workspace, e o RBAC Engine resolve, a partir desse momento, as Permissões correspondentes ao Papel Marketing em toda operação subsequente daquele Usuário.

**Troca de função.** Um Usuário anteriormente associado ao Papel Operador é promovido a Gerente. O RBAC Engine atualiza a associação de Papel; o Identity Versioning registra a mudança como uma nova versão do estado de Permissão daquele Usuário; e, conforme já estabelecido em `SAAS_ARCHITECTURE.md`, Capítulo 16, qualquer Sessão ativa daquele Usuário é invalidada imediatamente, exigindo nova autenticação que já refletirá o Papel atualizado.

**Login via Google.** Um Usuário opta por autenticar-se através de OAuth/OIDC usando sua conta Google já existente. O OAuth Manager processa o fluxo de autorização delegada; o OIDC Manager confirma a identidade; o Identity Federation associa essa identidade externa ao registro de Usuário já existente na plataforma, ou cria um novo registro quando este é o primeiro acesso daquele Usuário.

**Login via Microsoft.** Uma Empresa cliente de plano Enterprise configura SAML através do SAML Manager, integrando seu próprio provedor de identidade corporativo Microsoft Entra ID. Usuários daquela Empresa acessam a plataforma autenticando-se através de sua própria infraestrutura corporativa já existente, sem que a plataforma armazene uma credencial própria e duplicada para eles.

**MFA obrigatório.** Um Usuário com Papel Owner tenta autenticar-se apenas com Senha. A Policy Engine, através de uma regra que exige MFA para todo Papel de autoridade Owner ou Administrador, força uma segunda etapa de verificação através do MFA Manager antes de conceder a Sessão, mesmo que a Senha informada esteja correta.

**Recuperação de conta.** Um Usuário perde acesso à sua credencial primária. O Identity Recovery inicia um processo de verificação através de um canal já anteriormente confirmado — tipicamente e-mail associado à conta —, exige confirmação adicional proporcional à autoridade do Papel daquele Usuário, e, uma vez concluído, permite a definição de uma nova credencial primária, com o Security Event Manager registrando o evento para monitoramento de padrão anômalo subsequente.

**Conta comprometida.** O Security Event Manager identifica um padrão de acesso anômalo — tentativa de login de localização geográfica inconsistente com o histórico recente do Usuário, seguida de tentativa de elevação de Permissão. O Trust Engine rebaixa imediatamente o nível de confiança da sessão em andamento; o Session Manager força reautenticação com MFA; e, caso a anomalia se confirme, um Administrador é notificado através do Notification Engine já descrito em `AUTOMATION_ENGINE.md`, permitindo revogação manual completa de toda credencial daquele Usuário.

**Funcionário desligado.** Um Administrador remove o acesso de um Usuário que deixou a Empresa. O User Manager desativa o registro de identidade; o Session Manager revoga imediatamente toda Sessão ativa daquele Usuário, em qualquer Workspace ao qual tivesse acesso; e o Audit Manager preserva o registro completo de todo acesso e toda ação realizada por aquele Usuário enquanto ativo, permanecendo consultável mesmo após a desativação.

**Administrador temporário.** Um Owner concede Permissão temporária de nível Administrador a um consultor externo, por um prazo definido de trinta dias, através de uma Permissão temporária já descrita no Capítulo 10. O ABAC Engine resolve essa concessão como uma exceção contextual e com prazo, sem alterar o Papel formal do consultor, e o Permission Resolver revoga automaticamente essa elevação ao final do prazo definido, sem exigir ação manual explícita de nenhum Administrador para reverter a concessão original.

---

## 19. Roadmap

No curto prazo, a prioridade é o Identity Manager, o Authentication Manager com suporte a Senha e Passkey, o RBAC Engine operando de ponta a ponta sobre os oito Papéis já definidos em `SAAS_ARCHITECTURE.md`, e o Session Manager com criação, renovação e revogação funcionais.

No médio prazo, a prioridade é a integração federada completa através de OAuth, OIDC e SAML, o Trust Engine calculando confiança contínua a partir de sinal real de dispositivo e comportamento, o ABAC Engine e o Policy Engine cobrindo os cenários de Permissão contextual já descritos no Capítulo 10, e o MFA Manager plenamente integrado à Autenticação adaptativa.

No longo prazo, a prioridade é o refinamento contínuo do Security Event Manager com base em padrão observado entre milhões de sessões, a maturidade plena do Identity Federation para suportar qualquer provedor externo relevante de mercado sem exigir nova integração dedicada por provedor, e a evolução do Trust Engine para antecipar risco de conta comprometida antes que um padrão anômalo se torne evidente o suficiente para disparar alerta reativo.

---

## 20. Architecture Decision Records

**ADR-001 — Toda autenticação passa pelo Identity Hub.** Nenhum Hub de domínio implementa sua própria verificação de credencial. Contexto: aplicação direta do princípio Centralized Identity e Identity as a Platform Service.

**ADR-002 — RBAC é obrigatório para toda Permissão da plataforma.** Toda Permissão concedida é, no mínimo, expressável em termos de associação a um Papel. Contexto: mesmo princípio já estabelecido em `SAAS_ARCHITECTURE.md`, ADR-006, aqui reafirmado como condição de aceitação de qualquer nova capacidade de autorização.

**ADR-003 — ABAC é evolução do RBAC, nunca substituição.** Toda Permissão resolvida por atributo contextual pressupõe que uma associação de Papel já existe como base. Contexto: preservar simplicidade de gestão de acesso para a maioria dos Tenants, que nunca precisará de granularidade além de RBAC, mesmo raciocínio já registrado em `SAAS_ARCHITECTURE.md`, ADR-006.

**ADR-004 — Tenant Isolation é inviolável, inclusive na camada de sessão e de Token.** Nenhum Token emitido para um Tenant é aceito em uma requisição resolvida no contexto de outro. Contexto: aplicação direta do isolamento multiempresa já estabelecido em `SAAS_ARCHITECTURE.md`, Capítulo 6, estendido explicitamente à camada de identidade.

**ADR-005 — Identity é independente dos Módulos de negócio.** Nenhum Hub de domínio mantém cópia própria de credencial, Sessão ou Permissão. Contexto: aplicação do princípio Centralized Identity; alternativa descartada — permitir que um Hub de alta frequência de uso mantenha um cache local de Permissão de longa duração para reduzir latência, rejeitada por criar risco de Permissão desatualizada não refletir uma revogação recente.

**ADR-006 — Authentication sempre precede Authorization, nunca em paralelo.** Nenhuma verificação de Permissão é iniciada antes que a identidade da requisição já tenha sido confirmada. Contexto: aplicação do princípio Authentication Before Authorization; uma inversão dessa ordem tornaria possível avaliar Permissão contra uma identidade ainda não verificada.

**ADR-007 — Toda decisão de acesso, concedida ou negada, é auditada.** Nenhuma exceção configurável permite que uma decisão de Authorization deixe de ser registrada pelo Audit Manager. Contexto: aplicação do princípio Auditable Everything; sem essa garantia, nenhuma investigação de segurança seria completa.

**ADR-008 — Passkey é o mecanismo de autenticação recomendado por padrão, com Senha mantida como alternativa, nunca removida.** Contexto: Passkey elimina o vetor de ataque de Credential Stuffing e reduz significativamente o risco de Phishing, mas a transição não pode ser forçada de forma abrupta sobre uma base de Usuários já estabelecida sem alternativa de transição.

**ADR-009 — MFA é obrigatório para Papéis de autoridade Owner e Administrador, configurável para os demais.** Contexto: aplicação de Least Privilege combinado com proporcionalidade de risco — o impacto de uma conta Owner comprometida justifica exigência mais rígida que a de um Papel operacional.

**ADR-010 — Revogação de Permissão invalida Sessão ativa imediatamente, nunca apenas na próxima renovação natural.** Já estabelecido em `SAAS_ARCHITECTURE.md`, ADR-011, reafirmado aqui como responsabilidade técnica direta do Session Manager. Contexto: uma janela de acesso residual após revogação é, na prática, uma revogação incompleta.

**ADR-011 — Nenhum Token de Service Account ou de API Key recebe escopo amplo por padrão.** Todo Token não interativo é emitido com Scope explicitamente delimitado à operação necessária. Contexto: aplicação de Least Privilege a identidade não humana, prevenindo que uma integração comprometida obtenha acesso além do estritamente necessário à sua função.

**ADR-012 — O mecanismo de recuperação de conta nunca oferece caminho de acesso mais fácil que a autenticação primária que substitui.** Toda recuperação exige verificação proporcional à autoridade do Papel do Usuário afetado. Contexto: sem essa garantia, o Identity Recovery se tornaria, ele mesmo, o vetor de ataque mais provável contra a plataforma, invertendo o propósito de segurança que deveria cumprir.

---

## 21. Glossário

**Identity Hub** — mecanismo responsável por autenticação, autorização, gestão de usuários e confiança de toda a plataforma.

**Authentication** — processo de confirmação de quem está por trás de uma requisição.

**Authorization** — processo de confirmação do que uma identidade já autenticada tem permissão de fazer.

**RBAC** — Role-Based Access Control, modelo de autorização por associação de Papel, já definido em `SAAS_ARCHITECTURE.md`.

**ABAC** — Attribute-Based Access Control, extensão ao RBAC que resolve Permissão a partir de atributo contextual adicional.

**Policy** — regra de autorização declarativa avaliada pelo Policy Engine, usada para decisão mais elaborada que RBAC ou ABAC isolados.

**Claim** — afirmação verificada sobre uma identidade, incluída em um Token.

**Scope** — delimitação do alcance de um Token específico.

**Passkey** — credencial de autenticação baseada em chave criptográfica associada a um dispositivo, sem uso de senha.

**MFA** — verificação multifator, exigindo um segundo fator de autenticação além da credencial primária.

**Trust Engine** — componente que calcula, de forma contínua, o nível de confiança atribuído a uma sessão.

**Zero Trust** — princípio segundo o qual nenhuma requisição é confiável por padrão, independentemente de sua origem.

**Tenant Isolation** — garantia de que identidade, sessão e Permissão de um Tenant nunca são acessíveis a partir de outro.

**Identity Federation** — relação de confiança entre a plataforma e um provedor de identidade externo.

**Service Account** — identidade não humana usada por um processo interno ou por uma integração de sistema a sistema.

**Permission Resolver** — componente que combina RBAC, ABAC e Policy em uma decisão final e única de autorização.

**Session** — registro de uma autenticação ativa, com ciclo de vida próprio, independente do Usuário e do Perfil.

---

## 22. Conclusão

O Identity Hub é a fundação de confiança da Adaptive Business Platform. Sem ele, não existe autenticação verificável, autorização consistente, auditoria completa ou isolamento seguro entre empresas — cada um desses quatro elementos é uma pré-condição para que qualquer outro Hub da plataforma opere de forma confiável, não uma capacidade adicional entre outras.

Todo Hub descrito nos documentos anteriores desta série — AI Hub, Business Profile Engine, Branding Hub, Automation Engine, e cada Hub de domínio ainda a ser documentado — depende do Identity Hub para saber quem está fazendo uma requisição, em nome de qual Empresa, sob qual Perfil, e com quais Permissões, antes de executar qualquer trabalho de negócio. Essa dependência não é uma fraqueza de acoplamento — é a mesma centralização deliberada já aplicada à inteligência artificial no AI Hub, aplicada aqui ao domínio de acesso e confiança, pelos mesmos motivos: consistência, auditabilidade e segurança que nenhuma implementação dispersa entre Módulos conseguiria sustentar de forma confiável ao longo de muitos anos de evolução.

Junto com `PLATFORM_MANIFESTO.md`, `AI_HUB.md`, `SYSTEM_BLUEPRINT.md`, `SAAS_ARCHITECTURE.md`, `BUSINESS_PROFILE_ENGINE.md`, `BRANDING_HUB.md` e `AUTOMATION_ENGINE.md`, este documento completa a referência arquitetural que explica não apenas o que a Adaptive Business Platform sabe sobre cada empresa, como ela se apresenta e como ela age em nome de cada uma delas, mas quem tem permissão de fazer o quê, e como a plataforma sabe, com certeza, quem está do outro lado de cada requisição — a garantia sem a qual nenhuma das demais promessas descritas nos documentos anteriores desta série seria sustentável em produção, ao longo de muitos anos, para milhares de empresas operando simultaneamente sobre o mesmo núcleo compartilhado.
