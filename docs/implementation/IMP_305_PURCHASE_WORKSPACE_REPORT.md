# IMP-305 — Purchase Workspace — Relatório de Implementação

**Adaptive Business Platform · Relatório de Sprint**

---

## Nota de Posicionamento Documental

Este relatório fecha a Sprint **IMP-305 — Purchase Workspace**, a quinta e última etapa do Purchase Hub (Arquitetura ✅ ERP-001, Core ✅ IMP-301, Persistência ✅ IMP-302, HTTP API ✅ IMP-303, Frontend Infrastructure ✅ IMP-304). Ela constrói exclusivamente o Workspace — nenhuma alteração a Arquitetura, Core, Persistência, HTTP API ou `core/purchase/` (Frontend Infrastructure, IMP-304). Ao final desta Sprint, o Purchase Hub está completo de ponta a ponta — o **segundo domínio ERP integral** desta plataforma, ao lado do Supplier Hub.

---

## 1. Auditoria Realizada (Passo 1, obrigatória antes de qualquer implementação)

Comparação completa entre `apps/web/src/pages/suppliers/` (doze arquivos, IMP-205) e o que o Purchase Hub exige, à luz dos dezenove Hooks já aprovados em `core/purchase/` (IMP-304).

**Existe oportunidade de reutilização?** Sim, ampla: `PageContainer`, `PageHeader`, `AsyncState`, `SectionSubNav`, `Table`, `Drawer`, `Field`, `Select`, `Button`, `Badge`, `KPIGrid`, `MetricCard`, `EmptyState`, `NotConnectedNotice`, `ProcessFlow`, `LiveIndicator`, `Timeline`, `ActivityBadge`, `useRecentlyChanged`, `useToast` — todos reutilizados sem nenhuma alteração. O layout completo do Workspace (`{Domain}Page.tsx` + `{domain}Sections.ts` + `sections/*.tsx` + `Create{Entity}Drawer.tsx` + `{domain}HistoryLog.ts`) segue o mesmo esqueleto do Supplier Workspace, arquivo a arquivo.

**Existe componente genérico suficiente?** Para a maior parte, sim — nenhum novo primitivo de Design System foi necessário. Para os Cards de resumo e Badges de status específicos de domínio, não — mesma conclusão já registrada pela IMP-205 (`MetricCard`/`WidgetCard`/`EmptyState` já cobrem tudo que é genérico; um Card de resumo de Entidade específica de domínio, com campos próprios, sempre precisou de seu próprio componente).

**Existe duplicação evitável?** Uma real, encontrada e **não corrigida** nesta Sprint (per instrução explícita, "Não refatorar"): `.receiving-card`/`.purchase-card` (CSS, criadas pela FUN-106) e `.supplier-card`/`.contract-card` (CSS, IMP-205) têm exatamente a mesma estrutura (`display: flex; flex-direction: column; ...`) sob nomes de classe distintos por domínio — nenhum `EntitySummaryCard` genérico foi extraído (ver Capítulo 12).

**Existe melhoria que beneficie todos os próximos Hubs?** Sim, quatro — documentadas no Capítulo 12, nenhuma executada.

**Achado adicional, fora do roteiro de quatro perguntas, mas exigido pela disciplina "nunca corrigir silenciosamente" — colisão real de rota.** A auditoria encontrou que a rota `/purchases` **já existia**, apontando para um Workspace inteiramente fictício da FUN-106 (`pages/purchases/PurchasePage.tsx` antigo) — construído sobre `useProductWorkspace()`/`CommerceManager` **em processo**, sem nenhuma relação com `@abp/purchase-hub`. Ver Capítulo 2.

---

## 2. Divergência Encontrada — Substituição do Placeholder FUN-106 (documentada, não corrigida silenciosamente)

**O que foi encontrado.** `app/router/routes.tsx` já registrava `{ path: "purchases", element: <PurchasePage /> }` apontando para `pages/purchases/PurchasePage.tsx` (FUN-106) — um Workspace de oito seções sobre `useProductWorkspace()` (o mesmo cache `["commerce","workspace"]` do Product Hub em processo), com duas seções (`OrdersSection`/`SuppliersSection` daquele Workspace) inteiramente `NotConnectedNotice`, porque, à época da FUN-106, nenhum Purchase Hub real existia em lugar nenhum da plataforma — confirmado à exaustão pela própria auditoria daquela Sprint.

