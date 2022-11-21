import { AuthenticatedRequest } from "@/middlewares";
import paymentsService from "@/services/payments-service";
import { Response } from "express";
import httpStatus, { BAD_REQUEST, NOT_FOUND, UNAUTHORIZED } from "http-status";

export async function getPayment(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const ticketId = Number(req.query.ticketId);
  if(!ticketId) return res.sendStatus(BAD_REQUEST);

  try {
    const payment = await paymentsService.getPaymentByTicketId(ticketId, userId);
    return res.status(httpStatus.OK).send(payment);
  } catch(error) {
    if(error.name === "NotFoundError") return res.sendStatus(NOT_FOUND);
    if(error.name === "UnauthorizedError") return res.sendStatus(UNAUTHORIZED);
  }
}
