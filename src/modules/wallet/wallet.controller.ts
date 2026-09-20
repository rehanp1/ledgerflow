import { Request, Response } from "express";
import { createWalletSchema, depositSchema, transferSchema, withdrawSchema } from "./wallet.validation";
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

export const deposit = async (req: Request, res: Response): Promise<void> => {
    try {
        const walletId = req.params.walletId;

        if (!walletId) {
            res.status(400).json({ message: "Wallet ID is required" });
            return;
        }

        if (!req.user) {
            res.status(401).json({ message: "Authentication required" });
            return
        }

        const idempotencyKey = req.header("Idempotency-Key");

        if (!idempotencyKey) {
            res.status(400).json({ message: "Idempotency-Key header is required" });
            return;
        }

        if (idempotencyKey.length > 100) {
            res.status(400).json({ message: "Idempotency-Key must not exceed 100 characters" });
            return;
        }

        const parsed = depositSchema.safeParse(req.body);

        if (!parsed.success) {
            res.status(400).json({
                message: "Invalid request",
                errors: parsed.error.flatten(),
            });
            return;
        }

        const transaction = await walletService.deposit({
            walletId: walletId as string,
            userId: req.user.id,
            amount: parsed.data.amount,
            idempotencyKey
        })

        res.status(201).json({ message: "Deposit successful", data: transaction})
    } catch (error) {
        // PostgreSQL unique constraint violation
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "23505"
        ) {
            res.status(409).json({
                message: "Idempotency key has already been used",
            });
            return;
        }

        if (
            error instanceof Error &&
            error.message === "IDEMPOTENCY_KEY_REUSED"
        ) {
            res.status(409).json({
                message: "Idempotency key was already used with different transaction details",
            });
            return;
        }

        console.error("Deposit error:", error);

        res.status(500).json({
        message: "Failed to process deposit",
        });
    }
}

export const withdraw = async (req: Request, res: Response): Promise<void> => {
    try {
        const walletId = req.params.walletId;

        if (!walletId) {
            res.status(400).json({ message: "Wallet ID is required" });
            return;
        }

        if (!req.user) {
            res.status(401).json({ message: "Authentication required" });
            return
        }

        const idempotencyKey = req.header("Idempotency-Key");

        if (!idempotencyKey) {
            res.status(400).json({ message: "Idempotency-Key header is required" });
            return;
        }

        if (idempotencyKey.length > 100) {
            res.status(400).json({ message: "Idempotency-Key must not exceed 100 characters" });
            return;
        }

        const parsed = withdrawSchema.safeParse(req.body);

        if (!parsed.success) {
            res.status(400).json({
                message: "Invalid request",
                errors: parsed.error.flatten(),
            });
            return;
        }

        const transaction = await walletService.withdraw({
            walletId: walletId as string,
            userId: req.user.id,
            amount: parsed.data.amount,
            idempotencyKey
        })

        res.status(201).json({ message: "Withdrawal successful", data: transaction})
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "INSUFFICIENT_BALANCE"
        ) {
            res.status(409).json({
                message: "Insufficient wallet balance",
            });
            return;
        }

        if (
            error instanceof Error &&
            error.message === "IDEMPOTENCY_KEY_REUSED"
        ) {
            res.status(409).json({
                message: "Idempotency key was already used with different transaction details",
            });
            return;
        }

        console.error("Withdrawal error:", error);

        res.status(500).json({
            message: "Failed to process withdrawal",
        });
    }
}

export const transfer = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Authentication required" });
            return
        }

        const idempotencyKey = req.header("Idempotency-Key");

        if (!idempotencyKey) {
            res.status(400).json({ message: "Idempotency-Key header is required" });
            return;
        }

        if (idempotencyKey.length > 100) {
            res.status(400).json({ message: "Idempotency-Key must not exceed 100 characters" });
            return;
        }

        const parsed = transferSchema.safeParse(req.body);

        if (!parsed.success) {
            res.status(400).json({
                message: "Invalid request",
                errors: parsed.error.flatten(),
            });
            return;
        }

        const transaction = await walletService.transfer({
            sourceWalletId: parsed.data.sourceWalletId,
            destinationWalletId: parsed.data.destinationWalletId,
            userId: req.user.id,
            amount: parsed.data.amount,
            idempotencyKey
        })

        res.status(201).json({ message: "Transfer completed successful", data: transaction})
    } catch (error: any) {
        switch (error.message) {
            case "SAME_WALLET_TRANSFER":
                res.status(400).json({
                    message: "Source and destination wallets must be different",
                });
                return;
            case "WALLET_NOT_FOUND":
                res.status(404).json({
                    message: "Wallet not found",
                });
                return;
            case "WALLET_ACCESS_DENIED":
                res.status(403).json({
                    message: "You do not own the source wallet",
                });
                return;
            case "WALLET_NOT_ACTIVE":
                res.status(409).json({
                    message: "Both wallets must be active",
                });
                return;
            case "CURRENCY_MISMATCH":
                res.status(400).json({
                    message: "Source and destination currencies must match",
                });
                return;
            case "INSUFFICIENT_BALANCE":
                res.status(409).json({
                    message: "Insufficient wallet balance",
                });
                return;
            case "IDEMPOTENCY_KEY_REUSED":
                res.status(409).json({
                    message: "Idempotency key was already used with different transaction details",
                });
                return;
            default:
                console.error("Transfer error:", error);
                res.status(500).json({
                    message: "Failed to process transfer",
                });
                return;
        }    
    }
}