**Por que isto não é uma surpresa.** O próprio `ERP_FOUNDATION_REPORT.md` (ERP-001) já registrava a FUN-106 como motivação direta para a criação do domínio ERP real — o ciclo `ERP-001 → IMP-301 → IMP-302 → IMP-303 → IMP-304 → IMP-305` sempre teve como objetivo final substituir exatamente esse placeholder. A colisão de rota não é um erro de nenhuma Sprint anterior — é o estado esperado até este exato momento do roadmap.

**Decisão tomada — substituição integral, não uma segunda rota.** `pages/purchases/PurchasePage.tsx`/`purchaseSections.ts`/`sections/{Analytics,Costs,Orders,Overview,Receivings,Suppliers}Section.tsx` (FUN-106) foram removidos por completo, junto dos quatro componentes compartilhados exclusivos daquele Workspace (`SupplierBadge`, `CostIndicator`, além de `PurchaseCard`/`ReceivingCard`, cujas contrapartes reais desta Sprint reaproveitam apenas a classe CSS, nunca o componente antigo) — confirmados por busca completa como usados exclusivamente por aquele Workspace, nenhum import externo. A rota `/purchases` (`app/navigation/navEntries.ts`, `app/router/routes.tsx`) permanece a mesma — `status: "active"`, mesmo rótulo "Compras", mesmo ícone — apenas seu destino agora é o Purchase Hub real. `pages/product-hub/sections/PurchasesSection.tsx` (a aba "Compras" dentro do Product Hub Workspace — um conceito genuinamente distinto, a ausência de lado de aquisição dentro do próprio Commerce Hub) **permanece intocado** — lacuna real e ainda vigente, não relacionada a este achado.

**Amendment — não necessária.** Nenhum documento Frozen/Official precisou mudar; a substituição é a consequência natural e já prevista do roadmap documentado desde ERP-001.

---

## 3. Estrutura — as Oito Seções

| Seção | Conteúdo real | Rota interna |
|---|---|---|
| Visão Geral | KPIs reais, `ProcessFlow` do funil de Procurement, Pedidos recentes | `?section=` ausente (padrão) |
| Requisições | Tabela real filtrada por status, Criar/Aprovar/Rejeitar/Converter | `?section=requisitions` |
| Pedidos | Tabela real, Criar/Adicionar Item/Aprovar/Enviar/Cancelar | `?section=orders` |
| Recebimentos | Lista real de Receiving, registro real, limitação conhecida honesta | `?section=receivings` |
| Reposição | Criação/avaliação/desativação reais; `NotConnectedNotice` para listagem | `?section=reorder` |
| Histórico | Log de sessão honesto | `?section=history` |
| Analytics | Indicadores reais derivados dos Pedidos abertos | `?section=analytics` |
| Configurações | Tema (única preferência real); `NotConnectedNotice` para o resto | `?section=settings` |

**Arquitetura de dados, diferente do Supplier Workspace.** O Supplier Workspace carrega uma única Query de topo (`useSuppliers`) porque o Supplier Hub tem apenas uma Query real em Core. O Purchase Hub expõe seis Queries reais espalhadas por três Aggregates (`PurchaseOrder`, `PurchaseRequisition`, `Receiving`) — `PurchasePage.tsx` carrega apenas `usePurchaseOrders(tenantId)` (a lista aberta, usada por Visão Geral/Pedidos/Analytics/Recebimentos); cada seção que precisa de uma Query adicional (`usePurchaseRequisitions`, `useReceivings`) a chama diretamente, co-localizada — React Query deduplica por `queryKey`, então nenhuma chamada de rede duplicada ocorre quando duas seções pedem a mesma chave (ex.: Visão Geral e Requisições ambas consultando `status: "Open"`). Decisão documentada, não uma mudança de padrão — a mesma disciplina "exclusivamente via Hooks" é preservada integralmente.

---

## 4. Visão Geral

