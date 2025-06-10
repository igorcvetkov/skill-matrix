// helpers/roleMapper.js

const roleMap = {
    "admin": "ADMIN",
    "project.manager": "PM",
    "user": "USER",
};

function mapRole(tokenRoles) {
    if (!Array.isArray(tokenRoles) || tokenRoles.length === 0) return "USER";

    for (const role of tokenRoles) {
        const normalized = role.toLowerCase();
        if (roleMap.hasOwnProperty(normalized)) {
            return roleMap[normalized];
        }
    }

    return "USER"; // fallback
}

module.exports = { mapRole };
