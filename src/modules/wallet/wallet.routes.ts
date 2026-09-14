import { Router } from 'express';
import * as walletController from './wallet.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate)

router.post("/", walletController.createWallet);
router.get("/:walletId", walletController.getWalletById);
// router.get("/wallets/:walletId/balance")

// router.post("/wallets/:walletId/deposit")
// router.post("/wallets/:walletId/withdraw")
// router.post("/transfer")

export default router;