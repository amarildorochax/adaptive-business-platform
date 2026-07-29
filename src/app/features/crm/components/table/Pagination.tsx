// Pagination.tsx
//
// Responsabilidade:
// Paginação reutilizável — página atual, total de páginas, contador de
// registros.

import { Flex, Text } from '@/app/primitives';
import { Button } from '@/design-system/components';

export interface PaginationProps {
  page: number;
  pageCount: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export function Pagination(props: PaginationProps) {
  const { page, pageCount, totalCount, onPageChange } = props;

  return (
    <Flex justify="space-between" align="center" wrap gap={12}>
      <Text variant="caption" color="var(--ads-color-text-auxiliary)">
        {totalCount} {totalCount === 1 ? 'registro' : 'registros'}
      </Text>
      <Flex align="center" gap={8}>
        <Button variant="neutral" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Anterior
        </Button>
        <Text variant="caption">
          Página {page} de {pageCount}
        </Text>
        <Button variant="neutral" size="sm" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
          Próxima
        </Button>
      </Flex>
    </Flex>
  );
}
