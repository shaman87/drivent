import { AuthenticatedRequest } from "@/middlewares";
import bookingService from "@/services/booking-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const booking = await bookingService.getBookingByUserId(userId);
    return res.status(httpStatus.OK).send(booking);
  } catch(error) {
    if(error.name === "NotFoundError") return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;
  
  if(!roomId || isNaN(roomId) || roomId <= 0) return res.sendStatus(httpStatus.BAD_REQUEST);

  try {
    const booking = await bookingService.createBooking(userId, roomId);
    return res.status(httpStatus.OK).send({ bookingId: booking.id });
  } catch(error) {
    if(error.name === "NotFoundError") return res.sendStatus(httpStatus.NOT_FOUND);
    if(error.name === "ForbiddenError") return res.sendStatus(httpStatus.FORBIDDEN);
  }
}
