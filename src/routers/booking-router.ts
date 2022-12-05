import { authenticateToken } from "@/middlewares";
import { getBooking, postBooking } from "@/controllers/booking-controller";
import { Router } from "express";

const bookingRouter = Router();

bookingRouter
  .all("/*", authenticateToken)
  .get("/", getBooking)
  .post("/", postBooking);

export { bookingRouter };
