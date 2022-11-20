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

async function createTicket(ticketTypeId: number, enrollmentId: number) {
  return prisma.ticket.create({
    data: {
      status: "RESERVED", 
      ticketTypeId, 
      enrollmentId
    }, 
    include: {
      TicketType: true
    }
  });
}

const ticketsRepository = { findManyTicketsTypes, findTicketByUserId, createTicket };

export default ticketsRepository;
