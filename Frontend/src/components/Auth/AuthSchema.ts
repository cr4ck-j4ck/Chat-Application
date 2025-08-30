// src/components/Auth/AuthSchemas.ts
import * as z from "zod";

const allowedDomains = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "aol.com",
  "protonmail.com",
  "yandex.com",
  "mail.com",
];

export const loginSchema = z.object({
  email: z.email({ pattern: z.regexes.html5Email }),
  password: z.string().min(1, "Password is required"),
});


export const signupSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be less than 50 characters"),
    lastName: z.string().optional(),
    userName: z.string().min(5, "UserName must be at least 5 Characters"),
    email: z
      .string()
      .email("Please enter a valid email address")
      .refine((email) => {
        const domain = email.split("@")[1]?.toLowerCase();
        return domain && allowedDomains.includes(domain);
      }, `Please use a popular email provider (${allowedDomains.slice(0, 4).join(", ")}, etc.)`),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;