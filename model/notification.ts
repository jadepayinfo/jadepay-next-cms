export interface Notification {
  id: string;
  topic: string | null;
  type: string;
  subject:  string | null;
  description:  string | null;
  img_url: string;
  specific_users: string[];
  created_at: string;
}

// Shared types for notification content
export interface NotificationContent {
  subject: string;
  description: string;
}

export interface MultiLanguageNotificationDetail {
  [languageCode: string]: NotificationContent;
}

// Base interface for notification payloads
interface BaseNotificationPayload {
  image_url: string | null;
  default_language: string;
  detail: MultiLanguageNotificationDetail;
}

export interface PayloadBroadCastNotification extends BaseNotificationPayload {
  topic:  string | null;
}

export interface PayloadTopicNotification extends BaseNotificationPayload {
  specific_users: string[];
}

export interface PayloadBulkTopicNotification {
  items: PayloadTopicNotification[];
}
