// DealsPage.tsx
//
// Responsabilidade:
// Workspace completo de Negócios (Sprint 33) — 4 visualizações
// (Tabela/Kanban/Lista/Pipeline), pesquisa, filtros (etapa/responsável),
// cadastro (`NewDealModal`) e detalhe (`DealDetailModal`, com Timeline).
//
// A visualização "Kanban" aqui é uma prévia somente-leitura agrupada
// por etapa — o Drag and Drop interativo pedido pelo ESCOPO vive na
// seção "Pipeline" dedicada (`PipelinePage`), evitando duas fontes de
// verdade divergentes para o mesmo estágio dentro da mesma sessão. A
// visualização "Pipeline" aqui é um funil somente-leitura (contagem e
// valor total por etapa).

import { useMemo, useState } from 'react';
import { Stack, Flex, Grid, Text } from '@/app/primitives';
import { Button, Loading, Badge } from '@/design-system/components';
import { DealCard, PipelineColumn, DataTable, PriorityBadge, OwnerFilter, SelectFilter, FilterBar, NewDealModal, DealDetailModal } from '../components';
import type { DataTableColumn, Priority } from '../components';
import { useDeals } from '../hooks/useDeals';
import { useClients } from '../hooks/useClients';
import { usePipelineStages } from '../hooks/usePipelineStages';
import { useHistory } from '../hooks/useHistory';
import { useNotes } from '../hooks/useNotes';
import { useLocalCollection, generateId } from '../workspace';
import type { Deal } from '../types/Deal';
import type { DealFormValues } from '../components';

type ViewMode = 'table' | 'kanban' | 'list' | 'funnel';

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function priorityFor(deal: Deal): Priority {
  if (deal.probability >= 70) return 'high';
  if (deal.probability >= 40) return 'medium';
  return 'low';
}

