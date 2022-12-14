import app, { init } from "@/app";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import supertest from "supertest";
import * as jwt from "jsonwebtoken";
import { createEnrollmentWithAddress, createHotel, createPayment, createRoom, createTicket, createTicketTypeWithHotel, createTicketTypeWithoutHotel, createUser } from "../factories";
import { cleanDb, generateValidToken } from "../helpers";
import { TicketStatus } from "@prisma/client";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /hotels", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    
    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 403 if user has no ticket that includes hotel", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeHotel = await createTicketTypeWithoutHotel();
      await createTicket(enrollment.id, ticketTypeHotel.id, TicketStatus.RESERVED);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 402 if user has unpaid ticket that includes hotel", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeHotel = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketTypeHotel.id, TicketStatus.RESERVED);
  
      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });
  });

  describe("when user has paid ticket that includes hotel", () => {
    it("should respond with status 200 and with empty array when there are no hotels", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeHotel = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketTypeHotel.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketTypeHotel.price);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual(
        expect.arrayContaining([])
      );
    });

    it("should respond with status 200 and with existing hotels data", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeHotel = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketTypeHotel.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketTypeHotel.price);
      const hotel = await createHotel();

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: hotel.id,
            name: hotel.name,
            image: hotel.image,
            createdAt: hotel.createdAt.toISOString(),
            updatedAt: hotel.updatedAt.toISOString()
          })
        ])
      );
    });
  });
});

describe("GET /hotels/:hotelId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    
    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 403 if user has no ticket that includes hotel", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeHotel = await createTicketTypeWithoutHotel();
      await createTicket(enrollment.id, ticketTypeHotel.id, TicketStatus.RESERVED);
      const hotel = await createHotel();

      const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 402 if user has unpaid ticket that includes hotel", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeHotel = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketTypeHotel.id, TicketStatus.RESERVED);
      const hotel = await createHotel();
  
      const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    describe("when user has paid ticket that includes hotel", () => {
      it("should respond with status 400 when hotelId is invalid", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketTypeHotel = await createTicketTypeWithHotel();
        const ticket = await createTicket(enrollment.id, ticketTypeHotel.id, TicketStatus.PAID);
        await createPayment(ticket.id, ticketTypeHotel.price);
  
        const response = await server.get("/hotels/:hotelId").set("Authorization", `Bearer ${token}`);
  
        expect(response.status).toBe(httpStatus.BAD_REQUEST);
      });
  
      it("should respond with status 404 when hotelId is not found", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketTypeHotel = await createTicketTypeWithHotel();
        const ticket = await createTicket(enrollment.id, ticketTypeHotel.id, TicketStatus.PAID);
        await createPayment(ticket.id, ticketTypeHotel.price);
        const hotelId = 1;
  
        const response = await server.get(`/hotels/${hotelId}`).set("Authorization", `Bearer ${token}`);
  
        expect(response.status).toBe(httpStatus.NOT_FOUND);
      });

      it("should respond with status 200 and with empty array for Rooms when there are no rooms in the hotel", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketTypeHotel = await createTicketTypeWithHotel();
        const ticket = await createTicket(enrollment.id, ticketTypeHotel.id, TicketStatus.PAID);
        await createPayment(ticket.id, ticketTypeHotel.price);
        const hotel = await createHotel();
  
        const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);
  
        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual(
          expect.objectContaining({
            id: hotel.id, 
            name: hotel.name, 
            image: hotel.image, 
            createdAt: hotel.createdAt.toISOString(),
            updatedAt: hotel.updatedAt.toISOString(),
            Rooms: []
          })
        );
      });

      it("should respond with status 200 and with existing hotel rooms data", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketTypeHotel = await createTicketTypeWithHotel();
        const ticket = await createTicket(enrollment.id, ticketTypeHotel.id, TicketStatus.PAID);
        await createPayment(ticket.id, ticketTypeHotel.price);
        const hotel = await createHotel();
        const room = await createRoom(hotel.id);
  
        const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);
  
        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual(
          expect.objectContaining({
            id: hotel.id, 
            name: hotel.name, 
            image: hotel.image, 
            createdAt: hotel.createdAt.toISOString(),
            updatedAt: hotel.updatedAt.toISOString(),
            Rooms: [
              {
                id: room.id,
                name: room.name,
                capacity: room.capacity,
                hotelId: room.hotelId,
                createdAt: room.createdAt.toISOString(),
                updatedAt: room.updatedAt.toISOString()
              }
            ]
          })
        );
      });
    });
  });
});
