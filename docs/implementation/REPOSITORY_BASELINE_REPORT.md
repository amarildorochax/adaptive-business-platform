# Repository Baseline Report

**Adaptive Business Platform · Documento de Implementação**

Status: Approved · Sprint: ST-002 — Repository Hygiene & Baseline

---

## Resumo Executivo

Esta Sprint consolida a Baseline Oficial do repositório após o commit de segurança já criado pela ST-001 (`a52573f`, tag `architecture-foundation-complete`). A auditoria de higiene não encontrou nenhum arquivo temporário, cache, log, dump, build antiga ou artefato de IDE indevidamente rastreado — o `.gitignore` já existente cobria corretamente a esmagadora maioria dessas categorias. Foram encontradas, e tratadas, quatro lacunas reais: ausência de padrão de arquivo compactado (`*.zip`/`*.rar`/`*.7z`) no `.gitignore`, ausência de padrão para diretórios de outras ferramentas de IA assistiva (Cursor, Windsurf), um arquivo de configuração local (`.claude/settings.local.json`) já rastreado apesar de seu próprio nome indicar escopo local, e o padrão de arquivo temporário de escrita atômica (`*.tmp.*`) que já havia causado uma falha real durante a ST-001. Nenhum arquivo grande (acima de 5 MB) foi encontrado em todo o repositório fora de `node_modules/`. Nenhum diretório vazio, órfão ou duplicado foi encontrado além dos já conhecidos. Um único item permanece como decisão explicitamente adiada ao usuário: o destino final de `projeto-atualizado.zip`.

---

## Auditoria do .gitignore

**Cobertura já existente, confirmada correta:** `node_modules/`, `dist/`, `build/`, `.env*`, `.vscode/`, `.idea/`, `*.log` e variantes, arquivos de SO (`.DS_Store`, `Thumbs.db`), `.cache/`, `coverage/`, `*.tsbuildinfo`, `*.tmp`/`*.temp`. Verificado diretamente: `dist/` (4,5 MB de build local) e `tsconfig.tsbuildinfo` existem em disco e são corretamente ignorados, não aparecendo em `git status` nem em `git ls-files`.

**Lacunas encontradas e corrigidas nesta Sprint** (adições ao `.gitignore`, todas puramente aditivas e sem efeito sobre nenhum arquivo já rastreado):

| Padrão adicionado | Justificativa |
|---|---|
| `.cursor/`, `.windsurf/` | Nenhum dos dois existe hoje no repositório, mas sua ausência do `.gitignore` era uma lacuna defensiva óbvia — outras ferramentas de IA assistiva além do Claude Code podem ser usadas no futuro, e seus diretórios de estado local nunca deveriam ser rastreados. Adição segura por não afetar nenhum arquivo existente. |
| `.claude/settings.local.json` | O próprio nome do arquivo ("local") indica escopo de máquina, não de projeto — e seu conteúdo, já revisado na ST-001, é uma lista crescente de permissões de ferramenta concedidas durante sessões de trabalho, sem relação com o código da plataforma. **Importante**: esta adição, isoladamente, não remove o arquivo do rastreamento — ele já está commitado desde antes desta Sprint, e o Git não deixa de rastrear um arquivo já commitado apenas por ele passar a constar no `.gitignore`. A ação completa (`git rm --cached`) é registrada como decisão adiada, não executada aqui — ver Decisões Adiadas. |
| `*.tmp.*` | O padrão já existente (`*.tmp`, `*.temp`) não cobre um arquivo cujo nome contém `.tmp.` seguido de sufixo, exatamente o padrão do artefato fantasma (`.claude/settings.local.json.tmp.15096.dff98eddd264`) que causou uma falha real de `git add` durante a ST-001. Esta adição previne a recorrência do mesmo problema. |
| `*.zip`, `*.rar`, `*.7z`, `*.tar.gz` | Nenhum padrão de arquivo compactado existia previamente — a lacuna que permitiu que `projeto-atualizado.zip` fosse, até esta Sprint, elegível para inclusão automática em qualquer `git add -A`. Adição diretamente motivada pelo achado desta própria auditoria. |

Nenhuma remoção foi feita ao `.gitignore` — apenas adição de padrão, a alteração de menor risco possível a este arquivo.

---

## Auditoria de Arquivos (não pertencentes ao projeto)

