const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

const msalConfig = {
  auth: {
    clientId: process.env.MS_ENTRA_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.MS_ENTRA_TENANT_ID}`,
    clientSecret: process.env.MS_ENTRA_CLIENT_SECRET, // Required for confidential clients
  },
};

// Debugging output
console.log("Client ID:", process.env.MS_ENTRA_CLIENT_ID || "Not set");
console.log("Tenant ID:", process.env.MS_ENTRA_TENANT_ID || "Not set");
console.log("Client Secret:", process.env.MS_ENTRA_SECRET || "Not set"); // Be cautious with logging secrets
console.log("jwks uri:", `${msalConfig.auth.authority}/discovery/v2.0/keys`);
const JWKS_URI = `${msalConfig.auth.authority}/discovery/v2.0/keys`;

// Configure JWKS client to fetch Microsoft public keys
const client = jwksClient({ jwksUri: JWKS_URI });

// Function to fetch the correct signing key
const getKey = (header, callback) => {
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

  jwt.verify(
    token,
    getKey,
    { issuer: msalConfig.auth.authority, audience: msalConfig.auth.clientId },
    (err, decoded) => {
      if (err) {
        console.error("received token", token);
        console.error("Token verification error:", err);
        return res.status(401).json({ error: "Invalid token" + err });
      }
      req.user = decoded; // Store user info for further processing
      console.log("verified user", decoded);
      next();
    }
  );
};

module.exports = validateToken;
