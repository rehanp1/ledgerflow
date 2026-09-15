import type { User } from "./auth.types";
import type { LoginInput, RegisterInput } from "./auth.validation";
import * as authRepository from "./auth.repository"
import bcrypt from "bcrypt"
import { createAccessToken, createRefreshToken, hashRefreshToken } from "../../shared/auth/tokens";
import { withTransaction } from "../../database/transaction";

const SALT_ROUNDS = 12
const REFRESH_TOKEN_EXPIRES_DAYS = 7

export const registerUser = async (input: RegisterInput): Promise<User> => {
    const existingUser = await authRepository.findUserByEmail(input.email);

    if (existingUser) {
        throw new Error("EMAIL_ALREADY_EXISTS");
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS)

    return authRepository.createUser({
        name: input.name,
        email: input.email,
        passwordHash
    })
}

export const loginUser = async (input: LoginInput) => {
    const user = await authRepository.findUserByEmail(input.email);

    if (!user) {
        throw new Error("INVALID_CREDENTIALS");
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

    if (!passwordMatches) {
        throw new Error("INVALID_CREDENTIALS");
    }

    const accessToken = createAccessToken(user.id);
    
    const refreshToken = createRefreshToken()
    const tokenHash = hashRefreshToken(refreshToken)

    const expiresAt = new Date(
        Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000
    );

    await authRepository.createRefreshToken({
        userId: user.id,
        tokenHash,
        expiresAt
    })

    return {
        user,
        accessToken,
        refreshToken
    }
}

export const refreshAccessToken = async (refreshToken: string) => {
    const tokenHash = hashRefreshToken(refreshToken);

    const storedToken = await authRepository.findRefreshToken(tokenHash);

    if (!storedToken) {
        throw new Error("INVALID_REFRESH_TOKEN");
    }

    if (storedToken.revokedAt) {
        throw new Error("INVALID_REFRESH_TOKEN");
    }

    if (storedToken.expiresAt.getTime() <= Date.now()) {
        throw new Error("REFRESH_TOKEN_EXPIRED");
    }

    
    const newAccessToken = createAccessToken(storedToken.userId);
    
    const newRefreshToken = createRefreshToken();
    const newTokenHash = hashRefreshToken(newRefreshToken);
    
    const expiresAt = new Date(
        Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000
    )

    await withTransaction(async (client) => {
        const revoked = await authRepository.revokeRefreshToken(storedToken.tokenHash, client)

        if (!revoked) {
            throw new Error("INVALID_REFRESH_TOKEN");
        }

        await authRepository.createRefreshToken({
            userId: storedToken.userId,
            tokenHash: newTokenHash,
            expiresAt,
        }, client);
    })
    

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
    }
}

export const logoutUser = async (refreshToken: string | undefined): Promise<void> => {
    if (!refreshToken) {
        return;
    }

    const tokenHash = hashRefreshToken(refreshToken);

    await authRepository.revokeRefreshToken(tokenHash);
}