import Joi from "joi";

export const createPaymentSchema = Joi.object({
  ticketId: Joi.number().integer().required(), 
  cardData: Joi.object({
    issuer: Joi.string().required(), 
    number: Joi.number().integer().required(), 
    name: Joi.string().required(), 
    expirationDate: Joi.string().required(), 
    cvv: Joi.number().integer().required() 
  }).required()
});
