// Complaint model matching backend
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
    resolution_attachments?: string | null;
    complaint_unique_id?: string;
    rating?: number | null;
    feedback?: string | null;
    created_at?: Date;
    updated_at?: Date;
    user_name?: string;
    user_email?: string;
    staff_name?: string;
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

export interface ComplaintStats {
    total: number;
    resolved: number;
    activeStaff: number;
    avgResolutionTime: number;
    byStatus: { status: string; count: number }[];
    byCategory: { category: string; count: number }[];
    staffPerformance?: { name: string; resolved_count: number }[];
}
