# Production Hub — Blueprint de Domínio

**Adaptive Business Platform · Documento Técnico (Draft)**

---

## Nota de Posicionamento Documental

Este documento nasce em status **Draft** (`DOCUMENTATION_CONSTITUTION.md`, §8.1), como parte da Sprint ERP-001 — ver `ERP_ARCHITECTURE.md` para a Nota de Posicionamento consolidada.

Production Hub ocupa território genuinamente livre — nenhum documento desta plataforma, Frozen, Official ou Draft, modela transformação de insumo em Produto acabado. A Sprint ERP-001 nomeou "Manufacturing Hub" como um dos dez domínios; este documento formaliza, per ADR-PD-001, que é o mesmo Bounded Context de Production Hub sob outro nome — mesmo padrão de reconciliação de nome já aplicado a Conversation/Communication e Marketing/Growth em `ARCHITECTURE_RECONCILIATION_AND_GOVERNANCE.md`, Capítulo 11: um domínio, um nome, "Production Hub" adotado por já refletir a Linguagem Ubíqua encontrada nas auditorias FUN-104/105 (Composição, insumo, montagem).

`Product`/`Variant` permanecem do Commerce Hub — a saída de uma Produção é sempre um `Product` já cadastrado, nunca criado implicitamente. `Stock Movement` permanece do Inventory Movement Hub — Production Hub nunca decrementa ou incrementa estoque diretamente, apenas publica os Eventos que o Inventory Movement Hub consome.

---

## 1. Introdução

O **Production Hub** é o domínio responsável por transformar um conjunto de insumos em um Produto acabado — a lacuna diretamente identificada pela auditoria da FUN-104 (`docs/implementation/FUN_104_PRODUCT_HUB_WORKSPACE_REPORT.md`), que encontrou zero modelagem de Composição/BOM em `packages/commerce-hub` ou em `COMMERCE_HUB_ARCHITECTURE.md`, apesar de "Composições" ser um dos módulos explicitamente pedidos por aquela Sprint. É este documento que finalmente formaliza esse conceito.

---

## 2. Responsabilidade

O Production Hub é responsável por manter o ciclo de vida de `Bill of Materials` (a Composição — lista de insumos necessária para produzir uma unidade de um Produto), `Production Order` (a ordem de produção concreta), `Production Consumption` (o registro do insumo efetivamente consumido) e `Production Output` (o registro do Produto acabado efetivamente gerado); e por, opcionalmente, associar cada etapa a um `Work Center` quando a Empresa modela sua produção em estações distintas.

---

## 3. Limites do Domínio

O Production Hub nunca cria `Product`/`Variant` — toda `Bill of Materials` referencia um Produto final já cadastrado no Catalog do Commerce Hub, e todo insumo referencia, por identificador, um Produto ou Variant também já cadastrado (um insumo é, ele mesmo, um Produto do Catalog, mesmo quando nunca vendido diretamente ao Cliente final).

O Production Hub nunca decrementa ou incrementa `Stock Movement` diretamente — apenas publica `ProductionConsumption`/`ProductionOutput`, consumidos pelo Inventory Movement Hub.

O Production Hub nunca calcula custo de produção consolidado além do que é diretamente observável (soma do `acquisitionCost` dos insumos consumidos) — qualquer margem, custo indireto ou rateio é responsabilidade do Financial Hub (extensão) e do Analytics Hub.

O Production Hub nunca decide vender ou reservar — decisão de iniciar uma Produção é sempre reativa a uma necessidade já sinalizada (estoque insuficiente para um `Order`, ou decisão manual de reabastecimento), nunca proativa por conta própria.

---

## 4. Aggregates

**Bill of Materials** é um Aggregate independente — associado a exatamente um Produto final (`outputProductId`), contém a lista de insumos necessários (`BOM Line`) como parte interna; uma nova versão de `Bill of Materials` para o mesmo Produto nunca sobrescreve a anterior, é uma nova instância versionada.

**Production Order** é o Aggregate Root do ciclo de execução — referencia exatamente uma `Bill of Materials`, agrupa `Production Consumption` e `Production Output` como parte interna, e é a única Entidade deste domínio referenciada por identificador por Inventory Movement Hub e Financial Hub.

