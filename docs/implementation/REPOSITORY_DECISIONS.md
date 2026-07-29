# Repository Decisions

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento registra decisões arquiteturais relacionadas exclusivamente ao Repository Cleanup, condicionantes para o início da Phase 3 — Directory Cleanup, conforme identificado em `REPOSITORY_AUDIT_REPORT.md`, Seção 6 ("Ready with Conditions"). Ele não executa nenhuma ação, não modifica código, não move arquivos, e não remove diretórios. Cada decisão registrada abaixo foi resolvida com base exclusivamente em evidência técnica já coletada em `REPOSITORY_SNAPSHOT.md`, `REPOSITORY_AUDIT_REPORT.md` e `PHASE2_EXECUTION_REPORT.md`, sem nenhum critério de preferência.*

---

## Purpose

Este documento existe para registrar, de forma formal e auditável, as três decisões arquiteturais que `REPOSITORY_AUDIT_REPORT.md` (Seção 6) identificou como condição para a execução segura da Phase 3 — Directory Cleanup e das fases seguintes do Repository Cleanup. Cada decisão foi resolvida a partir de evidência técnica concreta — commits existentes, arquivos de configuração, contagem de arquivos — nunca por preferência arquitetural isolada.

A resolução de uma Decision neste documento não executa a ação que ela implica. Ela autoriza que a Fase de Execução correspondente (Phase 3 em diante) proceda de acordo com o que foi decidido, seguindo à risca a Rollback Strategy já definida em `REPOSITORY_CLEANUP_PLAN.md`, Seção 9.

---

## Decision 001

**Título:** Package Manager Strategy

**Contexto**

`REPOSITORY_SNAPSHOT.md` (Seção 5) e `REPOSITORY_AUDIT_REPORT.md` (Seção 4, "Dependencies") registram a coexistência, na raiz do repositório, de três lockfiles: `package-lock.json`, `package-lock 2.json` e `pnpm-lock.yaml`. Este achado foi classificado como Critical pelo risco de instalações divergentes e builds não reprodutíveis.

**Alternativas Consideradas**

- **npm** — gerenciador já refletido em `package-lock.json` na raiz.
- **pnpm** — gerenciador já refletido em `pnpm-lock.yaml` na raiz e explicitamente declarado em `platform/package.json`.

**Justificativa Técnica**

A inspeção de `platform/package.json` mostra o campo `"packageManager": "pnpm@11.15.1"` e `"engines": {"node": ">=20.0.0"}`, uma declaração explícita e versionada — não inferida — de que o workspace `platform/` foi concebido para pnpm desde sua origem. O mesmo arquivo já usa comandos exclusivos de workspace pnpm (`pnpm --filter @abp/web dev`, `pnpm -r --if-present run build`), e `platform/pnpm-workspace.yaml` declara os pacotes do monorepo (`apps/*`, `services/*`, `packages/*`) — um recurso que depende nativamente do protocolo de workspace do pnpm.

Em contraste, o `package.json` da raiz não declara nenhum `packageManager` e seus scripts (`vite`, `tsc -b && vite build`) são agnósticos a gerenciador de pacotes — nada ali exige especificamente npm. A raiz já possui, inclusive, um `pnpm-lock.yaml` preexistente, evidenciando que pnpm já foi utilizado ali em algum momento. A existência de `package-lock 2.json` — uma cópia duplicada e visivelmente acidental do lockfile do npm — é evidência adicional de que o uso de npm na raiz não decorre de uma escolha deliberada e controlada, e sim de instalações não coordenadas.

Como qualquer relação futura entre a aplicação legada da raiz e `platform/` (Decision 003) exige uma ferramenta de workspace única para ser administrável, e apenas pnpm está tecnicamente comprometido com essa capacidade neste repositório, pnpm é a escolha tecnicamente necessária, não apenas preferencial.

**Decisão Adotada**

**pnpm** é adotado como o único gerenciador de pacotes do repositório, para a raiz e para `platform/`.

**Impact**

`pnpm-lock.yaml` passa a ser a única fonte da verdade para instalação de dependências em todo o repositório. `package-lock.json` e `package-lock 2.json` deixam de ter qualquer validade e são candidatos à remoção em fase de execução subsequente. O lockfile `pnpm-lock.yaml` da raiz deve ser regenerado a partir do `package.json` vigente antes de qualquer novo commit de dependências, garantindo que reflita exatamente as dependências declaradas.

**Consequências**

