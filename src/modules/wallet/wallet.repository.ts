import { pool } from "../../database/pool";
import type { CreateWalletInput, Wallet } from "./wallet.types";
import type { Pool, PoolClient } from "pg";

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

export const findWalletForUpdate = async (walletId: string, userId: string, client: PoolClient): Promise<Wallet | null> => {
    const query = `
        SELECT id, user_id as "userId", currency, balance, status
        FROM wallets
        WHERE id = $1 AND user_id = $2
        FOR UPDATE
    `

    const result = await client.query(query, [walletId, userId])

    return result.rows[0] ?? null
}

export const incrementWalletBalance = async (walletId: string, amount: string, client: PoolClient): Promise<void> => {
    const query = `
        UPDATE wallets
        SET balance = balance + $1, updated_at = NOW()
        WHERE id = $2
    `

    await client.query(query, [amount, walletId])
}

export const decrementWalletBalance = async (walletId: string, amount: string, client: PoolClient | Pool = pool): Promise<boolean> => {
    const query = `
        UPDATE wallets
        SET balance = balance - $1, updated_at = NOW()
        WHERE id = $2 AND balance >= $1
    `

    const result = await client.query(query, [amount, walletId])

    return result.rowCount === 1;
}

export const findWalletsForUpdate = async (walletId1: string, walletId2: string, client: PoolClient | Pool = pool): Promise<Wallet[]> => {
    const walletIds = [walletId1, walletId2].sort();

    const query = `
        SELECT id, user_id AS "userId", currency, balance, status
        FROM wallets
        WHERE id = ANY($1::uuid[])
        ORDER BY id
        FOR UPDATE;
    `

    const result = await client.query(query, [walletIds]);

    return result.rows;
}

