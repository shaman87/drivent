import faker from "@faker-js/faker";
import { prisma } from "@/config";

export async function createRoom(hotelId: number) {
  return prisma.room.create({
    data: {
      name: faker.name.findName(), 
      capacity: faker.datatype.number(),
      hotelId
    }
  });
}

export async function createRoomWithCapacity(hotelId: number, capacity: number) {
  return prisma.room.create({
    data: {
      name: faker.name.findName(), 
      capacity, 
      hotelId
    }
  });
}
