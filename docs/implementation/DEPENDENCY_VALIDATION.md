# Dependency Validation

**Adaptive Business Platform v1.0 · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento avalia a prontidão do ambiente de desenvolvimento e das dependências necessárias para compilação e execução do monorepo `platform/`. Nenhuma dependência foi instalada. Nenhum `package.json` foi modificado. Nenhum `pnpm install` foi executado. Nenhum problema encontrado foi corrigido.*

---

## 1. Resumo Executivo

Esta auditoria verificou, por inspeção direta e por tentativa de invocação real de ferramenta (não apenas leitura de arquivo), a disponibilidade do ambiente de build em duas frentes: o ambiente de execução (Node.js, pnpm, npm, corepack) e a declaração de dependências dos 14 projetos ativos da workspace `platform/`. Nenhuma das duas frentes está pronta hoje: **nenhum executável de Node.js, pnpm, npm, ou corepack está disponível nesta sessão** (verificado por tentativa direta de invocação, tanto via Bash quanto via PowerShell — ambos os shells retornam "comando não encontrado"), e **nenhum dos 13 pacotes de biblioteca de `platform/packages/` declara qualquer campo `dependencies` ou `devDependencies`** — não apenas `typescript` especificamente, já identificado em `COMPILER_VALIDATION.md`, mas a ausência total do campo. Não existe `platform/node_modules/` nem `platform/pnpm-lock.yaml` — a workspace nunca foi instalada. Um segundo projeto Node.js, inteiramente distinto e não relacionado — `opensquad-dashboard`, na raiz do repositório — possui seu próprio `node_modules/` e `pnpm-lock.yaml`, mas não tem nenhuma relação de workspace com `platform/` (nenhum `pnpm-workspace.yaml` existe na raiz do repositório) e não supre nenhuma dependência da plataforma.

---

## 2. Verificação dos Itens do Escopo

| # | Item auditado | Resultado |
|---|---|---|
| 1 | `devDependencies` e `dependencies` dos packages | ✗ — nenhum dos 13 pacotes de `platform/packages/` declara qualquer um dos dois campos; apenas `platform/apps/web/package.json` os declara (`dependencies`: react, react-dom, react-router-dom; `devDependencies`: typescript e ferramental de lint/build) |
| 2 | Disponibilidade do TypeScript | ✗ — `typescript` só está declarado em `platform/apps/web/package.json`; nenhum pacote de biblioteca, nem `platform/package.json` (raiz da workspace), o declara |
| 3 | Configuração do pnpm workspace | ✓ com observação — `platform/pnpm-workspace.yaml` declara três globs (`apps/*`, `services/*`, `packages/*`); `services/*` não corresponde a nenhum diretório existente (já registrado em `COMPILER_VALIDATION.md`, Seção 3.4) |
| 4 | Consistência do `pnpm-workspace.yaml` | ✓ com a mesma observação do item 3 — sintaxe válida, glob órfão não impede resolução, apenas não encontra pacotes |
| 5 | Package manager | ✓ declarado, ✗ indisponível — `platform/package.json` fixa `"packageManager": "pnpm@11.15.1"` (boa prática, compatível com Corepack); nenhum `pnpm`, `npm`, ou `corepack` está instalado nesta sessão para honrar esse pin |
| 6 | Lockfiles | ✗ para `platform/` — nenhum `platform/pnpm-lock.yaml` existe; ✓ para o projeto legado — `pnpm-lock.yaml` existe na raiz do repositório, mas pertence exclusivamente a `opensquad-dashboard`, projeto distinto sem relação de workspace com `platform/` |
| 7 | `node_modules` | ✗ para `platform/` — nenhum `platform/node_modules/` existe, e nenhum pacote individual possui seu próprio `node_modules/`; ✓ existe na raiz do repositório, mas exclusivo do projeto `opensquad-dashboard` |
| 8 | Resolução de dependências | ✗ — impossível avaliar resolução real sem package manager disponível; por inspeção estática, mesmo que disponível, a resolução falharia para os 13 pacotes de biblioteca por ausência total de dependências declaradas |
| 9 | Preparação para execução de `tsc -b` | ✗ — nenhum `tsc` resolvível hoje para nenhum pacote de biblioteca; `platform/apps/web` é o único projeto com `typescript` declarado, mas ainda depende de instalação real, não realizada |
| 10 | Preparação para instalação completa do workspace | ✗ — nenhum `.npmrc` (nem na raiz do repositório, nem em `platform/`) documenta configuração de instalação; nenhum workflow de CI (`.github/workflows/`) documenta o processo esperado; nenhum `.nvmrc` fixa a versão de Node.js além da faixa já declarada em `engines` |