**Work Center** é um Aggregate independente e opcional — representa uma estação física ou lógica de produção; ausente por padrão em uma Empresa pequena sem produção segmentada em etapas.

---

## 5. Entidades

**Bill of Materials.** Identificador; `outputProductId` (Commerce Hub); versão; lista de `BOM Line`; status (`Active`, `Superseded`).

**BOM Line.** `inputProductId`/`variantId` (Commerce Hub); quantidade necessária por unidade de saída; Value Object `UnitOfMeasure`.

**Production Order.** Identificador; `billOfMaterialsId`; quantidade de saída planejada; status (`Planned`, `InProgress`, `Completed`, `Cancelled`); `workCenterId` (opcional); origem (`orderId` do Commerce Hub, quando reativa a uma venda; ou `Manual`, quando reabastecimento antecipado); datas de início e conclusão.

**Production Consumption.** Identificador; `productionOrderId`; `inputProductId`; quantidade efetivamente consumida (pode divergir da `BOM Line` planejada, registrado como está, nunca forçado a coincidir).

**Production Output.** Identificador; `productionOrderId`; `outputProductId`; quantidade efetivamente gerada (pode ser menor que o planejado — perda de processo é um fato registrado, não ocultado).

**Work Center.** Identificador; nome; capacidade nominal (opcional); ativa/inativa.

---

## 6. Value Objects

**UnitOfMeasure** — unidade de medida de uma `BOM Line` (unidade, quilograma, litro, metro), nunca implícita.

**ProductionStatus** — enum fechado do ciclo de vida de `Production Order`.

---

## 7. Commands

`CreateBillOfMaterials`, `SupersedeBillOfMaterials`, `CreateProductionOrder`, `StartProduction`, `RegisterProductionConsumption`, `RegisterProductionOutput`, `CompleteProduction`, `CancelProduction`, `CreateWorkCenter`.

Todo Command é processado exclusivamente pelo `ProductionManager` (Capítulo 10).

---

## 8. Eventos

Ver `DOMAIN_EVENT_CATALOG.md` para o contrato completo: `BillOfMaterialsCreated`, `BillOfMaterialsSuperseded`, `ProductionStarted`, `ProductionConsumption`, `ProductionOutput`, `ProductionCompleted`, `ProductionCancelled`.

---

## 9. Repository Interfaces (especificação)

```
interface BillOfMaterialsRepository {
  findActiveByProduct(outputProductId): BillOfMaterials | null
  findById(id): BillOfMaterials | null
  save(bom): void
}

interface ProductionOrderRepository {
  findById(id): ProductionOrder | null
  findByStatus(status): ProductionOrder[]
  findByOrigin(orderId): ProductionOrder[]
  save(order): void
}

interface WorkCenterRepository {
  findActive(): WorkCenter[]
  save(workCenter): void
}
```

---

## 10. Managers e Services (especificação)

**ProductionManager** é a única fachada pública — todo Command do Capítulo 7 passa exclusivamente por ele.

**BillOfMaterialsService** encapsula versionamento — toda alteração de composição cria uma nova versão (`BillOfMaterialsSuperseded` na anterior), nunca edita a existente, preservando rastreabilidade de qual versão originou cada `Production Order` histórico.

**ProductionExecutionService** é o único ponto que valida disponibilidade de insumo (consultando `Stock Position`, Inventory Movement Hub, por Query já exposta) antes de `StartProduction`, e que publica `ProductionConsumption`/`ProductionOutput`/`ProductionCompleted`.

---

## 11. Regras de Negócio

Toda `Production Order` referencia exatamente uma `Bill of Materials` ativa no momento de sua criação — uma composição superada (`Superseded`) nunca origina nova Produção, apenas Produções já em andamento continuam sob a versão que as originou.

`StartProduction` verifica disponibilidade de insumo suficiente (via Query ao Inventory Movement Hub) antes de transicionar para `InProgress` — insumo insuficiente resulta em `ProductionOrder` permanecendo `Planned`, nunca iniciada silenciosamente com déficit.

