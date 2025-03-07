const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

const msalConfig = {
  auth: {
    clientId: process.env.MS_ENTRA_CLIENT_ID,
    authority: `https://sts.windows.net/${process.env.MS_ENTRA_TENANT_ID}`,
    clientSecret: process.env.MS_ENTRA_CLIENT_SECRET, // Required for confidential clients
  },
};

const JWKS_URI = `${msalConfig.auth.authority}/discovery/v2.0/keys`;
console.log("JWKS_URI", JWKS_URI);
// Configure JWKS client to fetch Microsoft public keys
const client = jwksClient({ jwksUri: JWKS_URI, timeout: 10000 });

// Function to fetch the correct signing key
const getKey = (header, callback) => {
  console.log("JWKS_URI", JWKS_URI);
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      console.error("Error fetching signing key:", err);
      return callback(err);
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
};

// Middleware to verify ID Token
const validateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1]; // Extract token
  console("token", token);
  // jwt.verify(
  //   token,
  //   getKey,
  //   { issuer: msalConfig.auth.authority + "/", audience: msalConfig.auth.clientId },
  //   (err, decoded) => {
  //     if (err) {
  //       console.error("Token verification error:", err);
  //       return res.status(401).json({ error: "Invalid token" });
  //     }

  //     req.user = decoded; // Store user info for further processing
  //     next();
  //   }
  // );
  return next();
};

const authorizeRequest = (allowedRoles, requiredScope) => (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1]; // Extract token
  console.log("token", token);
  // jwt.verify(
  //   token,
  //   getKey,
  //   { issuer: msalConfig.auth.authority + "/", audience: msalConfig.auth.clientId },
  //   (err, decoded) => {
  //     if (err) {
  //       console.error("Token verification error:", err);
  //       return res.status(401).json({ error: "Invalid token" });
  //     }

  //     const userRoles = decoded.roles || []; // Extract roles from token
  //     const userScopes = decoded.scp?.split(" ") || []; // Extract scopes from token

  //     // Check if user has a valid role
  //     const hasValidRole = userRoles.some((role) => allowedRoles.includes(role));
  //     if (!hasValidRole) {
  //       return res.status(403).json({ error: "Forbidden: Invalid role" });
  //     }

  //     // Check if user has the required scope
  //     if (!userScopes.includes(requiredScope)) {
  //       return res.status(403).json({ error: "Forbidden: Missing required scope" });
  //     }

  //     req.user = decoded; // Store user info for further processing
  //     next();
  //   }
  // );
  next();
};

module.exports = { validateToken, authorizeRequest };
