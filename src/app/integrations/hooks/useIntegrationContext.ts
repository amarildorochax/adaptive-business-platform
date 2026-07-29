// useIntegrationContext.ts
//
// Responsabilidade:
// Hook interno de acesso ao `IntegrationContext` — usado por todos os
// demais Hooks públicos deste diretório. Não exportado no barrel de
// topo da camada de integração (uso interno apenas).

import { useContext } from 'react';
import { IntegrationContext, type IntegrationContextValue } from '../providers/IntegrationContext';

export function useIntegrationContext(): IntegrationContextValue {
  const context = useContext(IntegrationContext);

  if (!context) {
    throw new Error('Hooks de integração devem ser usados dentro de um <CoreIntegrationProvider>.');
  }

  return context;
}