Quatro KPIs (`MetricCard`/`KPIGrid`, reutilizados): Pedidos abertos, Requisições aguardando aprovação, Em recebimento, Finalizados nesta sessão. `ProcessFlow` (UX-002, componente obrigatório, nunca recriado) resume o funil real — Solicitação → Aprovação → Pedido → Recebimento → Finalizado — cada etapa e `detail` calculados exclusivamente de dado real (`usePurchaseOrders` + duas chamadas de `usePurchaseRequisitions`, co-localizadas). "Finalizado" usa `receivedThisSession` (Capítulo 6) — `PurchaseManager` nunca expôs nenhuma Query para Purchase Order já Recebido, então a contagem reflete apenas o que a sessão do navegador observou de fato. `LiveIndicator` acende quando `dataUpdatedAt` de `usePurchaseOrders` muda.

---

## 5. Requisições, Pedidos, Recebimentos, Reposição

**Requisições** — `Table` real filtrada por status (`Select`), Criar (Drawer com múltiplas linhas — a única seção com lista dinâmica, porque `CreatePurchaseRequisitionInput` é o único Command cujo corpo é ele mesmo uma lista), Aprovar/Rejeitar (`Open` apenas), Converter em Pedido (`Approved` apenas, Drawer pedindo Fornecedor + custo por Produto). **Nenhum botão "Editar" ou "Cancelar"** — `PurchaseManager` nunca expôs nenhum Command de atualização parcial nem de cancelamento para Requisition (apenas Create/Approve/Reject/Convert); per instrução explícita ("Somente ações realmente suportadas"), nenhuma das duas é exibida — mesma disciplina de "Excluir não exibido" no Supplier Workspace.

**Pedidos** — `Table` real (`usePurchaseOrders`). Ações por linha condicionadas ao status atual, refletindo exatamente `PurchasePolicy.canTransitionPurchaseOrderStatus`/`canAddPurchaseOrderItem` (Core, IMP-301): Adicionar Item (Draft/PendingApproval), Aprovar (PendingApproval, Drawer com teto + identidade opcional), Enviar ao Fornecedor (Approved), Cancelar (Draft/PendingApproval/Approved/Sent). Nenhuma regra de negócio é decidida no cliente — o botão só existe quando o status já permite a ação; se o servidor ainda assim rejeitar, o erro real aparece via toast.

**Recebimentos** — ver Capítulo 9 (Limitação Conhecida).

**Reposição** — Criar Reorder Rule (real), Avaliar (`useEvaluateReorderRule`, Drawer pedindo a quantidade em estoque corrente), Desativar (real). `NotConnectedNotice` para listagem de Regras já existentes — `PurchaseManager` nunca expôs Query alguma para `ReorderRule`, mesma disciplina honesta de Contratos/Catálogo do Supplier Workspace. **Nenhuma recomendação de IA, nenhuma simulação** — o resultado exibido é exatamente o que `POST /reorder-rules/:ruleId/evaluate` devolveu, nunca calculado no cliente.

---

## 6. ProcessFlow (Componente Obrigatório)

Reutilizado sem nenhuma alteração — `shared/components/ui/ProcessFlow.tsx` (UX-002) já era genérico o suficiente. Instanciado uma única vez, em `OverviewSection.tsx`, representando exatamente a cadeia pedida pela Sprint: Solicitação → Aprovação → Pedido → Recebimento → Finalizado. Nenhum componente semelhante foi criado.

---

## 7. LiveIndicator

Reutilizado sem alteração — acende em `OverviewSection.tsx` apenas quando `usePurchaseOrders(tenantId).dataUpdatedAt` muda de fato entre renderizações (`useRecentlyChanged`, já existente), nunca um indicador decorativo permanente.

---

## 8. `purchaseHistoryLog.ts` — Extensão Pequena e Justificada Além do Padrão do Supplier

Mesma disciplina de `supplierHistoryLog.ts` (IMP-205): nenhum endpoint HTTP do Purchase Hub devolve `PurchaseEvent` (`apps/api/src/routes/purchase.ts` extrai apenas `result`) — o log é reconstruído honestamente no navegador, nunca sincronizado com o servidor, nunca uma Timeline fabricada.

