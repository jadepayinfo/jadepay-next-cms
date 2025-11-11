export interface Notification {
    id: string;
    subject: string;
    description: string;
    img_url: string;
    specific_users: string[];
    created_at: string;
}
