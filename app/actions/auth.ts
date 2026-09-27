import loginSchema from "@/schemas/loginSchema";
import { z } from "zod";

export async function signin(data: z.infer<typeof loginSchema>) {
  try {
   // Call the provider or db to sign in a user...
  } catch (e) {
    console.error(e);
  }

  // Call the provider or db to create a user...
}
