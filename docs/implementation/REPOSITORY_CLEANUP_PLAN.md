# Repository Cleanup Plan

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento não executa nenhuma limpeza, não cria nenhum comando, e não altera nenhum arquivo existente do repositório. Ele documenta, exclusivamente, o plano oficial segundo o qual a limpeza será conduzida em uma fase de execução posterior e formalmente aprovada.*

---

## 1. Purpose

Este documento define o plano oficial de limpeza, organização e estabilização do repositório da Adaptive Business Platform, previamente ao início da Fase 1 de desenvolvimento — a construção dos Agentes, dos Business Hubs e do Dashboard.

A razão de existir deste plano é estrutural, não cosmética. O repositório, em seu estado atual, mistura três camadas que precisam ser distinguidas antes que qualquer nova implementação comece: (1) artefatos de build e dependências que nunca deveriam ter sido versionados; (2) cópias históricas e experimentais de versões anteriores do projeto, mantidas dentro do próprio repositório em vez de em um sistema de controle de versão que já cumpre esse papel; e (3) a documentação arquitetural oficial, recém-formalizada pela Documentation Constitution, que ainda coexiste com documentação legada não governada por ela.

Prosseguir com a construção de Agentes, Hubs e Dashboard sobre um repositório nessas condições comprometeria a Fase 1 antes que ela comece: cada novo commit aumentaria o peso de artefatos que não deveriam existir, cada nova busca de código correria o risco de encontrar uma cópia obsoleta em vez da fonte real, e a fronteira entre "o que é fonte da verdade" e "o que é histórico" permaneceria ambígua. Este plano existe para eliminar essa ambiguidade antes que ela se torne dívida técnica estrutural.

Este documento é, deliberadamente, um plano — não uma execução. Ele responde a uma pergunta apenas: *o que precisa acontecer, em que ordem, e com quais critérios de sucesso*, deixando a execução literal (comandos, scripts, commits) inteiramente para a fase de execução, que seguirá este plano como sua única fonte de autoridade.

---

## 2. Current Repository Assessment

Esta seção descreve, sem executar nenhuma ação, o estado observado do repositório no momento em que este plano foi redigido. Cada item abaixo é uma observação factual, não uma decisão de remoção — decisões de remoção pertencem à Fase de Execução (Seção 6).

### 2.1 Controle de versão e dependências

- **`node_modules/` está versionado no Git.** Aproximadamente 10.400 arquivos rastreados pertencem a `node_modules/`, incluindo binários de ferramentas (`esbuild`, `tsc`, `vite`, `rollup`, entre outros) que aparecem como modificados a cada instalação de dependências, gerando ruído permanente no `git status`.
- **`dist/` (saída de build) está versionado no Git.** A pasta de build do Vite, incluindo assets compilados e arquivos estáticos, está rastreada como se fosse código-fonte.
- **Um `.gitignore` foi recentemente adicionado**, cobrindo `node_modules/`, `dist/`, `build/`, variáveis de ambiente, caches e arquivos temporários. Este arquivo ainda não está commitado e, mesmo quando commitado, não removerá retroativamente os arquivos que já estão rastreados — isso exige uma ação explícita de destracking, que pertence à Fase de Execução.

### 2.2 Arquivos duplicados e órfãos

- **Lockfiles duplicados e de gerenciadores de pacote conflitantes.** Coexistem, na raiz do repositório, `package-lock.json`, `package-lock 2.json` e `pnpm-lock.yaml` — dois lockfiles do npm (um deles claramente uma cópia acidental, indicado pelo sufixo " 2") e um lockfile do pnpm, sugerindo incerteza sobre qual gerenciador de pacotes é a fonte da verdade.
- **Arquivos de metadado do macOS (AppleDouble) versionados.** Dez arquivos com prefixo `._` (por exemplo `._package.json`, `._index.html`, `._src`) estão rastreados na raiz do repositório, e o mesmo padrão se repete dentro de `dist/` (em `characters/`, `fonts/`, `maps/`, `sprites/`, `tilesets/`). Esses arquivos não têm função no projeto; são artefatos do sistema operacional.
- **Arquivos órfãos sem extensão ou conteúdo.** Os arquivos `opensquad-dashboard@0.1.0` e `tsc`, na raiz do repositório, estão vazios e não correspondem a nenhuma convenção reconhecida de configuração ou build.
- **Um arquivo de backup de editor versionado.** `docs/CHANGELOG.md.save` coexiste com `docs/CHANGELOG.md`.

