import { Router } from "express";
import { authenticateToken, validateBody } from "@/middlewares";
import { getTicket, getTicketsTypes, postTicket } from "@/controllers/tickets-controller";
import { createTicketSchema } from "@/schemas";

const ticketsRouter = Router();

ticketsRouter
  .all("/*", authenticateToken)
  .get("/types", getTicketsTypes)
  .get("/", getTicket)
  .post("/", validateBody(createTicketSchema), postTicket);

export { ticketsRouter };
