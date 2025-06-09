const express = require("express");
const router = express.Router();
const ProjectMemberService = require("../services/project-member-service");
const { validateToken } = require("../auth");
const db = require("../config/database");

// Helper to get user role by OID
async function getUserRoleByOid(oid) {
    const [[user]] = await db.promise().query(
        "SELECT role_id FROM person WHERE oid = ? LIMIT 1",
        [oid]
    );
    return user || null;
}

router.post("/", validateToken, async (req, res) => {
    const { personId, projectId, startDate, endDate, is_pm: isPm } = req.body;
    const userOid = req.user?.oid;

    if (!userOid) {
        return res.status(401).json({ error: "Unauthorized: OID not found" });
    }

    if (!personId || !projectId) {
        return res.status(400).json({ error: "personId and projectId are required" });
    }

    try {
        const user = await getUserRoleByOid(userOid);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const allowedRoles = [1, 2]; // Admin and Project Manager

        if (!allowedRoles.includes(user.role_id)) {
            return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
        }

        const result = await ProjectMemberService.addMember({
            personId,
            projectId,
            startDate,
            endDate,
            isPm: !!isPm,
        });

        return res.status(201).json({ message: "Project member added", ...result });

    } catch (err) {
        if (err.code === "DUPLICATE_PROJECT_MEMBER") {
            return res.status(409).json({ error: "Project member already exists" });
        }

        console.error("Error adding project member:", err);
        return res.status(500).json({ error: "Failed to add project member", exception: err.message });
    }
});

module.exports = router;
