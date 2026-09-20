import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import * as transactionController from "./transaction.controller"

const router = Router();

router.use(authenticate)

router.get("/", transactionController.getUserTransactions);

export default router;