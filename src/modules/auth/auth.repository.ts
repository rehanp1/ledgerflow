import { pool } from "../../database/pool";
import type { CreateRefreshTokenInput, CreateUserInput, User } from "./auth.types";

export const createUser = async (input: CreateUserInput): Promise<User> => {
    const query = `
        INSERT INTO users (name, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id, name, email, password_hash AS "passwordHash", created_at AS "createdAt", updated_at AS "updatedAt"
    `;

    const result = await pool.query(query, [input.name, input.email, input.passwordHash]);

    return result.rows[0];
}

export const findUserByEmail = async (email: string): Promise<User | null> => {
    const query = `
        SELECT id, name, email, password_hash AS "passwordHash", created_at AS "createdAt", updated_at AS "updatedAt"
        FROM users
        WHERE email = $1
    `;

    const result = await pool.query(query, [email]);

    return result.rows[0] || null;
}

export const createRefreshToken = async (input: CreateRefreshTokenInput): Promise<void> => {
    const query = `
        INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
        VALUES ($1, $2, $3)
    `;

    const result = await pool.query(query, [input.userId, input.tokenHash, input.expiresAt]);
}

export const revokeRefreshToken = async (tokenHash: string): Promise<void> => {
    const query = `
        UPDATE refresh_tokens
        SET revoked_at = NOW()
        WHERE token_hash = $1 AND revoked_at IS NULL
    `;

    const result = await pool.query(query, [tokenHash]);
}