### 2.3 Estrutura duplicada de projeto

- **Duas árvores de projeto completas dentro de `backups/`.** O diretório `backups/` contém `v0.1-dashboard-funcionando/` e `v0.1-phaser-corrigido/`, cada uma uma cópia quase integral de uma versão anterior da aplicação (componentes, core, game, hooks, stores, configuração — dezenas de arquivos cada). Essas cópias estão versionadas em sua totalidade, quando o histórico do Git já é o mecanismo apropriado para preservar versões anteriores.
- **Dois arranjos de projeto coexistindo na raiz.** A aplicação legada (`src/`, `public/`, `package.json`, `vite.config.ts`, `tsconfig.json`) e um novo diretório `platform/` — que já contém sua própria estrutura de monorepo (`apps/`, `packages/`, `pnpm-workspace.yaml`, `tsconfig.base.json`) — existem simultaneamente na raiz do repositório, sem que a relação entre os dois esteja documentada.

### 2.4 Documentação

- **Documentação legada e documentação governada pela Constitution coexistem sem relação declarada.** A raiz de `docs/` mantém documentos numerados de uma convenção anterior (`00-VISION.md` até `11-KPIS.md`, `ARCHITECTURE.md`, `ROADMAP.md`, `MASTER_ROADMAP.md`, entre outros) ao lado da nova estrutura de Volumes formalizada por `DOCUMENTATION_CONSTITUTION.md` e `DOCUMENTATION_INDEX.md` (`docs/architecture/`, `docs/ai/`). Nenhum desses documentos legados declara status segundo a Constitution (Seção 8), nem sua relação de sucessão ou coexistência com os Volumes oficiais.
- **Nomeação inconsistente.** Um item em `docs/` contém espaço no nome (`docs/AI CRM`), fora da convenção adotada pelo restante da série documental.
- **Possível sobreposição temática não resolvida.** Pares como `ROADMAP.md` / `MASTER_ROADMAP.md` e `02-ARQUITETURA.md` / `02-SYSTEM_ARCHITECTURE.md` / `ARCHITECTURE.md` sugerem conteúdo sobreposto entre a documentação legada e a documentação oficial, sem que este plano determine, nesta fase, qual versão prevalece.

Nenhuma das observações acima foi corrigida como parte da redação deste documento. Toda ação de remoção, consolidação ou reorganização está descrita apenas em plano, nas Seções 6 e 7.

---

## 3. Cleanup Objectives

1. **Restaurar o Git como fonte única de histórico.** Nenhum artefato de build, dependência instalada, ou cópia manual de versão anterior deve permanecer rastreado como código-fonte.
2. **Eliminar duplicação e ambiguidade de arquivos.** Cada arquivo relevante deve existir em exatamente um lugar, com um propósito inequívoco — alinhado ao Princípio de Single Source of Truth já estabelecido pela Documentation Constitution (Seção 3, Princípio 1).
3. **Tornar explícita a relação entre estruturas de projeto coexistentes.** A relação entre a aplicação legada na raiz e o novo diretório `platform/` deve ser esclarecida antes que novo desenvolvimento comece em qualquer uma delas.
4. **Tornar explícita a relação entre documentação legada e documentação oficial.** Nenhum documento deve permanecer em estado ambíguo quanto à sua vigência frente aos Volumes já governados pela Constitution.
5. **Estabilizar o repositório para a Fase 1.** Ao final da limpeza, o repositório deve oferecer uma base previsível, auditável e livre de ruído sobre a qual Agentes, Business Hubs e Dashboard possam ser construídos sem herdar ambiguidade estrutural.
6. **Preservar integralmente o histórico e a documentação aprovada.** Nenhum objetivo desta limpeza inclui a perda de informação — apenas sua reorganização, consolidação ou remoção deliberada e revisável (Seção 9).

---

## 4. Cleanup Scope

A limpeza abrange exclusivamente as seguintes dimensões:

