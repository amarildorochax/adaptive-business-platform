// Activity.ts
//
// Responsabilidade:
// Contrato de "Atividade" do CRM — registro de interação com um
// cliente/negócio. `type` cobre os 7 canais exigidos pelo ESCOPO.

export type ActivityType = 'call' | 'whatsapp' | 'email' | 'meeting' | 'task' | 'visit' | 'note';

export type ActivityStatus = 'pending' | 'completed' | 'canceled';

export interface Activity {
  id: string;
  type: ActivityType;
  clientId: string | null;
  dealId: string | null;
  date: string;
  time: string;
  ownerName: string;
  description: string;
  status: ActivityStatus;
}
