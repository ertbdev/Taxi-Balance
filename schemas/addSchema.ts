import { z } from "zod";

const schema = z.object({
  servicios: z.string().min(1, { message: "Email is required" }),
  efectivo: z.string().min(1, { message: "Email is required" }),
  tarjeta: z.string().min(1, { message: "Email is required" }),

});

export default schema;
