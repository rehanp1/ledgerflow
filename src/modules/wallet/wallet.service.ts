import type { CreateWalletInput, DepositInput, Wallet, WithdrawInput } from "./wallet.types";
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

        const transaction = await transactionRepository.createTransaction(
            {
                idempotencyKey: input.idempotencyKey,
                type: "DEPOSIT",
                amount: input.amount,
                currency: wallet.currency
            },
            client
        );

        //Idempotency key already exists
        if (!transaction) {
            const existingTransaction = await transactionRepository.findTransactionByIdempotencyKey(input.idempotencyKey, client);

            if (!existingTransaction) {
                throw new Error("IDEMPOTENCY_LOOKUP_FAILED")
            }

            // Prevent reuse of the same key with different details
            if (
                existingTransaction.type !== "DEPOSIT" ||
                existingTransaction.amount !== input.amount ||
                existingTransaction.currency !== wallet.currency
            ) {
                throw new Error("IDEMPOTENCY_KEY_REUSED")
            }

            return existingTransaction;
        }

        await walletRepository.incrementWalletBalance(input.walletId, input.amount, client)

        await ledgerRepository.createLedgerEntry(
            {
                transactionId: transaction.id,
                walletId: input.walletId,
                entryType: "CREDIT",
                amount: input.amount
            },
            client
        );

        await transactionRepository.updateTransactionStatus(transaction.id, "COMPLETED", client)

        return {
            ...transaction,
            status: "COMPLETED"
        };

    })
}

export const withdraw = async (input: WithdrawInput): Promise<Transaction> => {
    return withTransaction(async (client) => {
        const wallet = await walletRepository.findWalletForUpdate(input.walletId, input.userId, client)

        if (!wallet) {
            throw new Error("WALLET_NOT_FOUND");
        }

        if (wallet.status !== "ACTIVE") {
            throw new Error("WALLET_NOT_ACTIVE");
        }

        const transaction = await transactionRepository.createTransaction(
            {
                idempotencyKey: input.idempotencyKey,
                type: "WITHDRAWAL",
                amount: input.amount,
                currency: wallet.currency,
                sourceWalletId: input.walletId
            },
            client
        );

        //Idempotency key already exists
        if (!transaction) {
            const existingTransaction = await transactionRepository.findTransactionByIdempotencyKey(input.idempotencyKey, client);

            if (!existingTransaction) {
                throw new Error("IDEMPOTENCY_LOOKUP_FAILED")
            }

            // Prevent reuse of the same key with different details
            if (
                existingTransaction.type !== "WITHDRAWAL" ||
                existingTransaction.amount !== input.amount ||
                existingTransaction.currency !== wallet.currency ||
                existingTransaction.sourceWalletId !== input.walletId
            ) {
                throw new Error("IDEMPOTENCY_KEY_REUSED")
            }

            return existingTransaction;
        }

        const balanceUpdated =  await walletRepository.decrementWalletBalance(input.walletId, input.amount, client)

        if (!balanceUpdated) {
            throw new Error("INSUFFICIENT_BALANCE")
        }

        await ledgerRepository.createLedgerEntry(
            {
                transactionId: transaction.id,
                walletId: input.walletId,
                entryType: "DEBIT",
                amount: input.amount
            },
            client
        );

        await transactionRepository.updateTransactionStatus(transaction.id, "COMPLETED", client)

        return {
            ...transaction,
            status: "COMPLETED"
        };

    })
}

