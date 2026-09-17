import type { PoolClient, Pool } from "pg";
import { CreateTransactionInput, Transaction } from "./transaction.types";
import { pool } from "../../database/pool";

export const createTransaction = async (input: CreateTransactionInput, client: PoolClient | Pool = pool): Promise<Transaction | null> => {
    const query = `
        INSERT INTO transactions (
            idempotency_key,
            type,
            status,
            amount,
            currency,
            source_wallet_id,
            destination_wallet_id
        )
        VALUES ($1, $2, 'PENDING', $3, $4, $5, $6)
        ON CONFLICT (idempotency_key) DO NOTHING
        RETURNING
            id,
            idempotency_key AS "idempotencyKey",
            type,
            status,
            amount,
            currency,
            source_wallet_id AS "sourceWalletId",
            destination_wallet_id AS "destinationWalletId",
            created_at AS "createdAt";
    `

    const result = await client.query(query, [
        input.idempotencyKey,
        input.type,
        input.amount,
        input.currency,
        input.sourceWalletId ?? null,
        input.destinationWalletId ?? null
    ])

    return result.rows[0] ?? null;
}

export const findTransactionByIdempotencyKey = async (idempotencyKey: string, client: PoolClient | Pool = pool): Promise<Transaction | null> => {
    const query = `
        SELECT id, idempotency_key AS "idempotencyKey", type, status, amount, currency,
            source_wallet_id AS "sourceWalletId", destination_wallet_id AS "destinationWalletId", created_at AS "createdAt"
        FROM transactions
        WHERE idempotency_key = $1;
    `

    const result = await client.query(query, [idempotencyKey]);

    return result.rows[0] ?? null;
}

export const updateTransactionStatus = async (transactionId: string, status: "COMPLETED" | "FAILED", client: PoolClient | Pool = pool): Promise<void> => {
    const query = `
        UPDATE transactions
        SET status = $1, updated_at = NOW()
        WHERE id = $2;
    `

    await client.query(query, [status, transactionId])
}

