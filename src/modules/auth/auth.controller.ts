import { Request, Response } from "express";
import { loginSchema, registerSchema } from "./auth.validation";
import * as authService from "./auth.service"

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const parsed = registerSchema.safeParse(req.body)

        if (!parsed.success){
            res.status(400).json({
                message: "Invalid request",
                errors: parsed.error.flatten(),
            });
            return
        }

        const user = await authService.registerUser(parsed.data)
        
        res.status(201).json({
            message: "User register successfully",
            data: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        })
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: "Failed to register user"})
    }
}

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const parsed = loginSchema.safeParse(req.body)

        if (!parsed.success){
            res.status(400).json({
                message: "Invalid request",
                errors: parsed.error.flatten(),
            });
            return
        }

        const result = await authService.loginUser(parsed.data)

        res.cookie("access_token", result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60 * 1000, // 15 minutes
        })

        res.cookie("refresh_token", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })

        res.status(200).json({
            message: "Login successful",
            data: {
                id: result.user.id,
                name: result.user.name,
                email: result.user.email
            }
        })
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Failed to login user"})
    }               
}

export const refresh = async (req: Request, res: Response): Promise<void> => {
    try{
        const refreshToken = req.cookies?.refresh_token;

        if (!refreshToken) {
            res.status(401).json({ message: "Refresh token required" });
            return;
        }

        const result = await authService.refreshAccessToken(refreshToken);

        res.cookie("access_token", result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60 * 1000,
        });

        res.cookie("refresh_token", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({ message: "Token refreshed" });

    } catch (error) {
        console.error("Refresh token error:", error);
        res.status(500).json({ message: "Failed to refresh token" });
    }
}

export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        const refreshToken = req.cookies?.refresh_token;

        await authService.logoutUser(refreshToken);

        res.clearCookie("access_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        })

        res.clearCookie("refresh_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        })

        res.status(204).send();
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ message: "Failed to logout" });
    }
}