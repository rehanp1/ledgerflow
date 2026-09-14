import jwt from 'jsonwebtoken';
import crypto from "node:crypto"

const accessSecret = process.env.JWT_SECRET;

if (!accessSecret) {
  throw new Error('JWT_SECRET is not configured');
}


export const createAccessToken = (userId: string): string => {
  const payload = { sub : userId };
  return jwt.sign(payload, accessSecret, {expiresIn: "15m"});
}

export const createRefreshToken = (): string => {
    return crypto.randomBytes(64).toString('hex');
}

export const hashRefreshToken = (token: string): string => {
    return crypto.createHash('sha256').update(token).digest('hex');
}
