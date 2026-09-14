/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
    pgm.sql(`
        CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
        CREATE INDEX IF NOT EXISTS idx_transactions_source_wallet ON transactions(source_wallet_id);
        CREATE INDEX IF NOT EXISTS idx_transactions_destination_wallet ON transactions(destination_wallet_id);
        CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_ledger_entries_wallet_id ON ledger_entries(wallet_id);
        CREATE INDEX IF NOT EXISTS idx_ledger_entries_transaction_id ON ledger_entries(transaction_id);
    `)
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.sql(`
        DROP INDEX IF EXISTS idx_wallets_user_id;
        DROP INDEX IF EXISTS idx_transactions_source_wallet;
        DROP INDEX IF EXISTS idx_transactions_destination_wallet;
        DROP INDEX IF EXISTS idx_transactions_created_at;
        DROP INDEX IF EXISTS idx_ledger_entries_wallet_id;
        DROP INDEX IF EXISTS idx_ledger_entries_transaction_id;
    `)
};
