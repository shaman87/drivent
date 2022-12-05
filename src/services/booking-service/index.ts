import { notFoundError, forbiddenError } from "@/errors";
import bookingRepository from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import hotelsRepository from "@/repositories/hotel-repository";
import ticketsRepository from "@/repositories/ticket-repository";
import { exclude } from "@/utils/prisma-utils";
import { Booking, Room, TicketStatus } from "@prisma/client";

async function getBookingByUserId(userId: number): Promise<getBookingByUserIdResult> {
  const booking = await bookingRepository.findBookingByUserId(userId);
  if(!booking) throw notFoundError();

  return {
    ...exclude(booking, "userId", "roomId", "createdAt", "updatedAt"), 
    Room: { ...exclude(booking.Room, "createdAt", "updatedAt") }
  };
}

type getBookingByUserIdResult = Omit<Booking, "userId" | "roomId" | "createdAt" | "updatedAt"> & {
  Room: Omit<Room, "createdAt" | "updatedAt">
}

async function createBooking(userId: number, roomId: number): Promise<Booking> {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if(!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.findTicketByUserId(userId);
  if(!ticket) throw notFoundError();
  if(ticket.status !== TicketStatus.PAID || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw forbiddenError();
  }

  const room = await hotelsRepository.findRoomById(roomId);
  if(!room) throw notFoundError();

  const userBooking = await bookingRepository.findBookingByUserId(userId);
  if(userBooking) throw forbiddenError();

  const roomBookings = await bookingRepository.findBookingsByRoomId(roomId);
  if(roomBookings.length >= room.capacity) throw forbiddenError();

  const booking = await bookingRepository.createBooking(userId, roomId);
  return booking;
}

const bookingService = { getBookingByUserId, createBooking };

export default bookingService;