---

## 3. Não Conformidades

### 3.1 Ambiente de execução completamente indisponível nesta sessão (Severidade: Alta — bloqueante para qualquer instalação ou build real)

Tentativa direta de invocação, tanto via Bash quanto via PowerShell, confirma: `node`, `pnpm`, `npm`, e `corepack` não são reconhecidos como comando em nenhum dos dois shells desta sessão. Esta é uma condição do ambiente de execução, não do repositório em si — mas impede, hoje, qualquer instalação real, independentemente do estado dos arquivos de configuração.

### 3.2 Nenhum dos 13 pacotes de biblioteca declara `dependencies` ou `devDependencies` (Severidade: Alta)

Mais amplo do que o já registrado em `COMPILER_VALIDATION.md`, Seção 3.1 (que identificou especificamente a ausência de `typescript`): nenhum `package.json` de `platform/packages/*` possui sequer o campo `dependencies` ou `devDependencies`, vazio ou preenchido. `platform/package.json` (raiz da workspace) também não declara nenhum dos dois campos. Isso significa que, mesmo com pnpm disponível e a workspace instalada, `tsc -b` continuaria irresolvível para os 13 pacotes de biblioteca sem que ao menos um deles (ou a raiz) passe a declarar `typescript`.

### 3.3 Workspace `platform/` nunca instalada (Severidade: Alta, decorrente das duas anteriores)

Ausência confirmada de `platform/node_modules/` e de `platform/pnpm-lock.yaml`. Nenhum registro de instalação prévia bem-sucedida.

### 3.4 Dois projetos Node.js distintos coexistem na mesma árvore do repositório sem relação de workspace (Severidade: Informativa, risco de confusão operacional)

A raiz do repositório contém `package.json` (`opensquad-dashboard`), `pnpm-lock.yaml`, e `node_modules/` de um projeto React/Vite/Phaser/Pixi inteiramente distinto — já identificado em memória de sessões anteriores como o "escritório" legado (`src/`), não relacionado à Adaptive Business Platform em `platform/`. Não existe `pnpm-workspace.yaml` na raiz do repositório — logo os dois projetos não formam uma workspace pnpm única, e a instalação de um nunca supre a dependência do outro. Um operador que execute `pnpm install` a partir da raiz do repositório instalaria apenas o projeto legado, deixando `platform/` intocado — risco real de confusão operacional já que ambos residem no mesmo repositório Git.

### 3.5 `services/*` em `platform/pnpm-workspace.yaml` sem diretório correspondente (Severidade: Baixa, já registrada em `COMPILER_VALIDATION.md`)

Reconfirmado nesta auditoria pela mesma evidência.

### 3.6 Nenhuma documentação de processo de instalação (Severidade: Baixa)

Nenhum `.npmrc`, nenhum `.nvmrc`, nenhum workflow de CI em `.github/workflows/` documenta o processo de instalação esperado para `platform/`. `engines.node: ">=20.0.0"` está declarado em `platform/package.json` e em `platform/apps/web/package.json`, mas em nenhum dos 13 pacotes de biblioteca — informativo, já que `engines` de workspace geralmente é herdado na prática pnpm, mas não formalmente redundante nos subpacotes.

---

## 4. Riscos Técnicos

