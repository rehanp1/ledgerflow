import type { CreateWalletInput, DepositInput, Wallet } from "./wallet.types";
import { Transaction } from "../transaction/transaction.types";
import { withTransaction } from "../../database/transaction";
import * as walletRepository from "./wallet.repository";
import * as transactionRepository from "../transaction/transaction.repository"
import * as ledgerRepository from "../ledger/ledger.repository";

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

export const deposit = async (input: DepositInput): Promise<Transaction> => {
    return withTransaction(async (client) => {
        const wallet = await walletRepository.findWalletForUpdate(input.walletId, input.userId, client)

        if (!wallet) {
            throw new Error("WALLET_NOT_FOUND");
        }

        if (wallet.status !== "ACTIVE") {
            throw new Error("WALLET_NOT_ACTIVE");
        }

        await walletRepository.incrementWalletBalance(input.walletId, input.amount, client)

        const transaction = await transactionRepository.createTransaction(
            {
                idempotencyKey: input.idempotencyKey,
                type: "DEPOSIT",
                amount: input.amount,
                currency: wallet.currency
            },
            client
        );

        await ledgerRepository.createLedgerEntry(
            {
                transactionId: transaction.id,
                walletId: input.walletId,
                entryType: "CREDIT",
                amount: input.amount
            },
            client
        );

        return transaction;

    })
}
