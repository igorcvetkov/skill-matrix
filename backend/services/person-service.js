const db = require("../config/database");
const { mapRole } = require("../helpers/roleMapper");

class PersonService {
    static async registerOrUpdatePersonFromToken(decodedToken) {
        const { oid, name, preferred_username, roles } = decodedToken;

        const roleCode = mapRole(roles || []);
        const [[roleRow]] = await db.promise().query(
            "SELECT id FROM role WHERE code = ? LIMIT 1",
            [roleCode]
        );
        if (!roleRow) throw new Error(`Role "${roleCode}" not found in DB`);

        const roleId = roleRow.id;

        // 🔄 Lookup person by email instead of oid now
        const [rows] = await db
            .promise()
            .query("SELECT id, role_id FROM person WHERE username = ? LIMIT 1", [preferred_username]);
        const personRow = rows[0];

        if (!personRow) {
            // Insert new person
            await db.promise().query(
                "INSERT INTO person (oid, name, username, role_id) VALUES (?, ?, ?, ?)",
                [oid, name, preferred_username, roleId]
            );
            console.log(`[Auth] Registered new person: ${preferred_username}`);
        } else {
            // Update role, name, and oid if needed
            await db.promise().query(
                "UPDATE person SET role_id = ?, name = ?, oid = ? WHERE id = ?",
                [roleId, name, oid, personRow.id]
            );
            console.log(`[Auth] Updated person: ${preferred_username}`);
        }

        // // Optional override (e.g., for admin access testing)
        // await db.promise().query(
        //     "UPDATE person SET role_id = 1 WHERE username = ?",
        //     [preferred_username]
        // );
    }
}

module.exports = PersonService;
