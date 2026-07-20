# 02A — DOMAIN MODEL

**Andreia AI Platform**
Modelo de domínio — os conceitos de negócio da plataforma e como se relacionam.

Este documento fala exclusivamente sobre **negócio**. Não descreve implementação, não cita TypeScript, não cita arquivos ou pastas de código — para isso, ver `docs/02-SYSTEM_ARCHITECTURE.md`. Este documento responde a uma pergunta diferente: *o que essas palavras significam para quem usa a plataforma*, independentemente de como estão construídas.

---

## A cadeia de conceitos

```
Empresa
  ↓
Workspace
  ↓
Usuários
  ↓
Papéis
  ↓
Hub
  ↓
Módulo
  ↓
Serviço
  ↓
Conector
  ↓
Automação
  ↓
Workflow
  ↓
Projeto
  ↓
Cliente
  ↓
Documento
  ↓
Campanha
  ↓
Conteúdo
  ↓
Publicação
  ↓
Agente
  ↓
Memória
  ↓
Integração
```

A seta não significa "é dono de" em todos os casos — significa "o conceito de cima é o contexto em que o de baixo existe". Cada conceito é explicado abaixo, na mesma ordem.

---

## Empresa

A organização real que usa a plataforma — um negócio de verdade, com um dono, uma operação, clientes próprios. É a raiz de tudo: nenhum outro conceito deste documento existe fora do contexto de uma Empresa.

**Relaciona-se com:** possui um ou mais Workspaces.

## Workspace

O ambiente isolado de uma Empresa dentro da plataforma — onde os dados, as configurações e os módulos ativados daquela Empresa vivem, sem se misturar com os de nenhuma outra Empresa. Uma Empresa pequena normalmente tem um único Workspace; uma Empresa com múltiplas marcas ou unidades de negócio pode ter mais de um.

**Relaciona-se com:** pertence a uma Empresa; contém Usuários; ativa Hubs (e, através deles, Módulos).

## Usuários

As pessoas que efetivamente acessam um Workspace — donos, colaboradores, prestadores de serviço autorizados. Um Usuário sempre existe dentro do contexto de um ou mais Workspaces, nunca isolado.

**Relaciona-se com:** acessa um Workspace; tem um ou mais Papéis dentro dele.

## Papéis

O perfil de acesso de um Usuário dentro de um Workspace — o que define o que essa pessoa pode ver e fazer (ex.: dono, administrador, colaborador operacional, convidado). O mesmo Usuário pode ter Papéis diferentes em Workspaces diferentes.

**Relaciona-se com:** atribuído a um Usuário, dentro de um Workspace; condiciona o acesso a Hubs, Módulos e ações de Automação.

## Hub

Um agrupamento de Módulos por propósito de negócio — Business, Growth, Operations, Integration, AI, Marketplace, Academy (ver `docs/PLATFORM_VISION.md` §3 para a lista completa). Um Hub não é usado diretamente; é ativado e navegado, e dentro dele é que os Módulos concretos aparecem.

**Relaciona-se com:** ativado por um Workspace; agrupa um ou mais Módulos.

## Módulo

A unidade concreta de funcionalidade de negócio que uma Empresa liga ou desliga — CRM, Blog, Agenda, Financeiro etc. É o nível em que a modularidade da plataforma realmente acontece: cada Módulo é independente dos demais, e uma Empresa só carrega o que ativa.

**Relaciona-se com:** pertence a um Hub; usa Serviços; usa Conectores para alcançar o mundo externo; produz e consome Projetos, Clientes, Documentos, Campanhas, Conteúdo e Publicações, dependendo do seu domínio.

## Serviço

Uma capacidade transversal, usada por um ou mais Módulos, que não é ela mesma um Módulo de negócio — por exemplo, algo como "geração de PDF" ou "envio de notificação" não pertence a nenhum Hub específico, mas vários Módulos podem precisar dela.

**Relaciona-se com:** consumido por um ou mais Módulos; pode, por sua vez, depender de um Conector.

## Conector

A ponte entre a plataforma e um sistema do mundo externo — Google, Meta, WordPress, WhatsApp, um provedor de IA. Um Módulo nunca fala diretamente com o mundo externo: sempre atravessa um Conector.

**Relaciona-se com:** usado por Módulos e Serviços; materializa-se, para um Workspace específico, como uma Integração.

## Automação

O mecanismo que observa o que acontece na plataforma e decide agir — reagindo a uma condição, um horário ou um evento, sem que um humano precise disparar manualmente cada ação. Uma Automação não faz o trabalho de negócio ela mesma: ela aciona um Workflow.

**Relaciona-se com:** observa eventos; aciona Workflows; atua sobre um ou mais Módulos.

## Workflow

Uma sequência concreta de passos de negócio, definida para atingir um objetivo — por exemplo, "quando um Lead chega, qualificar, atribuir a um vendedor, agendar contato". Um Workflow é o que uma Automação de fato executa.

**Relaciona-se com:** disparado por uma Automação; opera sobre entidades de negócio (um Cliente, um Documento, uma Campanha) dentro de um ou mais Módulos.

## Projeto

