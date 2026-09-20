import { Request, Response } from "express";
import * as transactionService from "./transaction.service"

export const getUserTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Authentication required" });
            return
        }

        const { page, limit, type, status } = req.query;

        const pageNum = Math.max(Number(page) || 1);
        const limitNum = Math.min(Math.max(Number(limit) || 10, 1), 100);

        const typeFilter = typeof type === "string" ? type : undefined;
        const statusFilter = typeof status === "string" ? status : undefined;

        const transactions = await transactionService.getUserTransactions({
            userId: req.user.id,
            page: pageNum,
            limit: limitNum,
            type: typeFilter,
            status: statusFilter
        })

        res.status(200).json({
            message: "Transactions fetched successfully",
            data: transactions,
            paginations: {
                page: pageNum,
                limit: limitNum,
                count: transactions.length
            }
        })

        return;

    } catch (error) {
        console.error("getUserTransactions error:", error);
        res.status(500).json({
            message: "Failed to get transactions",
        });
    }
    
}