- A Phase 3 pode remover `package-lock.json` e `package-lock 2.json` do repositório.
- Qualquer instalação futura de dependências, na raiz ou em `platform/`, deve ser feita exclusivamente via pnpm.
- Nenhuma alteração de dependências foi executada por esta decisão — apenas o gerenciador foi definido.

**Status**

Approved

---

## Decision 002

**Título:** Backups Strategy

**Contexto**

`REPOSITORY_SNAPSHOT.md` (Seções 4 e 6) e `REPOSITORY_AUDIT_REPORT.md` (Seção 4, "Repository Structure") registram que `backups/` está versionado no Git com 155 arquivos rastreados, incluindo duas árvores de projeto quase completas (`v0.1-dashboard-funcionando/` e `v0.1-phaser-corrigido/`) e dois arquivos soltos (`OfficeScene-corrompido.ts`, `OfficeScene-teste-phaser-ok.ts`). Este achado foi classificado como High pela Seção 5 do Audit Report, por duplicar histórico que o próprio Git já preserva.

**Alternativas Consideradas**

- **Manter** `backups/` versionado como está.
- **Arquivar externamente** (mover o conteúdo para fora do repositório Git, preservando-o em outro meio).
- **Remover do repositório**, com recuperabilidade garantida exclusivamente pelo histórico de commits já existente do Git.
- **Outra solução** — não identificada como tecnicamente superior às três acima.

**Justificativa Técnica**

A inspeção do histórico de commits (`git log --all --graph`) confirma que o repositório possui 6 commits encadeados e alcançáveis a partir de `HEAD`, formando uma cadeia real de ancestralidade: `e7667bb` ("v0.1 Dashboard compilando") → `bd7f63d` ("Corrige crash WebGL do Phaser 3.90 com patch RenderTarget") → `20583bb` ("fix: renderização dos agentes no escritório Phaser") → `55f18c6` ("fix: estabiliza renderização dos agentes") → `8ef13ad` ("Initial commit") → `1d3999e` (Phase 2 — Git Cleanup). `git merge-base --is-ancestor` confirma que `e7667bb` é ancestral direto de `HEAD`.

A comparação das árvores de arquivo mostra que `backups/v0.1-dashboard-funcionando/` já existia, com o mesmo conteúdo essencial, no commit mais antigo alcançável (`e7667bb`) — ou seja, a cópia dentro de `backups/` não é um registro histórico único: ela coexiste, desde o primeiro commit já registrado, com uma árvore `src/` na raiz que evoluiu de forma própria e rastreável commit a commit (confirmado por `git diff --stat e7667bb -- src/`, que mostra 117 arquivos modificados entre aquele estado e o atual). Em outras palavras, o próprio histórico do Git já cumpre, de forma nativa e mais precisa, o papel que `backups/` tenta cumprir manualmente: preservar estados anteriores do projeto.

Como o Repository Cleanup Plan já estabelece, em sua Seção 1, que "o histórico do Git já é o mecanismo apropriado para preservar versões anteriores", e essa afirmação é agora tecnicamente confirmada pela ancestralidade real do histórico observado, manter `backups/` versionado não agrega nenhuma capacidade de recuperação que o Git não já ofereça — apenas 155 arquivos de peso morto no diretório de trabalho ativo.

**Decisão Adotada**

**Remover `backups/` do repositório** (do índice do Git e do diretório de trabalho), com recuperabilidade garantida integralmente pelo histórico de commits já existente (`e7667bb`, `bd7f63d`, `20583bb`, `55f18c6`, `8ef13ad`), sem necessidade de arquivamento externo adicional.

**Impact**

Os 155 arquivos de `backups/` deixam de fazer parte do diretório de trabalho ativo do repositório. Qualquer necessidade futura de consultar `OfficeScene-corrompido.ts`, `OfficeScene-teste-phaser-ok.ts`, ou o conteúdo de `v0.1-dashboard-funcionando/`/`v0.1-phaser-corrigido/` pode ser satisfeita via `git show <commit>:backups/<caminho>` ou checkout do commit correspondente, sem nenhuma perda de informação.

**Consequências**

- A Phase 3 pode remover fisicamente `backups/` do repositório, via commit dedicado e isolado, conforme a Rollback Strategy de `REPOSITORY_CLEANUP_PLAN.md`, Seção 9.
- Antes da remoção física, a Phase 3 deve confirmar — como já foi confirmado nesta decisão — que o commit de remoção permanece revertível e que o conteúdo permanece acessível via histórico.
- Nenhum arquivo foi removido por esta decisão — apenas a estratégia foi definida.

