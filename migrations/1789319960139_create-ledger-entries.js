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
        CREATE TABLE IF NOT EXISTS ledger_entries (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            transaction_id UUID NOT NULL REFERENCES transactions(id),
            wallet_id UUID NOT NULL REFERENCES wallets(id),
            entry_type VARCHAR(10) NOT NULL,
            amount NUMERIC(20, 2) NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

            CONSTRAINT ledger_entries_type_check CHECK (entry_type IN ('DEBIT', 'CREDIT')),
            CONSTRAINT ledger_entries_amount_positive CHECK (amount > 0)
        );
    `)
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.sql(`
        DROP TABLE IF EXISTS ledger_entries;
    `)
};
