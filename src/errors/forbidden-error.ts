import { ApplicationError } from "@/protocols";

export function forbiddenError(): ApplicationError {
  return {
    name: "ForbiddenError", 
    message: "You do not have permission for this request"
  };
}
