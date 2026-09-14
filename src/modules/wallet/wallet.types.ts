export interface Wallet {
    id: string;
    userId: string;
    currency: string;
    balance: string; // PostgreSQL NUMERIC values are returned by pg as strings. To avoid precision loss, we keep the balance as a string in the Wallet interface.
    status: "ACTIVE" | "FROZEN" | "CLOSED";
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateWalletInput {
    userId: string;
    currency: string;
}