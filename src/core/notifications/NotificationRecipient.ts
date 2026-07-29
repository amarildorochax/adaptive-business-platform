/**
 * Destinatário — associa um endereço/alvo de entrega (`destination`,
 * texto livre: e-mail, telefone, token de dispositivo, URL de webhook)
 * a um NotificationChannel (Tarefa 06).
 */
export interface NotificationRecipient {
  id: string;

  destination: string;

  channelId: string;

  createdAt: Date;
}
