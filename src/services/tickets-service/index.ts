import ticketsRepository from "@/repositories/tickets-repository";
import { TicketType } from "@prisma/client";

async function getTicketsTypes(): Promise<TicketType[]> {
  return await ticketsRepository.findManyTicketsTypes();
}

const ticketsService = { getTicketsTypes };

export default ticketsService;
