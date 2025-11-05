import { z } from "zod";


export const RegisterSchema = z.object({
  username: z.string().min(1).max(30),
  password: z.string().min(3).max(30)
  
  
});


export const LoginSchema = z.object({
  username: z.string().min(1).max(30),
  password: z.string().min(3).max(30)
});