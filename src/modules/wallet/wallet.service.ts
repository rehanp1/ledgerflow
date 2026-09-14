import type { CreateWalletInput, Wallet } from "./wallet.types";
import * as walletRepository from "./wallet.repository";

// Later, we can move supported currencies into configuration/database if needed
const SUPPORTED_CURRENCIES = new Set(["USD", "EUR", "GBP", "JPY", "AUD", "INR"]);

export const createWallet = async (input: CreateWalletInput): Promise<Wallet> => {
    const currency = input.currency.toUpperCase();

    if (!SUPPORTED_CURRENCIES.has(currency)) {
        throw new Error(`Currency ${currency} is not supported`);
    }
    //Later we'll handle PostgreSQL's unique violation cleanly instead of returning a generic 500.

    return walletRepository.createWallet({
        userId: input.userId, 
        currency
    });
};

export const getWalletById = async (walletId: string): Promise<Wallet> => {
    const wallet = await walletRepository.findWalletById(walletId);

    if (!wallet) {
        throw new Error(`Wallet with ID ${walletId} not found`);
    }

    return wallet;
}
