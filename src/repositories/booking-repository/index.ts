import { prisma } from "@/config";

async function findBookingById(bookingId: number) {
  return prisma.booking.findFirst({
    where: {
      id: bookingId
    }, 
    include: {
      Room: true
    }
  });
}

async function findBookingByUserId(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId
    }, 
    include: {
      Room: true
    }
  });
}

async function findBookingsByRoomId(roomId: number) {
  return prisma.booking.findMany({
    where: {
      roomId
    }
  });
}

async function createBooking(userId: number, roomId: number) {
  return prisma.booking.create({
    data: {
      userId, 
      roomId
    }
  });
}

async function updateBooking(bookingId: number, roomId: number) {
  return prisma.booking.update({
    data: {
      roomId
    }, 
    where: {
      id: bookingId
    }
  });
}

const bookingRepository = { findBookingById, findBookingByUserId, findBookingsByRoomId, createBooking, updateBooking };

export default bookingRepository;
