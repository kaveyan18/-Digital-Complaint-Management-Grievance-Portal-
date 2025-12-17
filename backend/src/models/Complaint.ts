// Complaint interface matching database schema
export interface Complaint {
    id?: number;
    user_id: number;
    staff_id?: number | null;
    title: string;
    description: string;
    category: 'plumbing' | 'electrical' | 'facility' | 'other';
    status: 'Open' | 'Assigned' | 'In-progress' | 'Resolved';
    attachments?: string | null;
    resolution_notes?: string | null;
    created_at?: Date;
    updated_at?: Date;
}

// Complaint creation request
export interface ComplaintCreate {
    user_id: number;
    title: string;
    description: string;
    category: 'plumbing' | 'electrical' | 'facility' | 'other';
    attachments?: string;
}

// Complaint update request
export interface ComplaintUpdate {
    status?: 'Open' | 'Assigned' | 'In-progress' | 'Resolved';
    staff_id?: number;
    resolution_notes?: string;
}

// Complaint response with user info
export interface ComplaintWithUser extends Complaint {
    user_name?: string;
    user_email?: string;
    staff_name?: string;
}
