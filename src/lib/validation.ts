import { z } from "zod";

// Indian mobile number: optional +91 / 91 prefix, then a 10-digit number starting 6-9.
const mobileRegex = /^(?:\+91|91)?[6-9]\d{9}$/;

export const leadFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .max(80, "Name is too long")
    .regex(/^[a-zA-Z\s.'-]+$/, "Name can only contain letters"),
  mobileNumber: z
    .string()
    .trim()
    .regex(mobileRegex, "Enter a valid 10-digit mobile number"),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;

export const CONFIGURATION_OPTIONS = [
  "Compact Office (Under 500 sq.ft)",
  "Standard Office (500 - 1000 sq.ft)",
  "Large Office (1000+ sq.ft)",
  "Retail Space",
  "Not Sure Yet",
] as const;

export const BUDGET_OPTIONS = [
  "Under 50 Lakhs",
  "50 Lakhs - 1 Crore",
  "1 Crore - 2 Crore",
  "Above 2 Crore",
] as const;

export const leadDetailsSchema = z.object({
  configuration: z.enum(CONFIGURATION_OPTIONS).optional().or(z.literal("")),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .optional()
    .or(z.literal("")),
  budget: z.enum(BUDGET_OPTIONS).optional().or(z.literal("")),
  message: z.string().trim().max(1000, "Message is too long").optional().or(z.literal("")),
});

export type LeadDetailsValues = z.infer<typeof leadDetailsSchema>;
