import { getHotels, getHotelWithRooms } from "@/controllers/hotel-controller";
import { authenticateToken } from "@/middlewares";
import { Router } from "express";

const hotelsRouter = Router();

hotelsRouter
  .all("/*", authenticateToken)
  .get("/", getHotels)
  .get("/:hotelId", getHotelWithRooms);

export { hotelsRouter };
