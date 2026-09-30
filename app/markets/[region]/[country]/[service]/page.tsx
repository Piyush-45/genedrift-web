import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServicePage } from "@/components/country-service/service-page";
import { ContactSplit } from "@/components/sections/contact-split";
import { contactSplitFixture } from "@/components/sections/contact-split/fixture";
import { countryServiceRoutes, getCountryService } from "@/lib/content/country-services-source";
import { getMarket, getRegion } from "@/lib/content/markets-source";

/**
 * Country service pages: /markets/{region}/{country}/{service}.
 *
 * `dynamicParams = true` for the same reason as the market routes: service
 * pages are CMS records, and one published after the build must not 404.
 * Unknown services still 404 through `getCountryService` returning nothing.
 *
 * The market must also exist and be active. A service row pointing at a
 * retired country should not keep a page alive on its own.
 */
export const dynamicParams = true;

export async function generateStaticParams() {
  return countryServiceRoutes();
}

type Params = Promise<{ region: string; country: string; service: string }>;

async function load(params: Params) {
  const { region, country, service } = await params;
  const [record, market, regionRecord] = await Promise.all([
    getCountryService(region, country, service),
    getMarket(region, country),
    getRegion(region),
  ]);
  if (!record || !market) return null;
  return { record, regionName: regionRecord?.name ?? region };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const loaded = await load(params);
  if (!loaded) return { title: "Markets — Genedrift" };
  const { record } = loaded;
  return {
    title: record.seoTitle || `${record.serviceName} in ${record.marketName} — Genedrift`,
    description:
      record.seoDescription || record.summary || `${record.serviceName} in ${record.marketName} with Genedrift.`,
  };
}

export default async function CountryServiceRoute({ params }: { params: Params }) {
  const loaded = await load(params);
  if (!loaded) notFound();

  return (
    <main className="pb-section">
      <ServicePage service={loaded.record} regionName={loaded.regionName} />
      <ContactSplit {...contactSplitFixture} />
    </main>
  );
}
