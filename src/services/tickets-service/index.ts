import { notFoundError } from "@/errors";
import ticketsRepository from "@/repositories/tickets-repository";
import userRepository from "@/repositories/user-repository";
import { Ticket, TicketType } from "@prisma/client";

async function getTicketsTypes(): Promise<TicketType[]> {
  return await ticketsRepository.findManyTicketsTypes();
}

async function getTicketByUserId(userId: number): Promise<UserTicket> {
  const user = await userRepository.findById(userId);
  if(!user) throw notFoundError();

  const ticket = await ticketsRepository.findTicketByUserId(userId);
  if(!ticket) throw notFoundError();

  return ticket;
}

type UserTicket = Ticket & { TicketType: TicketType };

const ticketsService = { getTicketsTypes, getTicketByUserId };

export default ticketsService;
