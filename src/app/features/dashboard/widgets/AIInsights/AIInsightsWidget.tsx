// AIInsightsWidget.tsx
//
// Responsabilidade:
// Widget mock "AI Insights". Texto estático simulando o formato de um
// insight real — não consome o AI Gateway do Core.

import { WidgetFrame } from '../../components';
import { Stack, Text } from '@/app/primitives';
import { AI_ACCENT_COLOR } from '@/design-system/foundations';
import type { WidgetDefinition, WidgetState } from '../../types';
import type { AIInsight } from '../../mocks';

export const aiInsightsDefinition: WidgetDefinition = {
  id: 'ai-insights',
  title: 'Insights de IA',
  description: 'Sugestões geradas a partir de padrões observados (simulado).',
  icon: 'success',
  size: 'lg',
  position: { x: 0, y: 4, w: 6, h: 2 },
  permissions: {},
  refreshPolicy: { mode: 'manual' },
};

export interface AIInsightsWidgetProps {
  state: WidgetState<AIInsight[]>;
  onRefresh: () => void;
}

export function AIInsightsWidget(props: AIInsightsWidgetProps) {
  const { state, onRefresh } = props;

  return (
    <WidgetFrame definition={aiInsightsDefinition} state={state} onRefresh={onRefresh} iconColor={AI_ACCENT_COLOR}>
      <Stack gap={12}>
        {(state.data ?? []).map((insight) => (
          <div key={insight.id}>
            <Text variant="caption">{insight.summary}</Text>
            <Text variant="caption" color="var(--ads-color-text-secondary)">
              Confiança: {Math.round(insight.confidence * 100)}%
            </Text>
          </div>
        ))}
      </Stack>
    </WidgetFrame>
  );
}
