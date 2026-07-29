# Repository Snapshot

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento registra um snapshot do estado do repositório. Ele não modifica o repositório, não sugere comandos, e não executa nenhuma ação. Todo campo cujo valor ainda não tenha sido formalmente registrado permanece como placeholder, nunca preenchido por inferência.*

---

## 1. Purpose

Este documento registra o estado inicial do repositório da Adaptive Business Platform, tal como observado no momento da execução da Phase 0 — Repository Snapshot, definida em `REPOSITORY_CLEANUP_PLAN.md`, Seção 6.

Seu único propósito é servir como linha de base: um registro fiel e datado do repositório antes de qualquer alteração da Fase de Execução do Repository Cleanup, contra o qual toda mudança futura possa ser comparada, validada, ou — se necessário — revertida. Este documento não avalia, não corrige, e não propõe solução para nada do que registra; ele apenas descreve o que foi encontrado.

---

## 2. Repository Information

| Campo | Valor |
|---|---|
| Data do Snapshot | 2026-07-22 |
| Branch | `main` |
| Último Commit | `8ef13ad91adc703b6fa906dbc8ada092a3835999` — "Initial commit" |
| Estado do Git | Com alterações pendentes: 18 arquivos modificados (todos dentro de `node_modules/`) e 9 itens não rastreados (`.gitignore`, `docs/DOCUMENTATION_CONSTITUTION.md`, `docs/DOCUMENTATION_INDEX.md`, `docs/ai/AI_GOVERNANCE.md`, `docs/ai/AI_IMPLEMENTATION.md`, `docs/ai/AI_OBSERVABILITY.md`, `docs/architecture/ai/`, `docs/implementation/`, `platform/`). Branch `main` está atualizada em relação a `origin/main`. |
| Responsável pelo Snapshot | Claude |

---

## 3. Directory Structure

Estrutura principal observada na raiz do repositório, no momento do snapshot (profundidade limitada; conteúdo detalhado de cada categoria consta na Seção 4):

```
.
├── .claude/
├── .gitignore                  (não rastreado)
├── backups/
│   ├── OfficeScene-corrompido.ts
│   ├── OfficeScene-teste-phaser-ok.ts
│   ├── v0.1-dashboard-funcionando/
│   └── v0.1-phaser-corrigido/
├── dist/
│   ├── assets/
│   ├── characters/
│   ├── fonts/
│   ├── maps/
│   ├── sprites/
│   ├── tilesets/
│   └── index.html
├── docs/
│   ├── 00-VISION.md ... 11-KPIS.md   (documentação legada numerada)
│   ├── ARCHITECTURE.md, ROADMAP.md, MASTER_ROADMAP.md, CHANGELOG.md(.save)
│   ├── AI CRM
│   ├── DOCUMENTATION_CONSTITUTION.md  (não rastreado)
│   ├── DOCUMENTATION_INDEX.md         (não rastreado)
│   ├── ai/
│   ├── architecture/
│   ├── decisoes/
│   ├── implementation/                (não rastreado)
│   ├── requirements/
│   └── sprint/
├── node_modules/
├── package.json
├── package-lock.json
├── package-lock 2.json
├── patches/
│   └── phaser+3.90.0.patch
├── platform/                    (não rastreado)
│   ├── apps/web/src
│   ├── packages/config
│   ├── package.json
│   ├── pnpm-workspace.yaml
│   ├── tsconfig.base.json
│   └── tsconfig.json
├── pnpm-lock.yaml
├── public/
├── src/
│   ├── App.tsx, main.tsx, vite-env.d.ts
│   ├── components/, config/, core/, game/, hooks/, layout/, lib/,
│   │   modules/, pages/, plugin/, providers/, shared/, store/, styles/, types/
├── opensquad-dashboard@0.1.0    (arquivo vazio)
├── tsc                          (arquivo vazio)
├── tsconfig.json
├── tsconfig.tsbuildinfo
├── vite.config.ts
├── index.html
└── ._index.html, ._package.json, ... (10 arquivos AppleDouble na raiz)
```

---

## 4. Repository Inventory

### Documentation

`docs/` — 85 arquivos Markdown observados, incluindo: documentação legada numerada (`00-VISION.md` a `11-KPIS.md`, `ARCHITECTURE.md`, `ROADMAP.md`, `MASTER_ROADMAP.md`, `PLATFORM_VISION.md`, `AGENTS.md`, `CHANGELOG.md`); a documentação oficial governada pela Constitution (`DOCUMENTATION_CONSTITUTION.md`, `DOCUMENTATION_INDEX.md`, `docs/architecture/`, `docs/ai/`); e diretórios adicionais `docs/decisoes/`, `docs/requirements/`, `docs/sprint/`, `docs/implementation/`.

### Source Code

