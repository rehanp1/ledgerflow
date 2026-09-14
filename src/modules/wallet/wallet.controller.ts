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

        const wallet = await walletService.createWallet(parsed.data);

        res.status(201).json({
            message: "Wallet created successfully",
            data: wallet
        });
    } catch (error) {
        console.error("Create wallet error:", error);
        res.status(500).json({ message: "Failed to create wallet" });
    }
}