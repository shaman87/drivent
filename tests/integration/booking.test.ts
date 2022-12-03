import app, { init } from "@/app";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import supertest from "supertest";
import * as jwt from "jsonwebtoken";
import { TicketStatus } from "@prisma/client";
import { cleanDb, generateValidToken } from "../helpers";
import { 
  createEnrollmentWithAddress, 
  createHotel, 
  createTicket, 
  createTicketTypeWithHotel, 
  createUser, 
  createBooking,
  createRoom,
  createPayment
} from "../factories";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    
    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 if user has no booking", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeHotel = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketTypeHotel.id, TicketStatus.PAID);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 200 and booking data if user has booking", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeHotel = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketTypeHotel.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketTypeHotel.price);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);
      const booking = await createBooking(user.id, room.id);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({
        id: booking.id, 
        Room: {
          id: room.id, 
          name: room.name, 
          capacity: room.capacity, 
          hotelId: room.hotelId
        }
      });
    });
  });
});