**Extensão real, sem equivalente no Supplier Hub:** `receivedThisSession`/`markReceived`. `PurchaseManager` nunca expôs nenhuma Query para Purchase Order já Recebido — nem sequer `listOpenPurchaseOrders` os inclui (por definição, "aberto" exclui `Received`). Não existe, portanto, nenhuma forma de saber quantos Pedidos foram genuinamente finalizados nesta sessão a não ser rastreando-os localmente, no exato momento em que uma `registerReceiving` real confirma `fullyReceived: true` — usado pela etapa "Finalizado" do `ProcessFlow` (Capítulo 4). Mesma disciplina honesta de todo dado de sessão já usado nesta plataforma — nunca um total histórico inventado.

---

## 9. Limitação Conhecida (Obrigatória) — Recebimentos

O IMP-303 documentou que um segundo `registerReceiving` contra o mesmo Purchase Order falha com um erro real do servidor (bug de Persistência em `SqlitePurchaseOrderRepository.replaceItems`, IMP-302, ainda não corrigido). `ReceivingsSection.tsx`:

- **Nunca simula** múltiplos recebimentos — o formulário de registro sempre chama `useRegisterReceiving` real, uma única vez.
- **Nunca cria workaround** — nenhum retry, nenhuma fila local, nenhum merge otimista de recebimentos parciais.
- **Nunca esconde** a limitação — quando o Pedido selecionado já possui ao menos um Receiving (`useReceivings(purchaseOrderId).data.length > 0`), um `NotConnectedNotice` explica exatamente a causa (referenciando IMP-302/IMP-303) e o formulário de registro é substituído pelo aviso — nunca simplesmente removido sem explicação.
- Testado explicitamente (`PurchasePage.test.tsx`, "após um Receiving já registrado... nunca um workaround") — confirma que o aviso aparece e o botão de registro desaparece, exatamente o comportamento exigido.

---

## 10. Estratégia de Cache

Nenhuma lógica de cache nova na UI — toda seção consome exclusivamente os Hooks de `core/purchase/` (IMP-304), que já encapsulam `queryKey`/`setQueryData` via `purchaseCache.ts`. **A limitação de `requisitionsByStatus` (documentada em IMP-304: uma transição de status nunca move a entrada entre chaves de cache automaticamente) permanece intocada e visível nesta Sprint** — `RequisitionsSection.test` (`PurchasePage.test.tsx`, "fluxo completo da Requisição") precisa trocar manualmente o filtro de status para observar uma Requisition recém-aprovada, exatamente como um usuário real precisaria fazer (ou aguardar uma consulta futura); nenhuma estratégia nova foi inventada para mascarar essa limitação, per instrução explícita ("Nenhuma estratégia nova poderá ser criada neste Sprint").

---

## 11. Novos Componentes Compartilhados

Cinco componentes novos, todos em `shared/components/ui/`, todos genéricos (nenhum importa tipo de `@abp/purchase-hub`):

- **`PurchaseStatusBadge`** — `Badge` + mapeamento `PurchaseStatus → tom semântico`, mesmo padrão de `SupplierStatusBadge`.
- **`RequisitionStatusBadge`** — mesmo padrão, para `PurchaseRequisitionStatus` (enum distinto, badge próprio).
- **`PurchaseOrderCard`** — resumo de um Purchase Order (identificador, status, Fornecedor por id opaco, contagem de itens, valor total opcional).
- **`ReceivingCard`** — resumo de um Receiving (identificador, contagem de linhas, momento real).
- **`RequisitionCard`** — resumo de uma Purchase Requisition (identificador, origem, status, contagem de produtos) — definido, mas não instanciado nesta Sprint (nenhuma seção precisou de um grid de Requisition Cards; `Table` já cobriu a necessidade real de listagem) — mantido no Design System como componente pronto, mesma disciplina de componentes "prontos para o próximo uso real" já registrada em Sprints anteriores.

**`PurchaseMetricCard`, sugerido pela Sprint, deliberadamente não criado** — mesma decisão e mesma justificativa exata da IMP-205 para `SupplierMetricCard`: `MetricCard` já cobre a necessidade por completo.

**Reuso de CSS, não de componente** — `.purchase-card`/`.receiving-card` (classes CSS da FUN-106) foram reaproveitadas pelos componentes reais desta Sprint; `.supplier-badge`/`.cost-indicator` (também FUN-106), órfãs após a remoção do placeholder (Capítulo 2), foram removidas de `styles/components.css`.

