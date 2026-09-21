import type { PoolClient, Pool } from "pg";
import { CreateTransactionInput, FindTransactionsInput, Transaction } from "./transaction.types";
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

export const findUserTransactions = async (input: FindTransactionsInput): Promise<Transaction[]> => {
    const { userId, limit, offset, type, status } = input;

    const values: unknown[] = [ userId ];
    const conditions: string[] = [
        `(source_wallet.user_id = $1 OR destination_wallet.user_id = $1)`,
    ]

    if (type) {
        values.push(type)
        conditions.push(`t.type = $${values.length}`);
    }

    if (status) {
        values.push(status);
        conditions.push(`t.status = $${values.length}`);
    }

    values.push(limit);
    const limitParam = values.length;

    values.push(offset);
    const offsetParam = values.length;

    const query = `
        SELECT
            t.id,
            t.idempotency_key AS "idempotencyKey",
            t.type,
            t.status,
            t.amount,
            t.currency,
            t.source_wallet_id AS "sourceWalletId",
            t.destination_wallet_id AS "destinationWalletId",
            t.created_at AS "createdAt",
            t.updated_at AS "updatedAt"
        FROM transactions t
        LEFT JOIN wallets source_wallet 
            ON source_wallet.id = t.source_wallet_id
        LEFT JOIN wallets destination_wallet
            ON destination_wallet.id = t.destination_wallet_id
        WHERE ${conditions.join(" AND ")}
        ORDER BY t.created_at DESC
        LIMIT $${limitParam}
        OFFSET $${offsetParam}
    `

    const result = await pool.query(query, values)

    return result.rows
}

export const countUserTransactions = async (userId: string, type?: string, status?: string): Promise<number> => {
    const values: unknown[] = [ userId ];
    const conditions: string[] = [
        `(source_wallet.user_id = $1 OR destination_wallet.user_id = $1)`,
    ]

    if (type) {
        values.push(type)
        conditions.push(`t.type = $${values.length}`);
    }

    if (status) {
        values.push(status);
        conditions.push(`t.status = $${values.length}`);
    }

    const query = `
        SELECT COUNT(*)::int AS count
        FROM transactions t
        LEFT JOIN wallets source_wallet
            ON source_wallet.id = t.source_wallet_id
        LEFT JOIN wallets destination_wallet
            ON destination_wallet.id = t.destination_wallet_id
        WHERE ${conditions.join(" AND ")}
    `

    const result = await pool.query(query, values)

    return result.rows[0].count as number;
}

