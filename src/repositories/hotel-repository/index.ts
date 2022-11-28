import { prisma } from "@/config";

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

const hotelsRepository = { findManyHotels, findHotelById };

export default hotelsRepository;
