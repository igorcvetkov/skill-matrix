const express = require("express");
const router = express.Router();
const ProjectMemberService = require("../services/project-member-service");
const { validateToken } = require("../auth");
const db = require("../config/database");

router.post("/", validateToken, async (req, res) => {
    const { personId, projectId, startDate, endDate } = req.body;
    const userOid = req.user?.oid;

    if (!personId || !projectId) {
        return res.status(400).json({ error: "personId and projectId are required" });
    }

    if (!userOid) {
        return res.status(401).json({ error: "Unauthorized: OID not found" });
    }

    try {
        // Get the current user's role
        const [[user]] = await db.promise().query(
            "SELECT role_id FROM person WHERE oid = ? LIMIT 1",
            [userOid]
        );

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.role_id !== 1) {
            return res.status(403).json({ error: "Forbidden: Only admins can assign project members" });
        }

        // Only admins get here
        const result = await ProjectMemberService.addMember({ personId, projectId, startDate, endDate });
        res.status(201).json({ message: "Project member added", ...result });
    } catch (err) {
        console.error("Error adding project member:", err);
        res.status(500).json({ error: "Failed to add project member", exception: err });
    }
});

module.exports = router;
