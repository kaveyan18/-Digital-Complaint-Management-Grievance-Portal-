
import cron from 'node-cron';
import pool from '../config/database';

// cron job running every 5 minutes
export const startSLAJob = () => {
    cron.schedule('*/5 * * * *', async () => {
        console.log('Running SLA check...');
        try {
            // Check for overdue complaints that are not resolved and not yet escalated
            const [result] = await pool.execute(
                `UPDATE complaints 
                 SET is_escalated = TRUE 
                 WHERE status != 'Resolved' 
                 AND is_escalated = FALSE 
                 AND sla_deadline < NOW()`
            );
            // @ts-ignore
            if (result.affectedRows > 0) {
                // @ts-ignore
                console.log(`SLA Escalation: ${result.affectedRows} complaints escalated.`);
                // In a real app, trigger email notifications here
            }
        } catch (err) {
            console.error('SLA Check failed:', err);
        }
    });

    // Auto-Assignment Job (runs every 1 minute)
    cron.schedule('*/1 * * * *', async () => {
        console.log('Running Auto-Assignment check...');
        try {
            // 1. Get Open, Unassigned Complaints
            const [complaints] = await pool.execute<any[]>(`
                SELECT * FROM complaints WHERE status = 'Open' AND staff_id IS NULL 
             `);

            if (complaints.length === 0) return;

            // 2. Get All Staff with skills
            const [staffList] = await pool.execute<any[]>(`
                SELECT id, skills FROM users WHERE role = 'Staff'
             `);

            for (const c of complaints) {
                const eligibleStaff = staffList.filter(s => {
                    // Check if staff has skill matching category
                    if (!s.skills) return false;
                    // Simple check: description/category match
                    // Assuming skills are stored as JSON string like ["Plumbing", "Electrical"]
                    // And category is one of those or maps to it
                    try {
                        const skills = JSON.parse(s.skills) as string[];
                        // Map category to skill (basic mapping)
                        const categoryRec = c.category.toLowerCase();
                        return skills.some(skill => skill.toLowerCase().includes(categoryRec));
                    } catch (e) { return false; }
                });

                if (eligibleStaff.length > 0) {
                    // 3. Find staff with least active complaints
                    let selectedStaff = null;
                    let minLoad = Infinity;

                    for (const s of eligibleStaff) {
                        const [load] = await pool.execute<any[]>(
                            `SELECT COUNT(*) as count FROM complaints WHERE staff_id = ? AND status != 'Resolved'`,
                            [s.id]
                        );
                        const activeCount = load[0].count;
                        if (activeCount < minLoad) {
                            minLoad = activeCount;
                            selectedStaff = s;
                        }
                    }

                    if (selectedStaff) {
                        console.log(`Auto-Assigning Complaint ${c.id} to Staff ${selectedStaff.id}`);

                        // Update complaint
                        await pool.execute(
                            `UPDATE complaints SET staff_id = ?, status = 'Assigned' WHERE id = ?`,
                            [selectedStaff.id, c.id]
                        );

                        // Log the action for Audit Trail
                        // We do this manually here since we bypass the service for speed/simplicity in cron
                        await pool.execute(
                            'INSERT INTO complaint_logs (complaint_id, user_id, action, details) VALUES (?, ?, ?, ?)',
                            [c.id, null, 'AUTO_ASSIGNED', JSON.stringify({ staff_id: selectedStaff.id, note: 'Automatically assigned based on workload' })]
                        );
                        // TODO: Notify staff
                    }
                }
            }

        } catch (err) {
            console.error('Auto-Assignment failed:', err);
        }
    });
};
