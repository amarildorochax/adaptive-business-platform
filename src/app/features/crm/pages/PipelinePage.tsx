// PipelinePage.tsx
//
// Responsabilidade:
// Quadro Kanban do Pipeline de vendas — uma `PipelineColumn` por
// `CrmPipelineStage` (ordenadas por `order`), com os `Deal`s
// distribuídos por `stageId`.
//
// Sprint 33 (Adaptive CRM Workspace): Drag and Drop real entre etapas
// (HTML5 nativo, via `PipelineColumn`/`PipelineCard`) — solta o negócio
// numa coluna e o estágio é atualizado visualmente na hora, através de
// `useLocalCollection` (100% em memória; "sem persistência externa",
// exatamente como pedido pelo ESCOPO). Um evento é adicionado ao
// Histórico do negócio a cada movimentação.

import { useState } from 'react';
import { Flex } from '@/app/primitives';
import { Loading, EmptyState } from '@/design-system/components';
import { PipelineColumn, DealDetailModal } from '../components';
import { useDeals } from '../hooks/useDeals';
import { useClients } from '../hooks/useClients';
import { usePipelineStages } from '../hooks/usePipelineStages';
import { useHistory } from '../hooks/useHistory';
import { useNotes } from '../hooks/useNotes';
import { useLocalCollection, generateId } from '../workspace';
import type { Deal } from '../types/Deal';

export function PipelinePage() {
  const { data: stages, loading: loadingStages } = usePipelineStages();
  const dealsQuery = useDeals();
  const { data: clients, loading: loadingClients } = useClients();
  const historyQuery = useHistory();
  const notesQuery = useNotes();

  const deals = useLocalCollection(dealsQuery.data);
  const history = useLocalCollection(historyQuery.data);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);

  const loading = loadingStages || dealsQuery.loading || loadingClients;

  if (loading) {
    return <Loading label="Carregando pipeline…" />;
  }

  if (stages.length === 0) {
    return <EmptyState title="Nenhuma etapa configurada" description="Configure as etapas do pipeline para começar." />;
  }

  const clientsById = new Map(clients.map((client) => [client.id, client]));
  const sortedStages = [...stages].sort((a, b) => a.order - b.order);
  const stageNameById = new Map(stages.map((stage) => [stage.id, stage.name]));

  function handleDrop(dealId: string, stageId: string) {
    const deal = deals.items.find((item) => item.id === dealId);
    if (!deal || deal.stageId === stageId) return;

    deals.update(dealId, { stageId });
    history.add({
      id: generateId('history'),
      entityType: 'deal',
      entityId: dealId,
      action: `Negócio movido para "${stageNameById.get(stageId) ?? stageId}".`,
      actor: 'Usuário Demo',
      timestamp: new Date().toISOString(),
    });
  }

  const selectedDeal: Deal | null = selectedDealId ? deals.items.find((deal) => deal.id === selectedDealId) ?? null : null;

  return (
    <>
      <Flex gap={16} style={{ overflowX: 'auto' }}>
        {sortedStages.map((stage) => (
          <PipelineColumn
            key={stage.id}
            stage={stage}
            deals={deals.items.filter((deal) => deal.stageId === stage.id)}
            clientsById={clientsById}
            onDropDeal={handleDrop}
            onCardClick={(deal) => setSelectedDealId(deal.id)}
          />
        ))}
      </Flex>

      <DealDetailModal
        isOpen={selectedDeal !== null}
        onClose={() => setSelectedDealId(null)}
        deal={selectedDeal}
        client={selectedDeal ? clientsById.get(selectedDeal.clientId) : undefined}
        stageName={selectedDeal ? stageNameById.get(selectedDeal.stageId) : undefined}
        history={history.items.filter((entry) => entry.entityType === 'deal' && entry.entityId === selectedDeal?.id)}
        notes={notesQuery.data.filter((note) => note.entityType === 'deal' && note.entityId === selectedDeal?.id)}
      />
    </>
  );
}
