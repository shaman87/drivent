import { notFoundError, paymentRequiredError } from "@/errors";
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

async function getHotelRooms(userId: number, hotelId: number) {
  const ticket = await ticketsRepository.findTicketByUserId(userId);

  if(!ticket || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) throw forbiddenError();
  if(ticket.status !== "PAID") throw paymentRequiredError();

  const hotelRooms = await hotelsRepository.findHotelById(hotelId);
  if(!hotelRooms) throw notFoundError();

  return hotelRooms;
}

const hotelsService = { getHotelsByUserId, getHotelRooms };

export default hotelsService;
