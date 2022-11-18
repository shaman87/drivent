import { prisma } from "@/config";

async function findManyTicketsTypes() {
  return prisma.ticketType.findMany();
}

const ticketsRepository = { findManyTicketsTypes };

export default ticketsRepository;
