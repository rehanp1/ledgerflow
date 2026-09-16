import type { PoolClient, Pool } from "pg";
import { CreateTransactionInput, Transaction } from "./transaction.types";
import { pool } from "../../database/pool";

export const createTransaction = async (input: CreateTransactionInput, client: PoolClient | Pool = pool): Promise<Transaction> => {
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
        VALUES ($1, $2, 'COMPLETED', $3, $4, $5, $6)
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

    return result.rows[0];
}