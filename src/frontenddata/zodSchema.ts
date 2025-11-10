import { z } from "zod";


export const RegisterSchema = z.object({
  username: z.string().min(5, 'Username must be at least 5 characters').max(30, "Username must be less than 30 characters").regex(/^[a-zA-Z0-9]+$/, "Username can only contain letters and numbers"),
 
  password: z.string().min(6, 'Password must be at least 6 characters').max(30, 'Password must be less than 30 characters').regex(/^[a-zA-Z0-9!?]+$/, 'Password can only contain letters, numbers, ! and ?'),

  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don not match",
  path: ["confirmPassword"],
});

export const getRegisterErrorMessage = (error: z.ZodError): string => {
  const firstError = error.issues[0];
  
  if (firstError.path.includes('confirmPassword')) {
    return "Passwords don't match";
  } else if (firstError.path.includes('password')) {
    return firstError.message || "Password requirements not met";
  } else if (firstError.path.includes('username')) {
    return firstError.message || "Username requirements not met";
  } else {
    return 'Registration failed. Please check your input.';
  }
}

export const LoginSchema = z.object({
  username: z.string().min(4).max(30),
  password: z.string().min(4).max(30)
});

export const validateAndGetError = <T>(
  schema: z.ZodSchema<T>, 
  data: unknown,
  errorHandler: (error: z.ZodError) => string
): { success: true; data: T } | { success: false; error: string } => {
  
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: errorHandler(result.error) };
  }
};