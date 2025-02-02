import jwt_decode from "jwt-decode"; // Make sure to install this package

export const getRolesFromToken = (token) => {
  if (!token) return [];
  const decodedToken = jwt_decode(token);
  return decodedToken?.roles || []; // Adjust based on your token structure
};
