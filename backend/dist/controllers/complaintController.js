"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComplaintStats = exports.deleteComplaint = exports.updateComplaint = exports.getComplaintById = exports.getComplaints = exports.createComplaint = void 0;
const database_1 = __importDefault(require("../config/database"));
// Create new complaint
const createComplaint = async (req, res) => {
    try {
        const { user_id, title, description, category, attachments } = req.body;
        // Validation
        if (!user_id || !title || !description || !category) {
            res.status(400).json({ message: 'User ID, title, description, and category are required' });
            return;
        }
        // Validate category
        if (!['plumbing', 'electrical', 'facility', 'other'].includes(category)) {
            res.status(400).json({ message: 'Category must be plumbing, electrical, facility, or other' });
            return;
        }
        // Insert complaint
        const [result] = await database_1.default.execute('INSERT INTO complaints (user_id, title, description, category, attachments, status) VALUES (?, ?, ?, ?, ?, ?)', [user_id, title, description, category, attachments || null, 'Open']);
        res.status(201).json({
            message: 'Complaint submitted successfully',
            complaint: {
                id: result.insertId,
                user_id,
                title,
                description,
                category,
                status: 'Open',
                attachments
            }
        });
    }
    catch (error) {
        console.error('Create complaint error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createComplaint = createComplaint;
// Get all complaints (filtered by role)
const getComplaints = async (req, res) => {
    try {
        const { user_id, role, staff_id } = req.query;
        let query = `
      SELECT c.*, 
             u.name as user_name, u.email as user_email,
             s.name as staff_name
      FROM complaints c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN users s ON c.staff_id = s.id
    `;
        const params = [];
        // Filter based on role
        if (role === 'User' && user_id) {
            query += ' WHERE c.user_id = ?';
            params.push(user_id);
        }
        else if (role === 'Staff' && staff_id) {
            query += ' WHERE c.staff_id = ?';
            params.push(staff_id);
        }
        query += ' ORDER BY c.created_at DESC';
        const [complaints] = await database_1.default.execute(query, params);
        res.status(200).json({ complaints });
    }
    catch (error) {
        console.error('Get complaints error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getComplaints = getComplaints;
// Get complaint by ID
const getComplaintById = async (req, res) => {
    try {
        const { id } = req.params;
        const [complaints] = await database_1.default.execute(`SELECT c.*, 
              u.name as user_name, u.email as user_email,
              s.name as staff_name
       FROM complaints c
       LEFT JOIN users u ON c.user_id = u.id
       LEFT JOIN users s ON c.staff_id = s.id
       WHERE c.id = ?`, [id]);
        if (complaints.length === 0) {
            res.status(404).json({ message: 'Complaint not found' });
            return;
        }
        res.status(200).json({ complaint: complaints[0] });
    }
    catch (error) {
        console.error('Get complaint error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getComplaintById = getComplaintById;
// Update complaint (status, staff assignment, resolution notes)
const updateComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, staff_id, resolution_notes } = req.body;
        // Build update query dynamically
        const updates = [];
        const params = [];
        if (status) {
            // Validate status flow: Open → Assigned → In-progress → Resolved
            const validStatuses = ['Open', 'Assigned', 'In-progress', 'Resolved'];
            if (!validStatuses.includes(status)) {
                res.status(400).json({ message: 'Invalid status value' });
                return;
            }
            updates.push('status = ?');
            params.push(status);
        }
        if (staff_id !== undefined) {
            updates.push('staff_id = ?');
            params.push(staff_id);
            // If assigning staff and status is Open, set to Assigned
            if (!status) {
                updates.push('status = ?');
                params.push('Assigned');
            }
        }
        if (resolution_notes) {
            updates.push('resolution_notes = ?');
            params.push(resolution_notes);
        }
        if (updates.length === 0) {
            res.status(400).json({ message: 'No update fields provided' });
            return;
        }
        params.push(id);
        const [result] = await database_1.default.execute(`UPDATE complaints SET ${updates.join(', ')} WHERE id = ?`, params);
        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Complaint not found' });
            return;
        }
        // Fetch updated complaint
        const [complaints] = await database_1.default.execute('SELECT * FROM complaints WHERE id = ?', [id]);
        res.status(200).json({ message: 'Complaint updated successfully', complaint: complaints[0] });
    }
    catch (error) {
        console.error('Update complaint error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateComplaint = updateComplaint;
// Delete complaint
const deleteComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await database_1.default.execute('DELETE FROM complaints WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Complaint not found' });
            return;
        }
        res.status(200).json({ message: 'Complaint deleted successfully' });
    }
    catch (error) {
        console.error('Delete complaint error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteComplaint = deleteComplaint;
// Get complaint statistics (for admin dashboard - optional)
const getComplaintStats = async (req, res) => {
    try {
        const [statusStats] = await database_1.default.execute('SELECT status, COUNT(*) as count FROM complaints GROUP BY status');
        const [categoryStats] = await database_1.default.execute('SELECT category, COUNT(*) as count FROM complaints GROUP BY category');
        const [totalCount] = await database_1.default.execute('SELECT COUNT(*) as total FROM complaints');
        res.status(200).json({
            total: totalCount[0].total,
            byStatus: statusStats,
            byCategory: categoryStats
        });
    }
    catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getComplaintStats = getComplaintStats;
//# sourceMappingURL=complaintController.js.map