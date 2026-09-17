import { z } from "zod";
import { CONTACT_INTENTS } from "@/lib/forms/contact";

/**
 * Template H — a real, working contact form.
 *
 * Replaces the presentational panel inside `contact-split`, which was always
 * marked as a placeholder. That section stays for pages that only need the
 * routing cards.
 */
export const contactFormSchema = z.object({
  type: z.literal("contact-form"),
  intent: z.enum(CONTACT_INTENTS),
});

export type ContactFormProps = z.infer<typeof contactFormSchema>;
