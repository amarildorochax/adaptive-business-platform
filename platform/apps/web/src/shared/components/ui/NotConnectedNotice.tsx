import { Alert } from "./Alert";

export interface NotConnectedNoticeProps {
  readonly fields: readonly string[];
  /** Nome do domínio/Manager sem o endpoint — ex.: "Business Profile Engine", "Branding Hub". */
  readonly context?: string;
}

/**
 * Aviso reutilizável para qualquer seção que exiba campos ainda não suportados pela API existente —
 * primeiro uso em `pages/business-profile/sections/*` (FUN-101), generalizado com o prop `context` na
 * FUN-102 para ser reutilizado por `pages/branding/sections/*`. Escrito como primitivo genérico
 * (`shared/components/ui/`) para qualquer futura Sprint no mesmo cenário: dado real ainda não
 * exposto por nenhum Manager/endpoint. Nunca esconde essa limitação — nomeia exatamente quais campos
 * são apenas rascunho local, nunca sincronizado com o servidor.
 */
export function NotConnectedNotice({ fields, context = "Business Profile Engine" }: NotConnectedNoticeProps) {
  return (
    <Alert tone="info">
      <p>
        <strong>{fields.join(", ")}</strong> ainda não {fields.length > 1 ? "são suportados" : "é suportado"} pela API do {context}. Os valores abaixo ficam salvos apenas neste navegador
        (rascunho local) — nunca no servidor, até que uma Sprint futura estenda o Backend.
      </p>
    </Alert>
  );
}
