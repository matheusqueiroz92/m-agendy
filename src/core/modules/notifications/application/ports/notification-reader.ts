export interface NotificationView {
  id: string;
  type: string;
  title: string;
  appointmentId: string | null;
  readAt: Date | null;
  createdAt: Date;
}

/** Leitura/baixa de notificações in-app da clínica. */
export interface NotificationReader {
  listByClinic(clinicId: string, limit?: number): Promise<NotificationView[]>;
  countUnread(clinicId: string): Promise<number>;
  markAllRead(clinicId: string): Promise<void>;
}
