import { prisma } from "@/config";

async function findManyTicketsTypes() {
  return prisma.ticketType.findMany();
}

async function findTicketByUserId(userId: number) {
  return prisma.ticket.findFirst({
    where: {
      Enrollment: {
        User: {
          id: userId
        }
      }
    }, 
    include: {
      TicketType: true
    }
  });
}

const ticketsRepository = { findManyTicketsTypes, findTicketByUserId };

export default ticketsRepository;
