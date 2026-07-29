# Environment Preparation Plan

**Adaptive Business Platform v1.0 · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento define o plano oficial de preparação do ambiente de desenvolvimento, decorrente das lacunas já identificadas em `DEPENDENCY_VALIDATION.md` (NOT READY), `COMPILER_VALIDATION.md` (READY WITH OBSERVATIONS), e `BUILD_VALIDATION.md` (READY WITH OBSERVATIONS). Nenhum código foi alterado. Nenhuma arquitetura foi modificada. Nenhuma dependência foi instalada. Nenhum `package.json` foi modificado. Nenhum `pnpm install` foi executado.*

---

## 1. Objetivo

Planejar, em ordem executável e com critérios de conclusão verificáveis, a preparação completa do ambiente de desenvolvimento da workspace `platform/` — cobrindo instalação de ferramentas, estratégia de versionamento, regularização de dependências e de estrutura, instalação da workspace, e separação operacional em relação ao projeto legado da raiz do repositório —, de modo que uma futura reexecução de `DEPENDENCY_VALIDATION.md` produza parecer READY.

---

## 2. Base de Evidência

| Lacuna | Fonte | Severidade |
|---|---|---|
| Nenhum executável de Node.js, pnpm, npm, ou corepack disponível na sessão de auditoria | `DEPENDENCY_VALIDATION.md`, Seção 3.1 | Alta |
| Nenhum dos 13 pacotes de biblioteca declara `dependencies`/`devDependencies` — campo inteiramente ausente, não apenas `typescript` | `DEPENDENCY_VALIDATION.md`, Seção 3.2; `COMPILER_VALIDATION.md`, Seção 3.1 | Alta |
| `platform/` nunca instalada — sem `node_modules/`, sem `pnpm-lock.yaml` | `DEPENDENCY_VALIDATION.md`, Seção 3.3 | Alta |
| Dois projetos Node.js distintos coexistem na raiz do repositório sem relação de workspace (`opensquad-dashboard` vs. `platform/`) | `DEPENDENCY_VALIDATION.md`, Seção 3.4 | Média |
| `@abp/config` incompleto e órfão, já decidido para Remoção em `GOVERNANCE_REGULARIZATION.md`, Decisão 6, mas não executado | `BUILD_VALIDATION.md`, Seção 3.3; `COMPILER_VALIDATION.md`, Seção 3.2 | Baixa |
| `platform/pnpm-workspace.yaml` declara o glob `services/*` sem diretório correspondente | `COMPILER_VALIDATION.md`, Seção 3.4; `DEPENDENCY_VALIDATION.md`, Seção 3.5 | Baixa |
| Nenhum ponto de agregação de exports (`index.ts`), nenhum `.npmrc`, nenhum `.nvmrc`, nenhum workflow de CI documentando o processo de instalação | `COMPILER_VALIDATION.md`, Seção 3.3; `DEPENDENCY_VALIDATION.md`, Seção 3.6 | Baixa/Informativa |

---

## 3. Plano de Preparação

### Fase 1 — Ferramentas de Sistema

**1.1 Instalação do Node.js**

Instalar Node.js na versão ≥ 20, consistente com `engines.node` já declarado em `platform/package.json` e em `platform/apps/web/package.json`. Duas vias possíveis, decisão recomendada abaixo:

| Via | Descrição | Recomendação |
|---|---|---|
| Instalador oficial (nodejs.org, LTS) | Instalação única, direta, sem gerenciamento de múltiplas versões | Adequada se este ambiente hospedar apenas este repositório |
| Gerenciador de versão (`nvm-windows`, `volta`, ou `fnm`) | Permite fixar e alternar versões por projeto, incluindo suporte a `.nvmrc`/`engines` | **Recomendado** — o repositório já hospeda dois projetos Node.js distintos (`opensquad-dashboard` na raiz e `platform/`); um gerenciador de versão reduz o risco de divergência futura entre eles |

**1.2 Estratégia de Gerenciamento de Versões**

- Adotar **Corepack** (distribuído com o próprio Node.js ≥ 16.9) como mecanismo de provisionamento do pnpm, honrando o pin já existente em `platform/package.json`: `"packageManager": "pnpm@11.15.1"`. Corepack elimina a necessidade de instalar o pnpm manualmente ou de depender de uma versão global divergente.
- Registrar formalmente (ação de documentação, fora do escopo de execução desta etapa) que `platform/package.json` é a única fonte de verdade sobre a versão exata do pnpm exigida — nenhuma outra fixação de versão é necessária.
- Não é necessário nenhum arquivo `.nvmrc` adicional além do já existente `engines.node` — suficiente para qualquer gerenciador de versão de Node já recomendado no item 1.1, desde que o operador o consulte manualmente ou via plugin do gerenciador escolhido.

