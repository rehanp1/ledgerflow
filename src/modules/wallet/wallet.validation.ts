import { z } from "zod";

export const createWalletSchema = z.object({
  userId: z.string().uuid(), // For temporary purposes, we need to remove this after authentication is implemented
  currency: z
    .string()
    .length(3)
    .transform((value) => value.toUpperCase()),
});

export type CreateWalletRequest = z.infer<typeof createWalletSchema>;