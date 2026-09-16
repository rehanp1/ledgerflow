import type { Pool, PoolClient } from "pg";
import { CreateLedgerEntryInput } from "./ledger.types";
import { pool } from "../../database/pool";

export const createLedgerEntry = async (input: CreateLedgerEntryInput, client: PoolClient | Pool = pool): Promise<void> => {
    const query = `
        INSERT INTO ledger_entries (transaction_id, wallet_id, entry_type, amount)
        VALUES ($1, $2, $3, $4);
    `

    await client.query(query, [
        input.transactionId, 
        input.walletId,
        input.entryType,
        input.amount
    ])
}