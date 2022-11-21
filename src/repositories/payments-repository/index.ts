import { prisma } from "@/config";
import { Payment } from "@prisma/client";

async function findPaymentByTicketId(ticketId: number) {
  return prisma.payment.findFirst({
    where: {
      ticketId
    }
  });
}

async function createPayment(newPayment: Omit<Payment, "id" | "createdAt" | "updatedAt">) {
  return prisma.payment.create({
    data: newPayment
  });
}

const paymentsRepository = { findPaymentByTicketId, createPayment };

export default paymentsRepository;