Uma unidade de trabalho organizado dentro de um Workspace — um objetivo com início, meio e (idealmente) fim, que agrupa tarefas e pode referenciar Clientes, Documentos e Campanhas relacionados a ele. Vive primariamente no Módulo de Projetos, mas frequentemente cruza vários Módulos.

**Relaciona-se com:** pertence a um Workspace; pode referenciar um Cliente; produz e organiza Documentos.

## Cliente

Quem a Empresa atende — a pessoa ou organização do outro lado da relação comercial. É a entidade central do Módulo de CRM, mas é referenciada por praticamente todo o resto: Vendas, Financeiro, Suporte, Projetos.

**Relaciona-se com:** gerido primariamente pelo Módulo de CRM; associado a Projetos, Documentos (contratos, propostas) e, no Growth Hub, ao resultado de Campanhas (quando um Cliente vem de uma campanha de aquisição).

## Documento

Qualquer registro ou arquivo produzido ou consumido pela operação — um contrato, uma nota fiscal, um rascunho de conteúdo, um relatório. "Documento" é um conceito amplo que aparece dentro de vários Módulos, não só no Módulo de Documentos.

**Relaciona-se com:** pode pertencer a um Projeto, a um Cliente, ou ser o próprio Conteúdo em produção antes de virar Publicação.

## Campanha

Um esforço de marketing coordenado, com objetivo e período definidos, que agrupa Conteúdo e Publicações através de um ou mais canais (Blog, redes sociais, anúncios pagos). Pertence ao Growth Hub.

**Relaciona-se com:** agrupa Conteúdo; gera Publicações; pode gerar novos Clientes (via Conversão).

## Conteúdo

O material em si, antes de ir ao ar — um texto, uma imagem, um vídeo, um roteiro de anúncio. É produzido (tipicamente por um Agente) e, quando pronto, se torna uma Publicação.

**Relaciona-se com:** produzido por um Agente; pertence a uma Campanha (quando aplicável); vira Publicação ao ser lançado.

## Publicação

O ato — e o registro — de um Conteúdo ter ido ao ar em um canal real, através de um Conector (ex.: publicar um post no WordPress via o Conector de WordPress).

**Relaciona-se com:** originada de um Conteúdo; realizada através de um Conector; mensurada de volta para a Campanha e para os indicadores de negócio.

## Agente

Uma entidade de IA que executa trabalho dentro da plataforma — de forma autônoma ou assistida por um humano — sobre um ou mais Módulos. Não é uma pessoa nem uma automação simples de regra fixa: tem comportamento adaptativo e mantém Memória do que já fez.

**Relaciona-se com:** opera dentro de um ou mais Módulos/Hubs; produz Conteúdo; participa de Workflows; mantém Memória.

## Memória

O que um Agente retém entre uma execução e outra — contexto de interações passadas, preferências aprendidas, histórico relevante para decisões futuras. Sem Memória, um Agente trataria cada execução como se fosse a primeira vez.

**Relaciona-se com:** pertence a um Agente; alimentada pelas execuções anteriores desse Agente.

## Integração

A instância concreta e ativa de um Conector para um Workspace específico — por exemplo, "a Integração com o WordPress da Empresa X" é o Conector de WordPress já autenticado e configurado para aquele Workspace em particular. O Conector é o padrão genérico; a Integração é o uso real dele por uma Empresa.

**Relaciona-se com:** instancia um Conector; pertence a um Workspace; usada por Módulos, Serviços e Automações daquele Workspace para alcançar o sistema externo correspondente.

---

## Glossário

- **Hub** — Agrupamento de módulos por propósito de negócio (Business, Growth, Operations, Integration, AI, Marketplace, Academy).
- **Módulo** — Unidade de negócio ativável/desativável por empresa (ex.: CRM, Blog).
- **Serviço** — Funcionalidade transversal da plataforma, não amarrada a um módulo de negócio específico.
- **Connector** — Ponte de acesso a um sistema externo; único ponto de saída autorizado da plataforma para fora.
- **Pipeline** — Sequência ordenada de etapas (Steps) executadas com um resultado único ao final.
- **Runtime** — Processo que controla o ciclo de vida da plataforma em execução.
- **Workspace** — Ambiente isolado de uma empresa dentro da plataforma.
- **Tenant** — A empresa cliente dona de um Workspace (contexto de multiempresa).
- **Automation** — Motor que orquestra lógica condicional/sequencial entre módulos.
- **Workflow** — Sequência de ações de negócio executada por uma Automation.
- **Agent** — Entidade de IA que executa tarefas de forma autônoma ou assistida.
- **Skill** — Capacidade reutilizável que um Agent pode executar.
- **Capability** — Permissão/limite do que um Agent tem autorização de fazer.
- **Event** — Fato ocorrido na plataforma, publicado no EventBus para quem quiser reagir.
- **Registry** — Catálogo central de instâncias registráveis de um mesmo tipo.
- **Provider** — Implementação concreta de acesso a um serviço externo de IA ou de dados.
- **Boot** — Processo de inicialização da plataforma.
- **Lifecycle** — Conjunto de estados/transições que uma entidade gerenciada percorre (criação, execução, encerramento).
