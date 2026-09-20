export interface Transaction {
    id: string;
    idempotencyKey: string;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    amount: string;
    currency: string;
    sourceWalletId?: string;
    destinationWalletId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateTransactionInput {
    idempotencyKey: string;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
    amount: string;
    currency: string;
    sourceWalletId?: string;
    destinationWalletId?: string;
}

export interface FindTransactionsInput {
    userId: string;
    limit: number;
    offset: number;
    type?: string | undefined;
    status?: string | undefined;
}

export interface GetTransactionsInput {
  userId: string;
  page: number;
  limit: number;
  type?: string | undefined;
  status?: string | undefined;
}
