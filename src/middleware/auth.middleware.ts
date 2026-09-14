import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"

const accessSecret = process.env.JWT_SECRET

if (!accessSecret) {
  throw new Error("JWT_SECRET is not configured");
}

interface AccessTokenPayload {
  sub: string;
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const token = req.cookies?.access_token;

        if (!token) {
            res.status(401).json({ message: "Authentication required" });
            return;
        }

        const payload = jwt.verify(token, accessSecret) as AccessTokenPayload

        if (!payload.sub) {
            res.status(401).json({ message: "Invalid access token" });
            return;
        }

        req.user = {
            id: payload.sub
        }

        next()
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired access token" });
    }
}