import { Router } from 'express';
import * as walletController from './wallet.controller';

const router = Router();

router.post("/", walletController.createWallet);
router.get("/:walletId", walletController.getWalletById);
// router.get("/wallets/:walletId/balance")

// router.post("/wallets/:walletId/deposit")
// router.post("/wallets/:walletId/withdraw")
// router.post("/transfer")

export default router;