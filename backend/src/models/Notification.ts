export interface Notification {
    id: number;
    user_id: number;
    message: string;
    is_read: boolean;
    created_at: Date;
}

export interface NotificationCreate {
    user_id: number;
    message: string;
}