**1.3 Habilitação do pnpm via Corepack**

Após 1.1 e 1.2, habilitar Corepack e provisionar a versão de pnpm já pinada. Este passo não requer nenhuma decisão adicional — a versão exata já está declarada em `platform/package.json`.

---

### Fase 2 — Regularização de Dependências e de Estrutura

**2.1 Declaração de Dependências Compartilhadas (`typescript`)**

`DEPENDENCY_VALIDATION.md`, Seção 3.2, confirmou que nenhum dos 13 pacotes de biblioteca declara `typescript`. Duas estratégias possíveis:

| Estratégia | Descrição | Recomendação |
|---|---|---|
| Declaração individual | Adicionar `"typescript": "^5.x"` ao `devDependencies` de cada um dos 13 `package.json` | Simples, mas replica a mesma versão 13 vezes, com risco de divergência em atualizações futuras |
| **Catálogo do pnpm workspace (`catalog:`)** | Declarar uma única entrada `typescript` em `catalog:` dentro de `platform/pnpm-workspace.yaml`, e referenciá-la como `"typescript": "catalog:"` em cada `package.json` | **Recomendado** — recurso nativo do pnpm (disponível na versão 11.15.1 já pinada), mantém uma única fonte de verdade de versão para os 13 pacotes, consistente com a disciplina de "fonte única de verdade" já aplicada em toda a governança documental desta plataforma |

A versão exata de `typescript` a ser fixada deve ser compatível com a já usada por `platform/apps/web/package.json` (`^5.8.3`), preservando consistência de comportamento de compilador entre o App Shell e os 13 pacotes de biblioteca.

Nenhuma edição de `package.json` ou de `pnpm-workspace.yaml` é realizada por este plano — a estratégia é decidida e documentada aqui; sua aplicação é ação de execução distinta e futura (Restrição explícita desta etapa).

**2.2 Revisão de `platform/pnpm-workspace.yaml`**

Remover o glob `services/*`, já identificado como órfão em `COMPILER_VALIDATION.md`, Seção 3.4, e em `DEPENDENCY_VALIDATION.md`, Seção 3.5 — nenhum diretório `platform/services/` existe, e nenhuma arquitetura já aprovada prevê sua criação (`PACKAGE_STRUCTURE_MANIFEST.md`, mesmo já regularizado por `GOVERNANCE_REGULARIZATION.md`, não lista "Services" entre os dez agrupamentos). Resultado esperado após a revisão: `packages: ["apps/*", "packages/*"]`.

**2.3 Remoção do Pacote `@abp/config`**

Executar a Decisão 6 já registrada em `GOVERNANCE_REGULARIZATION.md`: remoção física de `platform/packages/config/`. Esta atividade é sequenciada nesta Fase 2 — antes da instalação da workspace (Fase 3) — para que o `pnpm install` subsequente já opere sobre uma estrutura de pacotes regularizada, sem necessidade de reinstalação posterior.

**2.4 Separação Operacional entre o Projeto Legado e a Workspace `platform/`**

`DEPENDENCY_VALIDATION.md`, Seção 3.4, identificou risco de confusão operacional entre o projeto legado da raiz do repositório (`opensquad-dashboard`) e a workspace `platform/`, dado que ambos coexistem sem relação de workspace pnpm entre si. Ação planejada: documentar formalmente — em local a decidir por uma ação de governança distinta (ex.: `README.md` da raiz do repositório, ou um novo documento de onboarding) — que:

- Todo comando de instalação, build, ou typecheck da Adaptive Business Platform deve ser executado a partir de `platform/`, nunca a partir da raiz do repositório.
- A raiz do repositório hospeda um segundo projeto Node.js, não relacionado, com seu próprio ciclo de dependências.
- Nenhuma ação desta Fase 2 opera sobre o projeto legado — permanece inteiramente fora do escopo deste plano.

---

### Fase 3 — Instalação da Workspace

**3.1 Execução do `pnpm install`**

Uma vez concluídas as Fases 1 e 2, executar `pnpm install` a partir de `platform/`. Esta execução real está explicitamente fora do escopo desta etapa ("Não instalar dependências", "Não executar pnpm install") — planejada aqui, executada em ação futura distinta.

**3.2 Geração e Verificação do Lockfile**

