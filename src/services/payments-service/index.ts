import { notFoundError, requestError, unauthorizedError } from "@/errors";
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

const paymentsService = { getPaymentByTicketId };

export default paymentsService;
