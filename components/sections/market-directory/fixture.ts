import type { MarketDirectoryProps } from "./schema";

export const marketDirectoryFixture: MarketDirectoryProps = {
  type: "market-directory",
  searchLabel: "Search for a country",
  searchPlaceholder: "Start typing a country or region…",
  countryColumnLabel: "Market",
  regionColumnLabel: "Region",
  emptyLabel: "No market matches that search.",
  marketSource: "all",
};
