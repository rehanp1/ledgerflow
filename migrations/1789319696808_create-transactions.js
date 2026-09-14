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
        CREATE TABLE IF NOT EXISTS transactions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            idempotency_key VARCHAR(100) NOT NULL UNIQUE,
            type VARCHAR(20) NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
            amount NUMERIC(20, 2) NOT NULL,
            currency CHAR(3) NOT NULL,
            source_wallet_id UUID REFERENCES wallets(id),
            destination_wallet_id UUID REFERENCES wallets(id),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

            CONSTRAINT transactions_amount_positive CHECK (amount > 0),
            CONSTRAINT transactions_type_check CHECK (type IN ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER')),
            CONSTRAINT transactions_status_check CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
            CONSTRAINT transactions_currency_check CHECK (currency ~ '^[A-Z]{3}$')
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
        DROP TABLE IF EXISTS transactions;
    `)
};
