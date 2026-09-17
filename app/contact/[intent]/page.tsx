import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactForm } from "@/components/sections/contact-form";
import { CONTACT_INTENTS, INTENTS, isContactIntent } from "@/lib/forms/contact";

/** Template H — one page per enquiry intent. */
export const dynamicParams = false;

export function generateStaticParams() {
  return CONTACT_INTENTS.map((intent) => ({ intent }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ intent: string }>;
}): Promise<Metadata> {
  const { intent } = await params;
  if (!isContactIntent(intent)) return { title: "Contact — Genedrift" };
  const config = INTENTS[intent];
  return {
    title: `${config.label} — Genedrift`,
    description: config.standfirst,
    // A channel that is not accepting submissions should not be collecting
    // search traffic that ends in a dead end.
    robots: config.enabled ? undefined : { index: false, follow: true },
  };
}

export default async function ContactIntentPage({
  params,
}: {
  params: Promise<{ intent: string }>;
}) {
  const { intent } = await params;
  if (!isContactIntent(intent)) notFound();

  return (
    <main className="pb-section">
      <ContactForm intent={intent} />
    </main>
  );
}
