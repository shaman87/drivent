import { notFoundError } from "@/errors";
import bookingRepository from "@/repositories/booking-repository";
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

const bookingService = { getBookingByUserId };

export default bookingService;