`ProductionCompleted` só é publicado após `ProductionOutput` correspondente já ter sido registrado — nunca a ordem inversa.

Divergência entre quantidade planejada e quantidade efetivamente consumida/gerada é sempre registrada como está, nunca corrigida retroativamente na `Bill of Materials` — perda de processo é dado observável de negócio, não erro de sistema a ser ocultado.

Um `Production Order` só é cancelável (`ProductionCancelled`) antes de qualquer `ProductionConsumption` já registrado — após consumo de insumo, cancelamento exige reversão explícita de estoque, modelada como novo `Stock Movement` de `ManualAdjustment`, nunca como exclusão do Production Order.

---

## 12. Fluxo Completo

```
   Bill of Materials já ativa para outputProductId
        │
   Necessidade detectada (Order sem estoque suficiente, ou
   decisão manual de reabastecimento)
        │
        ▼
   CreateProductionOrder ──► (Planned)
        │
        ▼
   StartProduction (verifica Stock Position via Query)
        │
        ├──► insumo insuficiente ──► permanece Planned
        │
        └──► insumo suficiente ──► ProductionStarted
                  │
                  ▼
             RegisterProductionConsumption ──► ProductionConsumption
                  │                             (Inventory Movement Hub:
                  │                              Stock Movement de saída)
                  ▼
             RegisterProductionOutput ──► ProductionOutput
                  │                        (Inventory Movement Hub:
                  │                         Stock Movement de entrada)
                  ▼
             CompleteProduction ──► ProductionCompleted
                  │
                  ▼
             Financial Hub (extensão): LedgerEntry de custo (COGS)
```

---

## 13. Integrações

**Commerce Hub** — toda `Bill of Materials`/`BOM Line` referencia `Product`/`Variant` por identificador; consumidor indireto de `ProductionCompleted` via `InventoryAdjusted` (Inventory Movement Hub).

**Inventory Movement Hub** — consumidor de `ProductionConsumption`/`ProductionOutput`; produtor de `Stock Position`, consultado por Query antes de `StartProduction`.

**Financial Hub (extensão)** — consumidor de `ProductionCompleted`, origem de `Ledger Entry` de custo (COGS).

**Automation Engine** — consumidor de sinal de necessidade de produção (por exemplo, `InventoryReserved` sem `Stock Position` suficiente), pode iniciar Workflow que aciona `CreateProductionOrder` — nunca decide sozinho, sempre por Regra já configurada ou confirmação humana.

**Analytics Hub** — consumidor de todo Evento deste Hub, origem de indicador de eficiência de produção (planejado vs. efetivamente consumido/gerado).

---

## 14. ADRs

**ADR-PD-001 — Production Hub e "Manufacturing Hub" são o mesmo Bounded Context.** Contexto: mesmo padrão de reconciliação de nome já aplicado a Conversation/Communication e Marketing/Growth; nome único adotado por refletir a Linguagem Ubíqua já observada nas auditorias FUN-104/105.

**ADR-PD-002 — Bill of Materials é sempre versionada, nunca editada in-place.** Contexto: preservar rastreabilidade histórica de qual composição originou cada Produção já concluída, mesma disciplina de Immutable Events aplicada a um Aggregate de configuração.

**ADR-PD-003 — Divergência entre planejado e realizado é sempre registrada, nunca corrigida silenciosamente.** Contexto: perda de processo é dado de negócio genuíno, necessário a qualquer indicador futuro de eficiência (Analytics Hub).

**ADR-PD-004 — Production Order nunca inicia com insumo insuficiente.** Contexto: preservar a garantia de que todo Stock Movement de saída por consumo de produção corresponde a estoque real e disponível, nunca projetado.

---

## 15. Glossário

**Bill of Materials (BOM)** — composição: lista de insumos necessários para produzir uma unidade de um Produto.

**Production Order** — ordem concreta de produção, referenciando uma Bill of Materials.

**Production Consumption** — registro de insumo efetivamente consumido em uma Produção.

**Production Output** — registro de Produto acabado efetivamente gerado por uma Produção.

**Work Center** — estação física ou lógica de produção, opcional.