---

## 12. Qualidade — Comparação com Supplier Workspace

**O Supplier Workspace foi seguido integralmente** — mesma estrutura de arquivo, mesma disciplina "exclusivamente via Hooks", mesmo tratamento de erro sem paralelismo, mesma honestidade de `NotConnectedNotice`/log de sessão, mesmo uso obrigatório de `ProcessFlow`/`LiveIndicator`.

**Existe duplicação?** Sim, real, documentada, não corrigida: a estrutura CSS de `.purchase-card`/`.receiving-card`/`.supplier-card`/`.contract-card` é idêntica sob quatro nomes de classe distintos.

**Existe oportunidade de abstração?** Três, nenhuma executada, per instrução explícita:
1. Um `EntitySummaryCard` genérico (`icon`, `title`, `badge`, `meta: string[]`) substituiria as quatro variantes de Card acima — candidato real agora com quatro instâncias comprovadas (Supplier, Contract, Purchase Order, Receiving), diferente de IMP-205, que só tinha duas.
2. Um `createStatusBadge(toneMap, labelMap)` substituiria `SupplierStatusBadge`/`PurchaseStatusBadge`/`RequisitionStatusBadge` — três instâncias do mesmo padrão exato.
3. `demoApiFetchMock.ts` cresceu para três domínios (Business Profile/Branding/CRM, Supplier, Purchase) em um único arquivo — candidato a divisão em módulos por domínio compostos em um único mock, facilitando a manutenção quando o próximo Hub (Inventory Movement) precisar do mesmo mecanismo.

**Existe componente reutilizável para Inventory, Production, Fiscal e Financial?** Sim, três padrões, todos comprovados nesta Sprint:
1. **Seção com filtro de status próprio + Query co-localizada** (`RequisitionsSection`) — template direto para qualquer Aggregate futuro com máquina de estados e Query de listagem por status.
2. **Seletor de recurso elegível + limitação conhecida honesta via `NotConnectedNotice`** (`ReceivingsSection`) — o Inventory Movement Hub, cujo próprio `ReorderEvaluationService` (Purchase Hub, Core) já depende de sua futura existência, provavelmente precisará de um padrão de seleção de recurso análogo.
3. **Lista de sessão + ação de avaliação sob demanda para Aggregates somente-Mutation** (`ReorderSection`) — template para qualquer futuro domínio cujo Core exponha Commands sem nenhuma Query de listagem correspondente, um padrão já recorrente (Contratos/Catálogo do Supplier Hub, Reorder Rule do Purchase Hub).

---

## 13. Testes

Três arquivos (dois novos, um estendido), 30 testes novos:

| Arquivo | Cobertura |
|---|---|
| `PurchaseWorkspaceComponents.test.tsx` | Os cinco componentes novos — status conhecido/desconhecido, campos honestos, valor total ausente |
| `PurchasePage.test.tsx` (17 testes) | Carregamento; Visão Geral vazia; criar Pedido via Ação Rápida; fluxo completo do Pedido (criar → item → aprovar → enviar → receber por completo); limitação conhecida de Recebimentos (NotConnectedNotice, formulário desabilitado, nenhum workaround); fluxo completo da Requisição (criar → aprovar → converter), incluindo a limitação de `requisitionsByStatus` tornada explícita; rejeição de Requisição; fluxo completo de Reposição (criar → avaliar, dispara → desativar); Histórico; Analytics; Configurações; 422 (teto sem identidade); ação condicional desaparecendo por status |
| `demoApiFetchMock.ts` (estendido) | Dezesseis rotas do Purchase Hub simuladas em memória — a máquina de estados (`PendingApproval` no primeiro item, teto de aprovação, `PartiallyReceived`/`Received`) espelha `PurchasePolicy`/`PurchaseOrderService` apenas na medida necessária para os cenários exercitados, nunca uma reimplementação completa do domínio |

