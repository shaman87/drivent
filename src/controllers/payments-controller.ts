import { AuthenticatedRequest } from "@/middlewares";
import paymentsService from "@/services/payments-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getPayment(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const ticketId = Number(req.query.ticketId);
  if(!ticketId) return res.sendStatus(httpStatus.BAD_REQUEST);

  try {
    const payment = await paymentsService.getPaymentByTicketId(ticketId, userId);
    return res.status(httpStatus.OK).send(payment);
  } catch(error) {
    if(error.name === "NotFoundError") return res.sendStatus(httpStatus.NOT_FOUND);
    if(error.name === "UnauthorizedError") return res.sendStatus(httpStatus.UNAUTHORIZED);
  }
}

export async function postPayment(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { ticketId, cardData } = req.body;
  if(!ticketId || !cardData) return res.sendStatus(httpStatus.BAD_REQUEST);

  try {
    const payment = await paymentsService.createPayment(userId, ticketId, cardData);
    return res.status(httpStatus.OK).send(payment);
  } catch(error) {
    if(error.name === "NotFoundError") return res.sendStatus(httpStatus.NOT_FOUND);
    if(error.name === "UnauthorizedError") return res.sendStatus(httpStatus.UNAUTHORIZED);
  }
}
