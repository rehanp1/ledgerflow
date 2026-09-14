import express from 'express';
import walletRoutes from './modules/wallet/wallet.routes';
import authRoutes from "./modules/auth/auth.routes"

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
   res.status(200).json({
    status: "ok",
    service: "ledgerflow",
  });
});

app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/wallets", walletRoutes);

export default app;