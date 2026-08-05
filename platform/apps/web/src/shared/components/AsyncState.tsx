import type { ReactNode } from "react";
import { Button } from "@shared/components/ui/Button";
import { Alert } from "@shared/components/ui/Alert";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { Spinner } from "@shared/components/ui/Spinner";

/**
 * Estado padronizado de carregamento/erro/vazio reaproveitado por todo widget do Dashboard —
 * único lugar onde esses três estados são desenhados, nunca reimplementados widget a widget.
 * Restilizado na UX-001 sobre os primitivos do Design System — API idêntica, nenhuma página
 * consumidora precisou mudar.
 */
export interface AsyncStateProps {
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly error?: unknown;
  readonly isEmpty?: boolean;
  readonly emptyLabel?: string;
  readonly onRetry?: () => void;
  readonly children: ReactNode;
}

export function AsyncState({ isLoading, isError, error, isEmpty, emptyLabel, onRetry, children }: AsyncStateProps) {
  if (isLoading) {
    return (
      <div className="async-state async-state--loading" role="status">
        <Spinner />
        <span>Carregando…</span>
      </div>
    );
  }

  if (isError) {
    const message = error instanceof Error ? error.message : "Ocorreu um erro inesperado.";

    return (
      <Alert tone="danger">
        <p>{message}</p>
        {onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Tentar novamente
          </Button>
        )}
      </Alert>
    );
  }

  if (isEmpty) {
    return <EmptyState title={emptyLabel ?? "Nenhum dado disponível ainda."} />;
  }

  return <>{children}</>;
}
