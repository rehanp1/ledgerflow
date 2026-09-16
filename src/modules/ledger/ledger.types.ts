export interface CreateLedgerEntryInput {
  transactionId: string;
  walletId: string;
  entryType: "DEBIT" | "CREDIT";
  amount: string;
}