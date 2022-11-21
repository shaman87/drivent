import { getPayment } from "@/controllers/payments-controller";
import { authenticateToken } from "@/middlewares";
import { Router } from "express";

const paymentsRouter = Router();
paymentsRouter
  .all("/*", authenticateToken)
  .get("/", getPayment);

export { paymentsRouter };