Resultado esperado da instalação: criação de `platform/pnpm-lock.yaml` e de `platform/node_modules/` (estrutura não-hoisted, padrão do pnpm), com resolução bem-sucedida de `typescript` (Fase 2.1) para os 13 pacotes de biblioteca e para `platform/apps/web`. Verificação de conclusão: o lockfile deve referenciar exatamente os projetos ativos remanescentes após a Fase 2.3 (13 pacotes de biblioteca menos `@abp/config`, mais `apps/web`).

---

### Fase 4 — Verificação de Prontidão

**4.1 Reexecução da Dependency Validation**

Após a conclusão das Fases 1 a 3, reexecutar `DEPENDENCY_VALIDATION.md` como nova auditoria, verificando especificamente a reversão de cada Não Conformidade já registrada em sua versão anterior (Seção 3.1 a 3.6 daquele documento).

**4.2 Critérios de Conclusão** — ver Seção 5 abaixo.

---

## 4. Ordem Recomendada das Atividades

```
Fase 1 — Ferramentas de Sistema
  1.1 Instalar Node.js ≥ 20
        │
        ▼
  1.2 Definir estratégia de versionamento (Corepack + engines.node)
        │
        ▼
  1.3 Habilitar Corepack e provisionar pnpm 11.15.1
        │
        ▼
Fase 2 — Regularização de Dependências e Estrutura (paralelizável entre si)
  2.1 Declarar typescript (catalog: recomendado)   2.2 Revisar pnpm-workspace.yaml (remover services/*)
  2.3 Remover @abp/config                          2.4 Documentar separação legado ↔ platform/
        │                         │                         │                         │
        └─────────────────────────┴────────────┬────────────┴─────────────────────────┘
                                                 ▼
Fase 3 — Instalação da Workspace
  3.1 Executar pnpm install a partir de platform/
        │
        ▼
  3.2 Verificar geração do lockfile e resolução completa
        │
        ▼
Fase 4 — Verificação de Prontidão
  4.1 Reexecutar Dependency Validation
        │
        ▼
  4.2 Confirmar Critérios de Conclusão (Seção 5)
```

A Fase 1 é estritamente sequencial e bloqueante para todas as demais — nenhuma instalação real pode ocorrer sem Node.js e pnpm disponíveis. Os quatro itens da Fase 2 não possuem dependência real entre si (mesma distinção já aplicada em toda esta série entre sequenciamento de governança e dependência estrutural real) e podem ser decididos/documentados em qualquer ordem interna, mas todos devem estar concluídos antes da Fase 3, para que a instalação já opere sobre uma estrutura e uma declaração de dependência regularizadas, evitando uma segunda rodada de instalação.

---

## 5. Critérios de Conclusão (Definition of Ready do Ambiente)

O ambiente é considerado pronto quando todos os itens abaixo forem verificáveis, mesma disciplina de checklist explícito já usada em toda auditoria anterior desta série:

- `node --version` e `pnpm --version` resolvem com sucesso, com Node ≥ 20 e pnpm 11.15.1 (ou a versão então pinada em `platform/package.json`).
- Todo pacote de `platform/packages/` (após a remoção de `@abp/config`) e `platform/apps/web` declara `typescript` resolvível, seja individualmente, seja via `catalog:`.
- `platform/node_modules/` e `platform/pnpm-lock.yaml` existem e são consistentes com `platform/pnpm-workspace.yaml`.
- `platform/pnpm-workspace.yaml` não contém glob órfão sem diretório correspondente.
- `platform/packages/config/` não existe mais.
- A separação operacional entre o projeto legado da raiz e a workspace `platform/` está documentada em local acessível a qualquer operador futuro.
- Uma reexecução de `DEPENDENCY_VALIDATION.md` produz parecer **READY** (ou, no mínimo, READY WITH OBSERVATIONS restrito a itens não cobertos por este plano, como a definição futura de `exports`/`index.ts` por pacote, já identificada como fora de escopo em `COMPILER_VALIDATION.md`, Seção 3.3).

---

## 6. Confirmação

Nenhuma alteração foi realizada por este plano. Nenhum código foi alterado. Nenhuma arquitetura foi modificada. Nenhuma dependência foi instalada. Nenhum `package.json` foi modificado. Nenhum `pnpm install` foi executado. A Integration Validation não foi iniciada.

---

## Approval

| Campo | Valor |
|---|---|
| Status | ENVIRONMENT PREPARATION PLAN DEFINED |
| Version | 1.0 |
| Author | Claude |
