// CompanyDetailPage.tsx
//
// Responsabilidade:
// Página de detalhe de uma Empresa — dados cadastrais, observações,
// timeline, clientes vinculados e negócios vinculados.

import { Stack, Flex, Grid, Text, Heading } from '@/app/primitives';
import { Button } from '@/design-system/components';
import { CRMCard, StatusBadge, ClientCard, DealCard, Timeline } from '../components';
import type { Company } from '../types/Company';
import type { Client } from '../types/Client';
import type { Deal } from '../types/Deal';
import type { Note } from '../types/Note';
import type { HistoryEntry } from '../types/HistoryEntry';

const SIZE_LABEL: Record<Company['size'], string> = {
  micro: 'Microempresa',
  pequena: 'Pequena empresa',
  media: 'Média empresa',
  grande: 'Grande empresa',
};

export interface CompanyDetailPageProps {
  company: Company;
  clients: Client[];
  deals: Deal[];
  notes: Note[];
  history: HistoryEntry[];
  onBack: () => void;
  onEdit: () => void;
}

export function CompanyDetailPage(props: CompanyDetailPageProps) {
  const { company, clients, deals, notes, history, onBack, onEdit } = props;

  return (
    <Stack gap={20}>
      <Flex justify="space-between" align="center">
        <Button variant="neutral" size="sm" onClick={onBack}>
          ← Voltar
        </Button>
        <Button variant="primary" size="sm" onClick={onEdit}>
          Editar Empresa
        </Button>
      </Flex>

      <CRMCard>
        <Stack gap={12}>
          <Flex justify="space-between" align="center" wrap>
            <Heading level={2} variant="heading">
              {company.name}
            </Heading>
            <StatusBadge status={company.status} />
          </Flex>

          <Text variant="body" color="var(--ads-color-text-secondary)">
            {company.tradeName} · {SIZE_LABEL[company.size]} · {company.segment}
          </Text>

          <Grid columns={2} gap={8} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <Text variant="caption">CNPJ: {company.cnpj || '—'}</Text>
            <Text variant="caption">Responsável: {company.ownerName || '—'}</Text>
            <Text variant="caption">E-mail: {company.email}</Text>
            <Text variant="caption">Telefone: {company.phone}</Text>
            <Text variant="caption">WhatsApp: {company.whatsapp}</Text>
            <Text variant="caption">Website: {company.website || '—'}</Text>
            <Text variant="caption">
              Endereço: {company.address}, {company.city}/{company.state}
            </Text>
            <Text variant="caption">Cadastrada em: {new Date(company.createdAt).toLocaleDateString('pt-BR')}</Text>
          </Grid>
        </Stack>
      </CRMCard>

      <Grid columns={2} gap={20} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', alignItems: 'start' }}>
        <CRMCard title="Clientes Vinculados">
          {clients.length === 0 ? (
            <Text variant="caption" color="var(--ads-color-text-auxiliary)">
              Nenhum cliente vinculado.
            </Text>
          ) : (
            <Stack gap={12}>
              {clients.map((client) => (
                <ClientCard key={client.id} client={client} />
              ))}
            </Stack>
          )}
        </CRMCard>

        <CRMCard title="Negócios">
          {deals.length === 0 ? (
            <Text variant="caption" color="var(--ads-color-text-auxiliary)">
              Nenhum negócio vinculado.
            </Text>
          ) : (
            <Stack gap={12}>
              {deals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </Stack>
          )}
        </CRMCard>

        <CRMCard title="Observações">
          {notes.length === 0 ? (
            <Text variant="caption" color="var(--ads-color-text-auxiliary)">
              Nenhuma observação registrada.
            </Text>
          ) : (
            <Stack gap={12}>
              {notes.map((note) => (
                <Stack key={note.id} gap={2}>
                  <Text variant="caption">{note.content}</Text>
                  <Text variant="caption" color="var(--ads-color-text-auxiliary)">
                    {note.author} · {new Date(note.createdAt).toLocaleString('pt-BR')}
                  </Text>
                </Stack>
              ))}
            </Stack>
          )}
        </CRMCard>
      </Grid>

      <CRMCard title="Histórico">
        <Timeline entries={history} />
      </CRMCard>
    </Stack>
  );
}
