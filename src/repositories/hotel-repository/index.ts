import { prisma } from "@/config";
import { Room } from "@prisma/client";

async function findManyHotels() {
  return prisma.hotel.findMany();
}

async function findHotelById(hotelId: number) {
  return prisma.hotel.findUnique({
    where: {
      id: hotelId
    }, 
    include: {
      Rooms: true
    }
  });
}

async function findRoomById(roomId: number): Promise<Room> {
  return prisma.room.findUnique({
    where: {
      id: roomId
    }
  });
}

const hotelsRepository = { findManyHotels, findHotelById, findRoomById };

export default hotelsRepository;
