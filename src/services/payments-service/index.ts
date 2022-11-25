import { notFoundError, unauthorizedError } from "@/errors";
import { CardData } from "@/protocols";
import paymentsRepository from "@/repositories/payments-repository";
import ticketsRepository from "@/repositories/tickets-repository";
import { Payment } from "@prisma/client";

async function getPaymentByTicketId(ticketId: number, userId: number): Promise<Payment> {
  const ticket = await ticketsRepository.findTicketById(ticketId);
  if(!ticket) throw notFoundError();
  if(ticket.Enrollment.userId !== userId) throw unauthorizedError();
  
  const payment = await paymentsRepository.findPaymentByTicketId(ticketId);

  return payment;
}

async function createPayment(userId: number, ticketId: number, cardData: CardData) {
  const ticket = await ticketsRepository.findTicketById(ticketId);
  if(!ticket) throw notFoundError();
  if(ticket.Enrollment.userId !== userId) throw unauthorizedError();

  const newPayment: Omit<Payment, "id" | "createdAt" | "updatedAt"> = {
    ticketId, 
    value: ticket.TicketType.price, 
    cardIssuer: cardData.issuer, 
    cardLastDigits: cardData.number.toString().slice(-4)
  };

  const payment = await paymentsRepository.createPayment(newPayment);
  await ticketsRepository.updateStatusTicket(ticketId);

  return payment;
}

const paymentsService = { getPaymentByTicketId, createPayment };

export default paymentsService;