export function DealsPage() {
  const dealsQuery = useDeals();
  const clientsQuery = useClients();
  const stagesQuery = usePipelineStages();
  const historyQuery = useHistory();
  const notesQuery = useNotes();

  const deals = useLocalCollection(dealsQuery.data);
  const history = useLocalCollection(historyQuery.data);

  const [view, setView] = useState<ViewMode>('list');
  const [stageFilter, setStageFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [modal, setModal] = useState<{ deal?: Deal } | null>(null);

  const loading = dealsQuery.loading || clientsQuery.loading || stagesQuery.loading;

  const clientsById = useMemo(() => new Map(clientsQuery.data.map((client) => [client.id, client])), [clientsQuery.data]);
  const stageNameById = useMemo(() => new Map(stagesQuery.data.map((stage) => [stage.id, stage.name])), [stagesQuery.data]);
  const sortedStages = useMemo(() => [...stagesQuery.data].sort((a, b) => a.order - b.order), [stagesQuery.data]);
  const owners = useMemo(() => Array.from(new Set(deals.items.map((deal) => deal.ownerName).filter(Boolean))), [deals.items]);

  const filteredDeals = useMemo(
    () =>
      deals.items.filter(
        (deal) => (!stageFilter || deal.stageId === stageFilter) && (!ownerFilter || deal.ownerName === ownerFilter),
      ),
    [deals.items, stageFilter, ownerFilter],
  );

  function handleCreateOrUpdate(values: DealFormValues, editingId?: string) {
    const payload = {
      title: values.title,
      clientId: values.clientId,
      companyId: clientsById.get(values.clientId)?.companyId ?? null,
      value: Number(values.value) || 0,
      probability: Number(values.probability) || 0,
      stageId: values.stageId,
      ownerName: values.ownerName,
      expectedCloseDate: values.expectedCloseDate,
      source: values.source,
      notes: values.notes,
    };

    if (editingId) {
      deals.update(editingId, payload);
      history.add({
        id: generateId('history'),
        entityType: 'deal',
        entityId: editingId,
        action: 'Negócio atualizado.',
        actor: 'Usuário Demo',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const id = generateId('deal');
    deals.add({ id, ...payload });
    history.add({
      id: generateId('history'),
      entityType: 'deal',
      entityId: id,
      action: 'Negócio criado.',
      actor: 'Usuário Demo',
      timestamp: new Date().toISOString(),
    });
  }

  if (loading) {
    return <Loading label="Carregando negócios…" />;
  }

  const selectedDeal: Deal | null = selectedDealId ? deals.items.find((deal) => deal.id === selectedDealId) ?? null : null;

  const columns: DataTableColumn<Deal>[] = [
    { key: 'title', header: 'Título', sortKey: 'title', render: (row) => row.title },
    { key: 'client', header: 'Cliente', render: (row) => clientsById.get(row.clientId)?.name ?? '—' },
    { key: 'value', header: 'Valor', sortKey: 'value', render: (row) => formatCurrency(row.value) },
    { key: 'stage', header: 'Etapa', render: (row) => <Badge variant="info">{stageNameById.get(row.stageId) ?? '—'}</Badge> },
    { key: 'priority', header: 'Prioridade', sortKey: 'probability', render: (row) => <PriorityBadge priority={priorityFor(row)} /> },
    { key: 'owner', header: 'Responsável', sortKey: 'ownerName', render: (row) => row.ownerName || '—' },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <Button variant="neutral" size="sm" onClick={() => setSelectedDealId(row.id)}>
          Ver
        </Button>
      ),
    },
  ];

  return (
    <Stack gap={16}>
      <Flex justify="space-between" align="center" wrap gap={12}>
        <Text variant="body" style={{ fontWeight: 600 }}>
          {filteredDeals.length} {filteredDeals.length === 1 ? 'negócio' : 'negócios'}
        </Text>
        <Flex gap={8} wrap>
          <Button variant={view === 'table' ? 'primary' : 'neutral'} size="sm" onClick={() => setView('table')}>
            Tabela
          </Button>
          <Button variant={view === 'kanban' ? 'primary' : 'neutral'} size="sm" onClick={() => setView('kanban')}>
            Kanban
          </Button>
          <Button variant={view === 'list' ? 'primary' : 'neutral'} size="sm" onClick={() => setView('list')}>
            Lista
          </Button>
          <Button variant={view === 'funnel' ? 'primary' : 'neutral'} size="sm" onClick={() => setView('funnel')}>
            Pipeline
          </Button>
          <Button variant="primary" size="sm" onClick={() => setModal({})}>
            Novo Negócio
          </Button>
        </Flex>
      </Flex>

      <FilterBar>
        <SelectFilter label="Etapa" value={stageFilter} onChange={setStageFilter} options={sortedStages.map((stage) => ({ value: stage.id, label: stage.name }))} allLabel="Todas as etapas" />
        <OwnerFilter value={ownerFilter} onChange={setOwnerFilter} owners={owners} />
      </FilterBar>

      {view === 'table' && (
        <DataTable
          data={filteredDeals}
          columns={columns}
          searchableFields={['title', 'ownerName', 'source']}
          getRowKey={(row) => row.id}
          searchPlaceholder="Pesquisar por título, responsável ou origem…"
          emptyTitle="Nenhum negócio encontrado"
        />
      )}

      {view === 'list' &&
        (filteredDeals.length === 0 ? (
          <Text variant="caption" color="var(--ads-color-text-auxiliary)">
            Nenhum negócio encontrado.
          </Text>
        ) : (
          <Grid columns={3} gap={16} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {filteredDeals.map((deal) => (
              <div key={deal.id} onClick={() => setSelectedDealId(deal.id)} style={{ cursor: 'pointer' }}>
                <DealCard deal={deal} clientName={clientsById.get(deal.clientId)?.name} />
              </div>
            ))}
          </Grid>
        ))}

      {view === 'kanban' && (
        <Flex gap={16} style={{ overflowX: 'auto' }}>
          {sortedStages.map((stage) => (
            <PipelineColumn
              key={stage.id}
              stage={stage}
              deals={filteredDeals.filter((deal) => deal.stageId === stage.id)}
              clientsById={clientsById}
              onCardClick={(deal) => setSelectedDealId(deal.id)}
            />
          ))}
        </Flex>
      )}

      {view === 'funnel' && (
        <Stack gap={8}>
          {sortedStages.map((stage) => {
            const stageDeals = filteredDeals.filter((deal) => deal.stageId === stage.id);
            const total = stageDeals.reduce((sum, deal) => sum + deal.value, 0);
            const maxTotal = Math.max(
              1,
              ...sortedStages.map((s) => filteredDeals.filter((deal) => deal.stageId === s.id).reduce((sum, deal) => sum + deal.value, 0)),
            );

            return (
              <Flex key={stage.id} align="center" gap={12}>
                <div style={{ width: 140 }}>
                  <Text variant="caption">{stage.name}</Text>
                </div>
                <div style={{ flex: 1, backgroundColor: 'var(--ads-color-surface)', borderRadius: 'var(--ads-radius-sm)', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.max(4, (total / maxTotal) * 100)}%`,
                      backgroundColor: stage.isWon ? 'var(--ads-color-success)' : stage.isLost ? 'var(--ads-color-danger)' : 'var(--ads-color-primary)',
                      padding: '6px 10px',
                      color: 'var(--ads-color-on-solid, #ffffff)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Text variant="caption" color="inherit">
                      {stageDeals.length} · {formatCurrency(total)}
                    </Text>
                  </div>
                </div>
              </Flex>
            );
          })}
        </Stack>
      )}

      <NewDealModal
        isOpen={modal !== null}
        onClose={() => setModal(null)}
        clients={clientsQuery.data}
        stages={sortedStages}
        deal={modal?.deal}
        onSubmit={(values) => handleCreateOrUpdate(values, modal?.deal?.id)}
      />

      <DealDetailModal
        isOpen={selectedDeal !== null}
        onClose={() => setSelectedDealId(null)}
        deal={selectedDeal}
        client={selectedDeal ? clientsById.get(selectedDeal.clientId) : undefined}
        stageName={selectedDeal ? stageNameById.get(selectedDeal.stageId) : undefined}
        history={history.items.filter((entry) => entry.entityType === 'deal' && entry.entityId === selectedDeal?.id)}
        notes={notesQuery.data.filter((note) => note.entityType === 'deal' && note.entityId === selectedDeal?.id)}
      />
    </Stack>
  );
}
