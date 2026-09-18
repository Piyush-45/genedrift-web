import type { IndustryIndexProps } from "./schema";

/**
 * Product-type lists are placeholder, marked as sample content in the design.
 * They are plausible for an RA/PV consultancy but have not been confirmed by
 * the client — do not present them as Genedrift's verified capability list.
 *
 * NO `href`. The approved concept-B design contains no links at all: the
 * section is a self-contained index, and reading an industry's product types
 * IS the interaction. A per-industry page was never designed, never specced
 * and never asked for, and the five links added here pointed at routes that
 * do not exist -- `/industries/*` is not a pillar, so every one returned 404
 * on the live site. Restoring a link is one line per item, once there is a
 * page at the other end of it.
 */
export const industryIndexFixture: IndustryIndexProps = {
  type: "industry-index",
  eyebrow: "Industries & product categories",
  heading: "Specialist support across regulated product categories.",
  standfirst:
    "Category knowledge stays connected to local market requirements, submission pathways and lifecycle obligations.",
  countLabel: "types",
  items: [
    {
      title: "Pharmaceuticals",
      summary: "Prescription, OTC and complex portfolios",
      icon: "pharmaceuticals",
      productTypes: [
        "Generics", "NCEs / NDAs", "Biologics", "Biosimilars", "Vaccines",
        "Oncology", "Sterile injectables", "Controlled substances",
        "Paediatric formulations", "Fixed-dose combinations",
      ],
    },
    {
      title: "Medical Devices & IVDs",
      summary: "Classification, registration and lifecycle",
      icon: "devices",
      productTypes: [
        "Class I–III devices", "In-vitro diagnostics", "Software as a medical device",
        "Implantables", "Electro-medical", "Sterile single-use", "Combination products",
      ],
    },
    {
      title: "Food Supplements",
      summary: "Market pathway and compliance support",
      icon: "supplements",
      productTypes: [
        "Nutraceuticals", "Vitamins & minerals", "Botanicals",
        "Sports nutrition", "Infant nutrition", "Medical foods",
      ],
    },
    {
      title: "Cosmetics",
      summary: "Notification, claims and local requirements",
      icon: "cosmetics",
      productTypes: [
        "Skin care", "Hair care", "Colour cosmetics",
        "Sunscreens", "Oral care", "Fragrances",
      ],
    },
    {
      title: "Veterinary Products",
      summary: "Regulatory planning and market support",
      icon: "veterinary",
      productTypes: [
        "Companion animal", "Livestock", "Vaccines", "Feed additives", "Antiparasitics",
      ],
    },
  ],
};