| Arquivo | Categoria | Classificação | Justificativa |
|---|---|---|---|
| `projeto-atualizado.zip` (4,33 MB, `Zip archive data`, modificado 28/07) | Export/compactado | **Ignorar** (via `.gitignore`, `*.zip` já adicionado); destino final **adiado ao usuário** | Conteúdo não verificado por esta Sprint — nenhum arquivo foi extraído. Um artefato binário de 4,33 MB sem relação clara com o código-fonte não pertence ao histórico do Git; a decisão de mantê-lo em disco, movê-lo para armazenamento externo, ou removê-lo definitivamente pertence ao usuário, não a esta Sprint (regra: nunca remover automaticamente). |
| `package-lock 2.json` (70 KB, já commitado) | Duplicata de configuração | **Manter por ora** (decisão de remoção já existe, execução pendente) | Coberto pela Decisão 001, já Approved em `REPOSITORY_DECISIONS.md` — pnpm é o gerenciador oficial; a remoção física deste arquivo e de `package-lock.json` é uma ação de execução já autorizada, mas fora do escopo desta Sprint de higiene (que não executa remoção). |
| `dist/` (4,5 MB, build local de `vite build`) | Build antiga | **Ignorar** (já corretamente coberto pelo `.gitignore` existente) | Build local, regenerável a qualquer momento, corretamente nunca rastreada. Nenhuma ação necessária. |
| `tsconfig.tsbuildinfo` | Cache de build | **Ignorar** (já corretamente coberto) | Cache incremental do compilador TypeScript, regenerável, corretamente nunca rastreado. |
| `patches/phaser+3.90.0.patch` | Patch de dependência | **Manter** (já corretamente rastreado) | Artefato legítimo do `patch-package`, necessário para reproduzir a correção de WebGL do Phaser em qualquer instalação nova — não é lixo, é parte funcional do projeto. |
| `backups/` | Backup versionado | **N/A — já removido** | Já removido do repositório no commit `dcf0fee` (Fase 3, Decisão 002), conforme já registrado em `REPOSITORY_DECISIONS.md`. Confirmado ausente do diretório de trabalho atual. |

Nenhum arquivo de cache, log, dump, RAR, 7z, snapshot, ou export adicional foi encontrado em toda a árvore do repositório (excluindo `node_modules/`, corretamente ignorado).

---

## Auditoria de Duplicidades

**`package-lock 2.json`** — duplicidade já formalmente decidida (Decisão 001, Approved). Referenciada, não redecidida por esta Sprint.

**`src/app/pages/Crm*Page.tsx` versus `src/app/features/crm/pages/*Page.tsx`** — `TECHNICAL_MIGRATION_STRATEGY.md`, Capítulo 12 (Divergência 4), havia registrado esta coexistência como uma duplicação não investigada, recomendando confirmação antes de qualquer migração de rota. Esta Sprint inspecionou o conteúdo de um arquivo representativo (`src/app/pages/CrmOverviewPage.tsx`) e confirmou que **não é duplicação** — é um padrão deliberado de composição de rota: o arquivo em `src/app/pages/` é um wrapper de 5 linhas que importa e renderiza o componente real de `src/app/features/crm/pages/`. Este achado **refina, sem contradizer**, o registro de `TECHNICAL_MIGRATION_STRATEGY.md` — a Divergência 4 pode ser considerada esclarecida nesta dimensão específica (não há código morto ou duplicado), embora a recomendação daquele documento de confirmar antes de migrar a rota permaneça válida por prudência.

Nenhuma outra duplicidade de arquivo de configuração, backup, ou versão antiga foi encontrada.

---

## Auditoria de Arquivos Grandes

Varredura completa de todo o repositório (excluindo `node_modules/` e `.git/`) para arquivos acima de 5 MB: **nenhum arquivo encontrado**. `projeto-atualizado.zip` (4,33 MB) fica abaixo do menor limiar solicitado (5 MB), mas é tratado na Auditoria de Arquivos acima por sua natureza de export não verificado, não por seu tamanho. Não há, portanto, nenhum arquivo nesta plataforma hoje que responda às perguntas de 5/10/25/50 MB deste documento — nenhum candidato a Git LFS, a armazenamento externo, ou a release binário.

---

## Auditoria Estrutural

**Diretórios vazios:** nenhum encontrado em todo o repositório.

**Diretórios mortos ou majoritariamente vazios (já conhecidos, não removidos):** `src/modules/` — doze pastas de domínio, cada uma com `Events.ts`/`Manager.ts`/`Models.ts`/`Types.ts` majoritariamente stub (`export {}`), já classificadas por `TECHNICAL_MIGRATION_STRATEGY.md`, Capítulo 16, como candidatas a remoção direta em fase futura — não removidas aqui, apenas confirmadas ainda presentes e ainda vazias.

**Diretórios experimentais:** `src/game/` (simulação Phaser 2D) — nenhum Blueprint desta série o documenta como capacidade de negócio; já registrado em `TECHNICAL_MIGRATION_STRATEGY.md`, Capítulo 16, como pendente de decisão de produto, não de limpeza técnica. Confirmado ainda presente, sem mudança de status.

