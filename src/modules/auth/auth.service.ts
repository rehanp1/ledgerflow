import type { User } from "./auth.types";
import type { LoginInput, RegisterInput } from "./auth.validation";
import * as authRepository from "./auth.repository"
import bcrypt from "bcrypt"
import { createAccessToken, createRefreshToken, hashRefreshToken } from "../../shared/auth/tokens";

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