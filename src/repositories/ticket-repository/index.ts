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

async function findTicketById(ticketId: number) {
  return prisma.ticket.findUnique({
    where: {
      id: ticketId
    }, 
    include: {
      TicketType: true, 
      Enrollment: true
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

async function updateStatusTicket(ticketId: number) {
  return prisma.ticket.update({
    where: {
      id: ticketId
    }, 
    data: {
      status: "PAID"
    }
  });
}

const ticketsRepository = { findManyTicketsTypes, findTicketByUserId, findTicketById, createTicket, updateStatusTicket };

export default ticketsRepository;