**Workspaces incompletos:** `platform/apps/web/` permanece um placeholder de scaffold (`ApplicationRouter.tsx` renderiza `<div>Router</div>`), exatamente o estado já descrito em `REPOSITORY_DECISIONS.md`, Decisão 003 — não é um problema de higiene, é o estado esperado de um workspace ainda não populado por implementação real.

Nenhuma estrutura nunca utilizada além das já catalogadas por `TECHNICAL_MIGRATION_STRATEGY.md` foi encontrada.

---

## Decisões Tomadas

Adição de seis novos padrões ao `.gitignore` (`.cursor/`, `.windsurf/`, `.claude/settings.local.json`, `*.tmp.*`, `*.zip`, `*.rar`, `*.7z`, `*.tar.gz`) — todas puramente aditivas, sem efeito sobre arquivo já rastreado. Classificação formal de `projeto-atualizado.zip` como Ignorar-com-destino-adiado, nunca removido automaticamente. Confirmação de que a suposta duplicação de páginas de CRM (Divergência 4 de `TECHNICAL_MIGRATION_STRATEGY.md`) é, na verdade, um padrão de composição de rota legítimo, não código morto.

---

## Decisões Adiadas

**Destino final de `projeto-atualizado.zip`** — manter fora do Git indefinidamente, mover para armazenamento externo, ou excluir — decisão exclusiva do usuário, por envolver conteúdo não verificado por esta Sprint. **Untracking de `.claude/settings.local.json`** — recomendado (via `git rm --cached .claude/settings.local.json`, preservando o arquivo em disco), mas não executado nesta Sprint por representar uma mudança de comportamento de rastreamento, não apenas uma regra de `.gitignore`; requer confirmação explícita antes de execução. **Remoção física de `package-lock.json` e `package-lock 2.json`** — já autorizada pela Decisão 001, execução continua fora do escopo de higiene desta Sprint. **Remoção de `src/modules/*` (stubs vazios)** — já recomendada por `TECHNICAL_MIGRATION_STRATEGY.md`, execução pertence à Fase correspondente de `IMPLEMENTATION_ROADMAP_MASTER.md`, não a esta Sprint de higiene.

---

## Riscos Remanescentes

Nenhum risco bloqueante para o início da migração foi encontrado. O único item ainda em aberto — o arquivo compactado não verificado — está contido (ignorado pelo Git, documentado, não removido) e não representa risco operacional adicional além do já registrado na ST-001. Todos os demais itens adiados são de baixa severidade e já possuem, cada um, um documento e uma fase futura que os endereça formalmente.

---

## Ações Executadas

1. Auditoria completa de arquivos não pertencentes ao projeto, com classificação individual e justificativa (nenhuma remoção automática).
2. Auditoria e correção segura do `.gitignore` (seis padrões novos, puramente aditivos).
3. Auditoria de duplicidades, incluindo resolução — não apenas registro — da dúvida sobre páginas de CRM levantada por `TECHNICAL_MIGRATION_STRATEGY.md`.
4. Auditoria de arquivos grandes (nenhum encontrado).
5. Auditoria estrutural (nenhum diretório vazio ou órfão novo encontrado).
6. Este relatório.
7. Um único commit, cobrindo o `.gitignore` atualizado, o relatório de estabilização da ST-001 (ainda não commitado até este momento) e este relatório.

---

## Checklist

- [x] Nenhum arquivo temporário relevante permanece sem decisão
- [x] Nenhum backup permanece ambíguo (`backups/` já removido; nenhum novo encontrado)
- [x] `.gitignore` revisado e corrigido de forma segura
- [x] Arquivos grandes auditados (nenhum encontrado acima de 5 MB)
- [x] Duplicidades catalogadas (referenciadas a decisão já existente ou esclarecidas)
- [x] Estrutura validada (sem diretório vazio ou órfão novo)
- [x] Baseline consolidada
- [x] Relatório criado
- [x] Commit realizado

---

## Conclusão

O repositório entra nesta Sprint já estabilizado pela ST-001 e sai dela com uma Baseline genuinamente consolidada: o `.gitignore` agora cobre a classe de arquivo (compactado) que motivou o único item pendente desde a Sprint anterior, o artefato que causou uma falha real de Git durante aquela Sprint tem agora um padrão que o previne de se repetir, e uma dúvida de duplicação de código que permanecia registrada, mas não resolvida, foi verificada e esclarecida. Nenhum item remanescente bloqueia o início de `IMPLEMENTATION_ROADMAP_MASTER.md`, Fase 1 — os poucos itens adiados têm, cada um, dono, documento e momento futuro já definidos.