**Status**

Approved

---

## Decision 003

**Título:** Legacy Application Strategy

**Contexto**

`REPOSITORY_SNAPSHOT.md` (Seções 4 e 5) e `REPOSITORY_AUDIT_REPORT.md` (Seção 4, "Repository Structure") registram a coexistência, sem relação declarada, entre a aplicação legada da raiz (`src/`, `package.json`, `vite.config.ts`, `tsconfig.json`) e o novo workspace `platform/` (`apps/web/src`, `packages/config`, `pnpm-workspace.yaml`). Este achado foi classificado como Critical pela Seção 5 do Audit Report, por deixar ambígua qual estrutura é a fonte da verdade para novo desenvolvimento.

**Alternativas Consideradas**

- **Migração completa** imediata de `src/` para `platform/apps/web/`.
- **Coexistência** formalmente declarada, com direção de migração explícita.
- **Descontinuação** da aplicação legada da raiz.

**Justificativa Técnica**

A contagem direta de arquivos mostra uma assimetria substancial de maturidade entre as duas árvores: `src/` contém 184 arquivos — uma aplicação funcional completa (dashboard, integração com Phaser, simulação de agentes, stores, providers). `platform/apps/web/src/` contém apenas 5 arquivos (`App.tsx`, `main.tsx`, `vite-env.d.ts`, `app/Application.tsx`, `app/router/ApplicationRouter.tsx`) — um scaffold inicial, sem paridade funcional com a aplicação legada. `platform/packages/config` contém apenas um `package.json`, também sem conteúdo funcional ainda.

Isso torna duas das três alternativas tecnicamente inviáveis no momento presente: **migração completa imediata** não é possível porque não há, em `platform/`, uma implementação capaz de assumir as funções de `src/` sem perda de capacidade; **descontinuação** da aplicação legada removeria a única implementação operacional existente, sem substituto funcional pronto.

Ao mesmo tempo, `platform/` já reflete deliberadamente a estrutura de monorepo e o nome do projeto (`@abp/root`, `apps/web`) alinhados à Adaptive Business Platform e aos Volumes já governados pela Documentation Constitution — que descrevem Agentes, Business Hubs e Dashboard como a arquitetura oficial a ser construída. Não existe, em nenhum documento Official ou Frozen já aprovado, qualquer indicação de que `src/` deva permanecer como destino de novo desenvolvimento.

A alternativa tecnicamente sustentável é, portanto, a **coexistência formalmente declarada**: `platform/` é reconhecido como o destino arquitetural oficial de todo novo desenvolvimento (Agentes, Business Hubs, Dashboard), enquanto `src/` permanece como aplicação legada operacional, preservada intacta até que uma migração incremental a torne desnecessária.

**Decisão Adotada**

**Coexistência formalmente declarada.** `platform/` é o destino arquitetural oficial de todo novo desenvolvimento a partir desta decisão. `src/` permanece como aplicação legada operacional, sem receber novo desenvolvimento, até que uma migração incremental — fora do escopo deste Repository Cleanup — a substitua integralmente.

**Impact**

Nenhum código de `src/` ou `platform/` é alterado por esta decisão. A partir de sua aprovação, contudo, nenhuma nova funcionalidade — incluindo Agentes, Business Hubs e Dashboard — deve ser iniciada em `src/`; todo novo desenvolvimento é direcionado a `platform/`.

**Consequências**

- A Phase 3 — Directory Cleanup não remove nem reorganiza `src/` ou `platform/`; a coexistência entre ambos é preservada como está, apenas formalmente reconhecida.
- O planejamento da migração incremental de `src/` para `platform/` é matéria de um documento de implementação futuro, fora do escopo do Repository Cleanup.
- Nenhum arquivo foi movido ou removido por esta decisão.

**Status**

Approved

---

## Decision Summary

| Decision | Título | Decisão Adotada | Status |
|---|---|---|---|
| 001 | Package Manager Strategy | pnpm adotado como único gerenciador de pacotes do repositório (raiz e `platform/`) | Approved |
| 002 | Backups Strategy | Remoção de `backups/` do repositório, com recuperabilidade garantida pelo histórico de commits já existente | Approved |
| 003 | Legacy Application Strategy | Coexistência formalmente declarada: `platform/` como destino oficial de novo desenvolvimento; `src/` mantido como aplicação legada operacional até migração incremental | Approved |

---

## Approval

**Status**

Approved

**Data**

2026-07-22

**Responsável**

Claude