`src/` — aplicação legada da raiz do repositório: `App.tsx`, `main.tsx`, `vite-env.d.ts`, e os diretórios `components/`, `config/`, `core/`, `game/`, `hooks/`, `layout/`, `lib/`, `modules/`, `pages/`, `plugin/`, `providers/`, `shared/`, `store/`, `styles/`, `types/`.

### Platform

`platform/` — workspace observado com `apps/web/src`, `packages/config`, `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `tsconfig.json`. Coexiste com a árvore `src/` da raiz sem relação declarada entre as duas.

### Configuration

`package.json`, `tsconfig.json`, `tsconfig.tsbuildinfo`, `vite.config.ts`, `.gitignore`, `.claude/settings.local.json`, `patches/phaser+3.90.0.patch`.

### Dependencies

`node_modules/` — 115 pacotes de nível superior observados; 10.392 arquivos rastreados pelo Git dentro deste diretório. Lockfiles observados na raiz: `package-lock.json`, `package-lock 2.json`, `pnpm-lock.yaml`.

### Build Artifacts

`dist/` — 65 arquivos rastreados pelo Git, incluindo `assets/`, `characters/`, `fonts/`, `maps/`, `sprites/`, `tilesets/`, `index.html`, além de arquivos AppleDouble internos.

### Backups

`backups/` — 155 arquivos rastreados pelo Git, incluindo `OfficeScene-corrompido.ts`, `OfficeScene-teste-phaser-ok.ts`, e duas árvores de projeto quase completas: `v0.1-dashboard-funcionando/` e `v0.1-phaser-corrigido/`.

### Temporary Files

74 arquivos AppleDouble (`._*`) rastreados pelo Git, distribuídos entre a raiz, `dist/` e `public/`; dois arquivos vazios na raiz (`opensquad-dashboard@0.1.0`, `tsc`); um arquivo de backup de editor (`docs/CHANGELOG.md.save`).

---

## 5. Known Issues Observed

*Esta seção registra apenas observações verificadas no momento do snapshot. Nenhuma solução é proposta aqui — soluções pertencem exclusivamente a `REPOSITORY_CLEANUP_PLAN.md`.*

- `node_modules/` está versionado no Git (10.392 arquivos rastreados).
- `dist/` está versionado no Git (65 arquivos rastreados).
- 74 arquivos AppleDouble (`._*`) estão versionados no Git, na raiz, em `dist/` e em `public/`.
- Lockfiles duplicados e de gerenciadores de pacote distintos coexistem na raiz: `package-lock.json`, `package-lock 2.json` e `pnpm-lock.yaml`.
- `backups/` está presente e versionado (155 arquivos), incluindo duas árvores de projeto quase completas (`v0.1-dashboard-funcionando/`, `v0.1-phaser-corrigido/`).
- A aplicação legada da raiz (`src/`) e o novo workspace `platform/` coexistem sem relação declarada entre as duas.
- Dois arquivos vazios sem função reconhecida estão presentes na raiz: `opensquad-dashboard@0.1.0` e `tsc`.
- Um arquivo de backup de editor está versionado: `docs/CHANGELOG.md.save`.
- Um item de `docs/` tem nomeação fora de convenção, contendo espaço: `docs/AI CRM`.
- Documentação legada (`docs/00-VISION.md` a `docs/11-KPIS.md`, `ROADMAP.md`, `MASTER_ROADMAP.md`, `ARCHITECTURE.md`, entre outros) coexiste sem status declarado ao lado dos Volumes já governados pela Documentation Constitution (`docs/architecture/`, `docs/ai/`).
- `.gitignore` está presente no diretório de trabalho, mas ainda não está rastreado pelo Git (untracked) — portanto ainda não é efetivo em um novo clone do repositório.

---

## 6. Repository Metrics

| Métrica | Valor |
|---|---|
| Arquivos rastreados (total no Git) | 10.956 |
| Arquivos rastreados em `node_modules/` | 10.392 |
| Diretórios principais na raiz | `.claude`, `backups`, `dist`, `docs`, `node_modules`, `patches`, `platform`, `public`, `src` (9 observados) |
| Quantidade aproximada de dependências (pacotes de nível superior em `node_modules/`) | 115 |
| Artefatos de build rastreados (`dist/`) | 65 |
| Arquivos rastreados em `backups/` | 155 |
| Arquivos AppleDouble (`._*`) rastreados | 74 |
| Documentos Markdown em `docs/` | 85 |

---

## 7. Baseline Statement

Este documento, uma vez preenchido e aprovado, representa a linha de base oficial do repositório da Adaptive Business Platform imediatamente anterior à execução do Repository Cleanup descrito em `REPOSITORY_CLEANUP_PLAN.md`. Nenhuma fase de execução subsequente àquele plano é considerada válida sem que este Baseline já tenha sido registrado.

---

## 8. Approval

| Campo | Valor |
|---|---|
| Status | Approved |
| Data | 2026-07-22 |
| Responsável | Claude |
