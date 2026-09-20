import { z } from "zod";

export const createWalletSchema = z.object({
  currency: z
    .string()
    .length(3)
    .transform((value) => value.toUpperCase()),
});

export type CreateWalletRequest = z.infer<typeof createWalletSchema>;

export const depositSchema = z.object({
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, {
      message: "Amount must be a valid decimal"
    })
    .refine((value) => Number(value) > 0, {
      message: "Amount must be greater than zero"
    })
})

export const withdrawSchema = z.object({
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, {
      message: "Amount must be a valid decimal",
    })
    .refine((value) => Number(value) > 0, {
      message: "Amount must be greater than zero",
    }),
});

export const transferSchema = z.object({
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, {
      message: "Amount must be a valid decimal",
    })
    .refine((value) => Number(value) > 0, {
      message: "Amount must be greater than zero",
    }),
  
  sourceWalletId: z.string().trim(),
  destinationWalletId: z.string().trim()
})