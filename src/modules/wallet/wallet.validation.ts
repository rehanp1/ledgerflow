import { z } from "zod";

export const createWalletSchema = z.object({
  currency: z
    .string()
    .length(3)
    .transform((value) => value.toUpperCase()),
});

export type CreateWalletRequest = z.infer<typeof createWalletSchema>;