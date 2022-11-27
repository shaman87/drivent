import { notFoundError, requestError } from "@/errors";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketsRepository from "@/repositories/ticket-repository";
import { Ticket, TicketType } from "@prisma/client";

async function getTicketsTypes(): Promise<TicketType[]> {
  return await ticketsRepository.findManyTicketsTypes();
}

async function getTicketByUserId(userId: number): Promise<UserTicket> {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if(!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.findTicketByUserId(userId);
  if(!ticket) throw notFoundError();

  return ticket;
}

async function createTicket(userId: number, ticketTypeId: number): Promise<UserTicket> {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if(!enrollment) throw notFoundError();

  const newTicket = await ticketsRepository.createTicket(ticketTypeId, enrollment.id);
  if(!newTicket) throw requestError(400, "Bad Request");

  return newTicket;
}

type UserTicket = Ticket & { TicketType: TicketType };

const ticketsService = { getTicketsTypes, getTicketByUserId, createTicket };

export default ticketsService;
