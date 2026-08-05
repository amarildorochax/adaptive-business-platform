import { WidgetCard } from "@shared/components/WidgetCard";
import type { DemoSnapshot } from "@core/managers/seedDemoData";

/**
 * `CommunicationManager` não cataloga nenhuma Entidade "Notification" com Command próprio — o
 * exemplo "notificações" do escopo desta Sprint é atendido aqui pela Conversa/Mensagem mais
 * recente, o dado real mais próximo já disponível através de um Manager já aprovado (ver o
 * relatório desta Sprint, Seção "Pendências", para o registro explícito desta substituição).
 */
export function CommunicationWidget({ snapshot }: { readonly snapshot: DemoSnapshot }) {
  return (
    <WidgetCard title="Comunicação — Conversas Recentes">
      <dl>
        <dt>Conversa</dt>
        <dd>{snapshot.conversation.status}</dd>
        <dt>Última mensagem</dt>
        <dd>{snapshot.message.content}</dd>
      </dl>
    </WidgetCard>
  );
}
