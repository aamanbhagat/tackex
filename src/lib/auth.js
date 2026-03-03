import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.GROK_API_KEY; // reuse as secret, or use a separate env var

export function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

export function getTokenFromCookies(cookieHeader) {
    if (!cookieHeader) return null;
    const match = cookieHeader.match(/(?:^|;\s*)token=([^;]*)/);
    return match ? match[1] : null;
}
