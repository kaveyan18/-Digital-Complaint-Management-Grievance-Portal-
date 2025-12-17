"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const complaintController_1 = require("../controllers/complaintController");
const router = (0, express_1.Router)();
// GET /api/complaints/stats - Get complaint statistics (optional - admin)
router.get('/stats', complaintController_1.getComplaintStats);
// POST /api/complaints - Create new complaint
router.post('/', complaintController_1.createComplaint);
// GET /api/complaints - Get all complaints (filtered by role/user)
router.get('/', complaintController_1.getComplaints);
// GET /api/complaints/:id - Get complaint by ID
router.get('/:id', complaintController_1.getComplaintById);
// PUT /api/complaints/:id - Update complaint (status, assignment, notes)
router.put('/:id', complaintController_1.updateComplaint);
// DELETE /api/complaints/:id - Delete complaint
router.delete('/:id', complaintController_1.deleteComplaint);
exports.default = router;
//# sourceMappingURL=complaintRoutes.js.map