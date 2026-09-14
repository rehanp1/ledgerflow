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
            CREATE TABLE IF NOT EXISTS wallets (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id),
            currency CHAR(3) NOT NULL,
            balance NUMERIC(20, 2) NOT NULL DEFAULT 0,
            status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

            CONSTRAINT wallets_balance_non_negative CHECK (balance >= 0),
            CONSTRAINT wallets_status_check CHECK (status IN ('ACTIVE', 'FROZEN', 'CLOSED')),
            CONSTRAINT wallets_currency_check CHECK (currency ~ '^[A-Z]{3}$'),
            CONSTRAINT wallets_user_currency_unique UNIQUE (user_id, currency)
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
        DROP TABLE IF EXISTS wallets;
    `)
};
