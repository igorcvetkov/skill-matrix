const db = require("../config/database");
const { mapRole } = require("../helpers/roleMapper");

class PersonService {
    static async registerOrUpdatePersonFromToken(decodedToken) {
        const {oid, name, preferred_username, roles} = decodedToken;

        const roleCode = mapRole(roles || []);
        const [[roleRow]] = await db.promise().query("SELECT id FROM role WHERE code = ? LIMIT 1", [roleCode]);
        if (!roleRow) throw new Error(`Role "${roleCode}" not found in DB`);
        console.log(decodedToken)
        const roleId = roleRow.id;

        const [rows] = await db.promise().query("SELECT id, role_id FROM person WHERE oid = ? LIMIT 1", [oid]);
        const personRow = rows[0]; // undefined if not found

        if (!personRow) {
            // Insert new
            await db.promise().query(
                "INSERT INTO person (oid, name, username, role_id) VALUES (?, ?, ?, ?)",
                [oid, name, preferred_username, roleId]
            );
            console.log(`[Auth] Registered new person: ${preferred_username}`);
        } else {
            if (personRow.role_id != roleId) {  // loose check to avoid type mismatch
                await db.promise().query(
                    "UPDATE person SET role_id = ? WHERE id = ?",
                    [roleId, personRow.id]
                );
                console.log(`[Auth] Updated role for: ${preferred_username}`);
            } else {
                console.log(`[Auth] Person exists and up-to-date: ${preferred_username}`);
            }
        }
        //for now will leave it here (work around for admin access :D)
        // await db.promise().query(
        //     "UPDATE person SET role_id = 1 WHERE id = ?",
        //     [personRow?.id]
        // );

    }
}

module.exports = PersonService;
