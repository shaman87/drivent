import { paymentRequiredError } from "@/errors";
import { forbiddenError } from "@/errors/forbidden-error";
import hotelsRepository from "@/repositories/hotel-repository";
import ticketsRepository from "@/repositories/ticket-repository";
import { Hotel } from "@prisma/client";

async function getHotelsByUserId(userId: number): Promise<Hotel[]> {
  const ticket = await ticketsRepository.findTicketByUserId(userId);

  if(!ticket || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) throw forbiddenError();
  if(ticket.status !== "PAID") throw paymentRequiredError();

  const hotels = await hotelsRepository.findManyHotels();

  return hotels;
}

const hotelsService = { getHotelsByUserId };

export default hotelsService;
