const db = require("../config/database");

class ProjectMemberService {
    static async addMember({ personId, projectId, startDate = null, endDate = null }) {
        // Check if the member already exists
        const [existing] = await db.promise().query(
            `SELECT id FROM project_member WHERE person_id = ? AND project_id = ? LIMIT 1`,
            [personId, projectId]
        );

        if (existing.length > 0) {
            const error = new Error("Project member already exists");
            error.code = "DUPLICATE_PROJECT_MEMBER";
            throw error;
        }

        const query = `
            INSERT INTO project_member (person_id, project_id, start_date, end_date)
            VALUES (?, ?, ?, ?)
        `;

        const [result] = await db.promise().query(query, [personId, projectId, startDate, endDate]);
        return { id: result.insertId };
    }
}

module.exports = ProjectMemberService;
