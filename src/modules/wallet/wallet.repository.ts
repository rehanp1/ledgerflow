import { pool } from "../../database/pool";
import type { CreateWalletInput, Wallet } from "./wallet.types";

export const createWallet = async (input: CreateWalletInput): Promise<Wallet> => {
    const { userId, currency } = input;

    const query = `
        INSERT INTO wallets (user_id, currency)
        VALUES ($1, $2)
        RETURNING id, user_id AS "userId", currency, balance, status, created_at AS "createdAt", updated_at AS "updatedAt"
    `
    const result = await pool.query(query, [userId, currency]);

    return result.rows[0];
}

export const findWalletById = async (walletId: string): Promise<Wallet | null> => {
    const query = `
        SELECT id, user_id AS "userId", currency, balance, status, created_at AS "createdAt", updated_at AS "updatedAt"
        FROM wallets
        WHERE id = $1
    `;

    const result = await pool.query(query, [walletId]);

    return result.rows[0] || null;
}