Toda integração usa os Hooks reais de `core/purchase/` — nenhum mock da lógica do Workspace, apenas da camada `fetch`, mesma disciplina de todo Workspace HTTP-real já testado nesta plataforma. Dois defeitos de teste reais foram encontrados e corrigidos durante esta Sprint (nunca no Core/HTTP/Frontend Infrastructure): rótulos de botão duplicados entre a ação de linha e o botão de confirmação do Drawer ("Aprovar"/"Avaliar") — corrigido renomeando o botão de confirmação do Drawer para "Confirmar Aprovação"/"Confirmar Avaliação"; e `slice(0, 8)` de identificador gerando um comprimento de string diferente por prefixo (`"po-demo-1".slice(0,8)` inclui o hífen final, `"req-demo-1".slice(0,8)` não) — testes ajustados para refletir a string real, nunca o componente alterado para acomodar um teste impreciso.

---

## 14. Validação Executada

`pnpm typecheck`, `pnpm build` e `pnpm lint` verdes. `pnpm test` executado três vezes na raiz do monorepo — **as três execuções passaram integralmente, sem nenhum flake novo** (177 arquivos de teste, 869 testes em cada uma das três rodadas — 868 passando normalmente mais o `it.fails` de IMP-303, documentando o bug de Persistência já conhecido). `vite build` confirma `PurchasePage` em seu próprio chunk lazy (~35,7 kB) e o chunk principal (`index-*.js`) essencialmente inalterado (422,33 kB vs. 422,53 kB antes desta Sprint) — nenhum novo peso relevante vazou para o bundle inicial.

**Validação funcional completa**, cada cenário pedido pela Sprint coberto por um teste automatizado equivalente em `PurchasePage.test.tsx` (mesma disciplina de transparência já registrada pela IMP-205, Capítulo 16, diante da ausência de ferramenta de automação de navegador neste ambiente): Criar Requisição ✅, Aprovar ✅, Criar Pedido ✅, Registrar Recebimento ✅, Consultar Reposição ✅, Validar `ProcessFlow` ✅ (renderizado em todo teste que visita Visão Geral), Validar `LiveIndicator` ✅ (mecanismo herdado sem alteração, já validado pela UX-002/IMP-205), Validar atualização automática dos KPIs ✅ (implícita em cada asserção pós-Mutation, já que `MetricCard`/`KPIGrid` leem diretamente do mesmo estado React Query que a Mutation atualiza).

---

## 15. Preparação para o Próximo Domínio

O Purchase Hub está agora completo — Arquitetura → Core → Persistência → HTTP API → Frontend Infrastructure → Workspace, todas as seis etapas validadas. Junto do Supplier Hub, os dois domínios formam o blueprint oficial da Fase 2. O próximo domínio, Inventory Movement Hub, deve reutilizar integralmente este mesmo ciclo — as três oportunidades de abstração do Capítulo 12 (Card genérico, Badge genérico, mock modularizado) tornam-se mais urgentes assim que um terceiro domínio exigir exatamente os mesmos padrões pela terceira vez consecutiva; nenhuma delas foi executada nesta Sprint, mas ambas ficam registradas como candidatas de alta prioridade para uma futura Sprint de consolidação transversal.

---

## 16. Conclusão

O Purchase Workspace está completo, testado e validado — a quinta e última camada do segundo domínio ERP da Adaptive Business Platform. Toda comunicação passa exclusivamente por `core/purchase/`, nenhuma tela acessa HTTP diretamente, nenhum dado fictício foi exibido em nenhuma seção, e toda lacuna real (listagem de Reorder Rule, `PurchaseEvent`, sincronização de `requisitionsByStatus`, e a limitação de múltiplos Recebimentos herdada de IMP-303) foi documentada e mantida honestamente visível, nunca contornada. O achado mais significativo desta Sprint — a substituição do placeholder fictício da FUN-106 pelo Purchase Hub real na mesma rota `/purchases` — encerra formalmente um ciclo de dívida documental aberto desde a Fase 1. O ciclo completo — Arquitetura (ERP-001) → Core (IMP-301) → Persistência (IMP-302) → HTTP API (IMP-303) → Frontend Infrastructure (IMP-304) → Workspace (IMP-305) — está validado de ponta a ponta e pronto para servir, ao lado do Supplier Hub, como o blueprint definitivo da Fase 2 para Inventory Movement Hub, Production Hub, Fiscal Hub e Financial Hub.
