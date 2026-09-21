import { GetTransactionsInput, Transaction } from "./transaction.types";
import * as transactionRepository from "./transaction.repository"

export const getUserTransactions = async (input: GetTransactionsInput) => {
    const offset = (input.page -1) * input.limit;

    const [transactions, total] = await Promise.all([
        transactionRepository.findUserTransactions({
            userId: input.userId,
            limit: input.limit,
            offset,
            type: input.type,
            status: input.status
        }),

        transactionRepository.countUserTransactions(
            input.userId,
            input.type,
            input.status
        )
    ]);

    const totalPages = Math.ceil(total / input.limit)

    return {
        transactions,
        pagination: {
            page: input.page,
            limit: input.limit,
            total,
            totalPages,
            hasNextPage: input.page < totalPages,
            hasPrevPage: input.page > 1
        }
    }
}

