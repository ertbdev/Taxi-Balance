import { z } from "zod";

const schema = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(1, { message: "Password is required" }),
});

export default schema;