- **Git** — arquivos indevidamente rastreados (`node_modules/`, `dist/`, artefatos de sistema operacional), efetivação do `.gitignore`, e higiene geral do histórico de arquivos rastreados.
- **Estrutura** — a relação entre a aplicação legada da raiz e o diretório `platform/`; a organização de `backups/` frente ao histórico do Git.
- **Arquivos temporários e órfãos** — arquivos `._*`, arquivos vazios sem função reconhecida, arquivos de backup de editor (`.save`).
- **Dependências** — consolidação em torno de um único gerenciador de pacotes e um único lockfile por projeto.
- **Organização da documentação não governada** — classificação da documentação legada de `docs/` frente aos Volumes oficiais já existentes (sem alterar os próprios Volumes — ver Seção 5).

---

## 5. Out of Scope

Os itens abaixo não são afetados por este plano, sob nenhuma circunstância:

- **Código-fonte da aplicação** (`src/`, `platform/apps/`, `platform/packages/`) — nenhuma lógica de negócio, componente ou módulo é alterado.
- **Documentação já aprovada segundo a Documentation Constitution** — todo documento em status Official ou Frozen (Constitution, Seção 8), listado em `DOCUMENTATION_INDEX.md`, Seção 7.2.
- **A Documentation Constitution** (`docs/DOCUMENTATION_CONSTITUTION.md`).
- **O Documentation Index** (`docs/DOCUMENTATION_INDEX.md`).
- **Volume I — Architecture Handbook** e **Volume II — Intelligent Agent Architecture**, e todos os documentos que os compõem.
- **Decisões arquiteturais já registradas** (`docs/decisoes/`, `docs/architecture/ADR_INDEX.md`).
- **Qualquer decisão de produto, roadmap ou escopo de negócio** — este plano é puramente estrutural e não reavalia prioridades de produto.

Este plano não redefine arquitetura, não propõe nenhuma capacidade nova, e não reinterpreta nenhuma decisão já registrada sob a Constitution.

---

## 6. Execution Phases

As fases abaixo descrevem a ordem e o propósito de cada etapa da execução. Nenhuma fase é executada pela redação deste documento; a execução real é conduzida separadamente, sob aprovação, seguindo este plano como referência.

### Phase 0 — Repository Snapshot

Registro do estado atual do repositório, antes de qualquer alteração, servindo exclusivamente como linha de base para comparação, validação e rollback. Esta fase inclui apenas atividades de documentação e inventário — nenhuma modificação é executada:

- registro da branch atual;
- registro do último commit;
- registro do status do Git;
- registro da estrutura principal de diretórios;
- registro do inventário inicial dos principais componentes do repositório.

### Phase 1 — Repository Audit

Levantamento completo e definitivo de tudo o que está rastreado no Git, mas não deveria estar; de toda duplicação de arquivos, lockfiles e estruturas de projeto; e de toda documentação não classificada frente à Constitution. O produto desta fase é uma lista de decisão — o que remover, o que consolidar, o que manter — revisada antes de qualquer ação da Fase 2.

### Phase 2 — Git Cleanup

Efetivação do `.gitignore`, remoção do rastreamento (não necessariamente do disco) de artefatos indevidamente versionados — `node_modules/`, `dist/`, arquivos `._*` — e consolidação em torno de um único lockfile e gerenciador de pacotes por projeto. Esta fase também decide, formalmente, o destino do histórico contido em `backups/`.

### Phase 3 — Directory Cleanup

Reorganização física dos diretórios: resolução da coexistência entre a aplicação legada da raiz e `platform/`; remoção de arquivos órfãos, vazios e de backup de editor; padronização de nomes fora de convenção (como `docs/AI CRM`).

### Phase 4 — Repository Stabilization

Classificação de cada documento legado de `docs/` frente à Constitution — como Draft, como candidato à consolidação com um Volume existente, ou como Deprecated — sem alterar o conteúdo de nenhum documento já Official ou Frozen. Verificação de que nenhuma referência quebrada (links internos, imports de código) foi introduzida pelas fases anteriores.

### Phase 5 — Validation

Execução do checklist de validação (Seção 7) e confirmação formal de que o repositório está pronto para o início da Fase 1 de desenvolvimento.

---

## 7. Validation Checklist

