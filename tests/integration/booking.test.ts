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
  createPayment,
  createRoomWithCapacity
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

describe("POST /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    
    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 400 when roomId is not given", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 400 when given roomId is not a number", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeHotel = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketTypeHotel.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketTypeHotel.price);
      const hotel = await createHotel();
      await createRoom(hotel.id);
      const roomId = faker.lorem.word();

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId });

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 400 when given roomId is invalid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const roomId = 0;

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId });

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 404 when user does not have an enrollment", async () => {
      const token = await generateValidToken();
      const roomId = faker.datatype.number();

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId });

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 when room is not found", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeHotel = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketTypeHotel.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketTypeHotel.price);
      await createHotel();
      const roomId = faker.datatype.number();

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId });

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 when user does not have a ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);
      const roomId = faker.datatype.number();

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId });
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 403 when user does not have a paid ticket that is not remote and includes hotel", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeHotel = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketTypeHotel.id, TicketStatus.RESERVED);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: room.id });
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when user already has a booking", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeHotel = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketTypeHotel.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketTypeHotel.price);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);
      const secondRoom = await createRoom(hotel.id);
      await createBooking(user.id, secondRoom.id);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: room.id });
      
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when room is at full capacity", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeHotel = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketTypeHotel.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketTypeHotel.price);
      const hotel = await createHotel();
      const capacity = 1;
      const room = await createRoomWithCapacity(hotel.id, capacity);
      const secondUser = await createUser();
      await createBooking(secondUser.id, room.id);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: room.id });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 200 with bookingId when given roomId is valid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketTypeHotel = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketTypeHotel.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketTypeHotel.price);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: room.id });

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({
        bookingId: expect.any(Number)
      });
    });
  });
});

describe("PUT /booking/:bookingId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const bookingId = faker.datatype.number();

    const response = await server.put(`/booking/${bookingId}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    const bookingId = faker.datatype.number();

    const response = await server.put(`/booking/${bookingId}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const bookingId = faker.datatype.number();

    const response = await server.put(`/booking/${bookingId}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  describe("when token is valid", () => {
    it("should respond with status 400 when roomId is not given", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const bookingId = faker.datatype.number();

      const response = await server.put(`/booking/${bookingId}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 400 when bookingId is not given", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const bookingId = faker.datatype.number();
      
      const response = await server.put(`/booking/${bookingId}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 400 when given roomId is not a number", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);
      const booking = await createBooking(user.id, room.id);
      const roomId = faker.lorem.word();

      const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send({ roomId });

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 400 when given bookingId is not a number", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);
      await createBooking(user.id, room.id);
      const bookingId = faker.lorem.word();

      const response = await server.put(`/booking/${bookingId}`).set("Authorization", `Bearer ${token}`).send({ roomId: room.id });

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 400 when given roomId is invalid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const roomId = 0;

      const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send({ roomId });

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 400 when given bookingId is invalid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const roomId = 1;
      const bookingId = 0;

      const response = await server.put(`/booking/${bookingId}`).set("Authorization", `Bearer ${token}`).send({ roomId });

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 404 when booking is not found", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);

      const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send({ roomId: room.id });
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 403 when user does not own the booking", async () => {
      const user = await createUser();
      const otherUser = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);
      await createBooking(user.id, room.id);
      const otherUserBooking = await createBooking(otherUser.id, room.id);

      const response = await server.put(`/booking/${otherUserBooking.id}`).set("Authorization", `Bearer ${token}`).send({ roomId: room.id });
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 404 when room is not found", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);

      const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send({ roomId: room.id + 1 });
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 403 when user tries to update booking to the same room", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const capacity = 1;
      const room = await createRoomWithCapacity(hotel.id, capacity);
      const booking = await createBooking(user.id, room.id);

      const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send({ roomId: room.id });
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when room is at full capacity", async () => {
      const user = await createUser();
      const otherUser = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const capacity = 1;
      const room = await createRoomWithCapacity(hotel.id, capacity);
      const otherRoom = await createRoomWithCapacity(hotel.id, capacity);
      const booking = await createBooking(user.id, otherRoom.id);
      const otherUserBooking = await createBooking(otherUser.id, room.id);

      const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send({ roomId: room.id });
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 200 with bookingId when given roomId and bookingId are valids", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);
      const booking = await createBooking(user.id, room.id);
      const updatedRoom = await createRoom(hotel.id);

      const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send({ roomId: updatedRoom.id });

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({
        bookingId: expect.any(Number)
      });
    });
  });
});
