import { AuthenticatedRequest } from "@/middlewares";
import ticketsService from "@/services/tickets-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getTicketsTypes(req: AuthenticatedRequest, res: Response) {
  try {
    const ticketsTypes = await ticketsService.getTicketsTypes();
    return res.status(httpStatus.OK).send(ticketsTypes);
  } catch(error) {
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}
