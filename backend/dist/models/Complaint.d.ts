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
export interface ComplaintCreate {
    user_id: number;
    title: string;
    description: string;
    category: 'plumbing' | 'electrical' | 'facility' | 'other';
    attachments?: string;
}
export interface ComplaintUpdate {
    status?: 'Open' | 'Assigned' | 'In-progress' | 'Resolved';
    staff_id?: number;
    resolution_notes?: string;
}
export interface ComplaintWithUser extends Complaint {
    user_name?: string;
    user_email?: string;
    staff_name?: string;
}
//# sourceMappingURL=Complaint.d.ts.map