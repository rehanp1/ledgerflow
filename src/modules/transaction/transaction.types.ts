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
