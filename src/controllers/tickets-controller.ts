import { AuthenticatedRequest } from "@/middlewares";
import ticketsService from "@/services/tickets-service";
import { Response } from "express";
import httpStatus, { BAD_REQUEST, NOT_FOUND } from "http-status";

export async function getTicketsTypes(req: AuthenticatedRequest, res: Response) {
  try {
    const ticketsTypes = await ticketsService.getTicketsTypes();
    return res.status(httpStatus.OK).send(ticketsTypes);
  } catch(error) {
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

export async function getTicket(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const ticket = await ticketsService.getTicketByUserId(userId);
    return res.status(httpStatus.OK).send(ticket);
  } catch(error) {
    if(error.name === "NotFoundError") return res.sendStatus(NOT_FOUND);
  }
}

export async function postTicket(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { ticketTypeId } = req.body;

  try {
    const newTicket = await ticketsService.createTicket(userId, ticketTypeId);
    return res.status(httpStatus.CREATED).send(newTicket);
  } catch(error) {
    if(error.name === "NotFoundError") return res.sendStatus(NOT_FOUND);
    if(error.name === "RequestError") return res.sendStatus(BAD_REQUEST);
  }
}
