import { z } from "zod";

const requiredString = z.string().trim().min(1, "Required");

export const signUpSchema = z.object({
  email: requiredString.email("Invalid email address"),
  username: requiredString.regex(
    /^[a-zA-Z0-9_-]+$/,
    "Only letters, numbers, - and _ allowed",
  ),
  password: requiredString.min(8, "Must be at least 8 characters"),
});

export type SignUpValues = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  username: requiredString,
  password: requiredString,
});

export type LoginValues = z.infer<typeof loginSchema>;

export const createPostSchema = z.object({
  content: requiredString,
  mediaIds: z.array(z.string()).max(5, "Cannot have more than 5 attachments"),
});

export const subscriptionTierSchema = z.object({
  name: requiredString.max(50, "Must be at most 50 characters"),
  description: z.string().max(500, "Must be at most 500 characters").optional(),
  price: z.number().min(0.01, "Price must be at least 0.01").max(999.99, "Price must be at most 999.99"),
  color: z.string().optional(),
  durationInMonths: z.number().int().min(1, "Duration must be at least 1 month").max(12, "Duration cannot be more than 12 months").optional().default(1),
});

export const updateUserProfileSchema = z.object({
  displayName: requiredString,
  bio: z.string().max(1000, "Must be at most 1000 characters"),
  subscriptionTiers: z.array(subscriptionTierSchema).max(10, "Cannot have more than 10 subscription tiers"),
});

export type SubscriptionTierValues = z.infer<typeof subscriptionTierSchema>;
export type UpdateUserProfileValues = {
  displayName: string;
  bio: string;
  subscriptionTiers: {
    id?: string;
    name: string;
    price: number;
    description?: string;
    color?: string;
    durationInMonths?: number;
  }[];
};

export const createCommentSchema = z.object({
  content: requiredString,
});
