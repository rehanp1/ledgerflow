import { Request, Response } from "express";
import { createWalletSchema } from "./wallet.validation";
import * as walletService from "./wallet.service";

export const createWallet = async (req: Request, res: Response): Promise<void> => {
    try {
        const parsed = createWalletSchema.safeParse(req.body);

        if (!parsed.success) {
            res.status(400).json({
                message: "Invalid request",
                errors: parsed.error.flatten()
            })
            return;
        }

        if (!req.user) {
            res.status(401).json({ message: "Authentication required" });
            return;
        }

        const wallet = await walletService.createWallet({
            userId: req.user.id,
            currency: parsed.data.currency
        });

        res.status(201).json({
            message: "Wallet created successfully",
            data: wallet
        });
    } catch (error) {
        console.error("Create wallet error:", error);
        res.status(500).json({ message: "Failed to create wallet" });
    }
}

export const getWalletById = async (req: Request, res: Response): Promise<void> => {
    try {
        const walletId = req.params.walletId;

        if (!walletId) {
            res.status(400).json({ message: "Wallet ID is required" });
            return;
        }

        const wallet = await walletService.getWalletById(walletId as string);

        res.status(200).json({
            message: "Wallet retrieved successfully",
            data: wallet
        });
    } catch (error) {
        console.error("Get wallet by ID error:", error);
        res.status(500).json({ message: "Failed to retrieve wallet" });
    }
}