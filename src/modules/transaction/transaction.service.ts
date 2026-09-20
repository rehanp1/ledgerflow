import { GetTransactionsInput, Transaction } from "./transaction.types";
import * as transactionRepository from "./transaction.repository"

export const getUserTransactions = (input: GetTransactionsInput) => {
    const offset = (input.page -1) * input.limit;

    return transactionRepository.findUserTransactions({
        userId: input.userId,
        limit: input.limit,
        offset,
        type: input.type,
        status: input.status
    })
}

