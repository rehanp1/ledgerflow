import { Router } from 'express';
import * as walletController from './wallet.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate)

router.post("/", walletController.createWallet);
router.get("/:walletId", walletController.getWalletById);
// router.get("/wallets/:walletId/balance")

router.post("/:walletId/deposit", walletController.deposit)
router.post("/:walletId/withdraw", walletController.withdraw)
router.post("/transfer", walletController.transfer)

export default router;