| Risco | Severidade | Observação |
|---|---|---|
| Nenhuma instalação real pode ser tentada nesta sessão — ambiente sem Node.js/pnpm/npm/corepack | Alta | Condição do ambiente de execução, fora do controle deste repositório; requer ambiente externo com essas ferramentas disponíveis |
| Mesmo em ambiente com ferramentas disponíveis, a instalação de `platform/` resolveria zero dependências reais para os 13 pacotes de biblioteca, dado o campo `dependencies`/`devDependencies` inteiramente ausente | Alta | Consistente com o já registrado em `COMPILER_VALIDATION.md`; nenhuma correção aplicada por este documento, por Restrição explícita |
| Confusão operacional entre o projeto legado da raiz do repositório e a workspace `platform/` — um `pnpm install`/`npm install` executado no diretório errado não produz o efeito esperado | Média | Mitigável apenas por disciplina operacional ou por documentação explícita de "sempre instalar a partir de `platform/`", ainda inexistente |
| Ausência de `.npmrc`/CI documentando o processo de instalação — qualquer nova pessoa ou automação precisa inferir o processo apenas a partir de `package.json` e `pnpm-workspace.yaml` | Baixa | Não bloqueante; recomendável para uma etapa futura de preparação de ambiente |
| `services/*` órfão em `pnpm-workspace.yaml` | Baixa | Já registrada; nenhum efeito funcional |

---

## 5. Pendências

- Disponibilizar Node.js ≥ 20, pnpm 11.15.1 (ou via Corepack), em um ambiente capaz de executar instalação real — pré-requisito de qualquer ação subsequente.
- Declarar `typescript` como `devDependency` resolvível para os 13 pacotes de biblioteca, ou centralizá-lo na raiz de `platform/package.json` — já identificada em `COMPILER_VALIDATION.md`, reconfirmada e aprofundada aqui (ausência total do campo, não apenas de `typescript`).
- Executar `pnpm install` a partir de `platform/` uma vez que o ambiente e as dependências estejam declarados — ação explicitamente não realizada por esta auditoria.
- Documentar, formalmente, a distinção entre o projeto legado da raiz do repositório e a workspace `platform/`, para evitar instalação no diretório errado.
- Corrigir ou remover o glob `services/*` de `platform/pnpm-workspace.yaml`.
- Pendências já herdadas, não afetadas por esta auditoria: execução das Decisões de `GOVERNANCE_REGULARIZATION.md` (amendments a `PACKAGE_STRUCTURE_MANIFEST.md`, `SCOPE_FREEZE_V1.md`, `DOCUMENTATION_INDEX.md`; remoção de `@abp/config`); `GROWTH_HUB.md` permanece Draft.

---

## 6. Checklist Final

| Item | Resultado |
|---|---|
| `devDependencies`/`dependencies` dos packages | ✗ — ausentes em 13/14 projetos |
| Disponibilidade do TypeScript | ✗ — apenas em `@abp/web` |
| Configuração do pnpm workspace | ✓ com observação |
| Consistência do `pnpm-workspace.yaml` | ✓ com observação |
| Package manager | ✓ declarado / ✗ indisponível na sessão |
| Lockfiles | ✗ para `platform/`; ✓ apenas para projeto não relacionado |
| `node_modules` | ✗ para `platform/`; ✓ apenas para projeto não relacionado |
| Resolução de dependências | ✗ |
| Preparação para `tsc -b` | ✗ |
| Preparação para instalação completa do workspace | ✗ |
| Não conformidades | 6 identificadas — 3 Alta, 1 Média/Informativa, 2 Baixa |
| Riscos técnicos | 5 identificados |
| Pendências | 6 identificadas |

---

## 7. Parecer

**NOT READY**

Diferente de `COMPILER_VALIDATION.md` (READY WITH OBSERVATIONS), que avaliou a solidez estrutural do código sob a ótica de tipos, referências e topologia — e concluiu, corretamente, que os 353 arquivos são fortes candidatos a compilar sem erro —, esta auditoria avalia uma pergunta diferente: se o ambiente e as dependências estão prontos para essa compilação acontecer hoje. Não estão: nenhuma ferramenta de execução está disponível nesta sessão, e nenhum dos 13 pacotes de biblioteca declara qualquer dependência, incluindo `typescript`. Nenhuma das pendências desta auditoria é de natureza arquitetural — todas são de preparação de ambiente e de declaração de dependência, resolvíveis sem nenhuma alteração de arquitetura, de contrato, ou de componente. O parecer NOT READY reflete o estado real e verificado do ambiente nesta sessão, não um defeito estrutural da plataforma.

---

## 8. Confirmação

Nenhuma dependência foi instalada. Nenhum `package.json` foi modificado. Nenhum `pnpm install` foi executado. Nenhum problema encontrado foi corrigido. A Integration Validation não foi iniciada.

---

## Approval

| Campo | Valor |
|---|---|
| Status | NOT READY |
| Version | 1.0 |
| Author | Claude |
