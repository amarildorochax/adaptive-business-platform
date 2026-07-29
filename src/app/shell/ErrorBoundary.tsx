// ErrorBoundary.tsx
//
// Responsabilidade:
// Error Boundary de infraestrutura (React exige um componente de
// classe para isso — não há equivalente em função). Captura erros de
// renderização em qualquer ponto da árvore do Shell/Layouts e exibe um
// fallback genérico em vez de derrubar a aplicação inteira.

import { Component, type ErrorInfo, type ReactNode } from 'react';

export interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary] Erro capturado na árvore do Frontend Foundation:', error, info.componentStack);
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    const { children, fallback } = this.props;

    if (error) {
      return fallback ? (
        fallback(error, this.reset)
      ) : (
        <div role="alert">
          <strong>Algo deu errado.</strong>
          <button type="button" onClick={this.reset}>
            Tentar novamente
          </button>
        </div>
      );
    }

    return children;
  }
}