- [ ] `node_modules/` não está mais rastreado pelo Git.
- [ ] `dist/` não está mais rastreado pelo Git.
- [ ] Nenhum arquivo `._*` (AppleDouble) permanece rastreado, na raiz ou em qualquer subdiretório.
- [ ] `.gitignore` está commitado e cobre dependências, build, ambiente, cache e arquivos temporários.
- [ ] Existe exatamente um lockfile, correspondente a exatamente um gerenciador de pacotes, por projeto.
- [ ] Nenhum arquivo vazio ou órfão sem função reconhecida permanece na raiz do repositório.
- [ ] Nenhum arquivo de backup de editor (`.save` ou equivalente) permanece versionado.
- [ ] A relação entre a aplicação legada e `platform/` está formalmente decidida e documentada.
- [ ] O destino do conteúdo de `backups/` está formalmente decidido e documentado.
- [ ] Todo documento legado de `docs/` tem um status declarado frente à Constitution, ou uma decisão explícita de consolidação/deprecação.
- [ ] Nenhum documento em status Official ou Frozen foi alterado.
- [ ] O build e o ambiente de desenvolvimento (`npm run dev` / `npm run build` ou equivalente) continuam funcionando após a limpeza.
- [ ] `git status` retorna limpo em uma instalação nova do repositório, sem ruído de dependências.

---

## 8. Risks

| Risco | Mitigação |
|---|---|
| Remoção do rastreamento de `node_modules/` ou `dist/` quebrar builds locais de outros colaboradores | Comunicar a limpeza antes da execução; exigir `npm install` (ou equivalente) após o merge da limpeza |
| Perda acidental de código ou histórico ao remover `backups/` do rastreamento do Git | Confirmar, antes da remoção, que o conteúdo relevante já existe no histórico de commits do Git ou foi conscientemente descartado por decisão explícita, nunca por remoção silenciosa |
| Consolidação de lockfiles introduzir versões de dependências divergentes das atualmente instaladas | Regenerar o lockfile escolhido a partir do `package.json` vigente e validar a instalação antes de finalizar a fase |
| Reclassificação de documentação legada ser interpretada como alteração de conteúdo Official/Frozen | Restringir toda reclassificação a documentos ainda não cobertos pela Constitution; nunca tocar em documento já Official ou Frozen (Seção 5) |
| Execução da limpeza divergir deste plano por decisão informal durante a fase de execução | Toda divergência relevante deste plano, durante a execução, deve ser registrada como atualização deste próprio documento, nunca aplicada silenciosamente |

---

## 9. Rollback Strategy

Toda ação de limpeza é executada exclusivamente através de commits do Git, nunca por alteração direta e irreversível de arquivos fora do controle de versão. Isso garante que:

- Qualquer fase de execução pode ser revertida por reversão do(s) commit(s) correspondente(s), preservando o estado anterior do repositório na íntegra.
- Nenhuma fase de execução é iniciada sem que a fase anterior tenha sido commitada de forma isolada e identificável, permitindo reversão granular por fase.
- A remoção de rastreamento do Git (por exemplo, de `node_modules/` ou `dist/`) não implica apagamento de arquivos do disco de nenhum colaborador; implica apenas a interrupção do rastreamento a partir do commit correspondente.
- Decisões sobre o destino de `backups/` e da documentação legada, uma vez tomadas na Fase de Execução, são registradas de forma que a razão da decisão permaneça auditável, mesmo que o rollback técnico não seja necessário.

---

## 10. Expected Outcome

Ao final da execução deste plano, o repositório da Adaptive Business Platform deve apresentar:

- Um histórico Git que rastreia exclusivamente código-fonte, configuração e documentação — nunca dependências instaladas, saída de build, ou artefatos de sistema operacional.
- Exatamente uma estrutura de projeto ativa e claramente identificada como fonte da verdade, com a relação entre ela e qualquer estrutura anterior formalmente resolvida.
- Nenhum arquivo duplicado, órfão ou sem função reconhecida na raiz do repositório.
- Um único gerenciador de pacotes e um único lockfile por projeto.
- Uma documentação em `docs/` na qual todo documento tem status declarado frente à Documentation Constitution, sem nenhuma ambiguidade entre o que é legado e o que é oficial.
- Uma base estável, previsível e auditável, sobre a qual a Fase 1 — construção dos Agentes, dos Business Hubs e do Dashboard — pode começar sem herdar dívida estrutural do repositório.

---

*Este documento permanece em status Draft até que a Fase de Execução seja formalmente aprovada e concluída, momento em que poderá avançar para Official, segundo o processo de Change Management descrito na Documentation Constitution, Seção 10.*
