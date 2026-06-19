import {
  NotificationReader,
  NotificationView,
} from "../ports/notification-reader";

/** NotificationReader fake para testes. */
export class FakeNotificationReader implements NotificationReader {
  public items: NotificationView[] = [];
  public markAllReadCalls = 0;

  async listByClinic(): Promise<NotificationView[]> {
    return this.items;
  }

  async countUnread(): Promise<number> {
    return this.items.filter((item) => item.readAt === null).length;
  }

  async markAllRead(): Promise<void> {
    this.markAllReadCalls += 1;
    this.items = this.items.map((item) => ({
      ...item,
      readAt: item.readAt ?? new Date(),
    }));
  }
}
