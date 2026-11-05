import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'agriculture_advisor_secure_jwt_secret_key_2026_cse_aiml';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a signed JWT for a authenticated user
 * @param {string} userId - MongoDB ObjectId or unique user ID string
 * @returns {string} - Signed JWT token
 */
export const generateToken = (userId) => {
  return jwt.sign({ id: userId.toString() }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Verify and decode a JWT token
 * @param {string} token - Bearer JWT token string
 * @returns {object} - Decoded token payload with user ID
 */
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
