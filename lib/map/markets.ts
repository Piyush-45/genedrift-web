/**
 * The 46 markets, with their projected position on the map above.
 *
 * `capabilities` is an ARRAY, not three named fields. The client has not
 * confirmed whether a market always has exactly three (blocker 1) — modelling
 * it as a list means the answer never blocks the frontend, and reduces that
 * question to a Creator subform decision. See context/decisions.md.
 *
 * Extracted from the approved design. Two slugs were reconciled on the way:
 * the map called them `c-te-d-ivoire` and `dem-rep-congo`, the region cards
 * called them `c-te-divoire` and `dr-congo` — four spellings, two countries.
 * Canonical: `cote-divoire`, `dr-congo`.
 */
export type CapabilityStatus = "available" | "upcoming" | "none";

export interface MarketCapability {
  name: string;
  status: CapabilityStatus;
}

export interface Market {
  slug: string;
  name: string;
  region: string;
  regionSlug: string;
  href: string;
  /** Hours from UTC. Used for the local-time readout on the hover card. */
  utcOffset: number;
  x: number;
  y: number;
  capabilities: MarketCapability[];
  /**
   * The market's health authority — "CDSCO", "NAFDAC", "SFDA".
   *
   * OPTIONAL, and empty in this built-in data on purpose. A regulator's name
   * is a factual claim on a regulatory consultancy's own site, so it comes
   * from the client through Creator rather than from us guessing 46 of them.
   * Until it does, the homepage authority strip renders nothing and the
   * country pages simply do not mention an authority.
   */
  authority?: string;
}

export const MARKETS: readonly Market[] = [
  {
    "slug": "benin",
    "name": "Benin",
    "region": "Africa",
    "regionSlug": "africa",
    "href": "/markets/africa/benin",
    "utcOffset": 1.0,
    "x": 587.4,
    "y": 253.8,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "none"
      },
      {
        "name": "Pharmacovigilance",
        "status": "none"
      }
    ]
  },
  {
    "slug": "burkina-faso",
    "name": "Burkina Faso",
    "region": "Africa",
    "regionSlug": "africa",
    "href": "/markets/africa/burkina-faso",
    "utcOffset": 0.0,
    "x": 575.9,
    "y": 242.7,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "none"
      },
      {
        "name": "Pharmacovigilance",
        "status": "none"
      }
    ]
  },
  {
    "slug": "cameroon",
    "name": "Cameroon",
    "region": "Africa",
    "regionSlug": "africa",
    "href": "/markets/africa/cameroon",
    "utcOffset": 1.0,
    "x": 623.9,
    "y": 261.2,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "none"
      },
      {
        "name": "Pharmacovigilance",
        "status": "none"
      }
    ]
  },
  {
    "slug": "chad",
    "name": "Chad",
    "region": "Africa",
    "regionSlug": "africa",
    "href": "/markets/africa/chad",
    "utcOffset": 1.0,
    "x": 639.1,
    "y": 231.5,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "none"
      },
      {
        "name": "Pharmacovigilance",
        "status": "none"
      }
    ]
  },
  {
    "slug": "cote-divoire",
    "name": "Côte d’Ivoire",
    "region": "Africa",
    "regionSlug": "africa",
    "href": "/markets/africa/cote-divoire",
    "utcOffset": 0.0,
    "x": 561.5,
    "y": 260.0,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "none"
      },
      {
        "name": "Pharmacovigilance",
        "status": "none"
      }
    ]
  },
  {
    "slug": "dr-congo",
    "name": "DR Congo",
    "region": "Africa",
    "regionSlug": "africa",
    "href": "/markets/africa/dr-congo",
    "utcOffset": 1.0,
    "x": 652.9,
    "y": 303.0,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "none"
      },
      {
        "name": "Pharmacovigilance",
        "status": "none"
      }
    ]
  },
  {
    "slug": "ethiopia",
    "name": "Ethiopia",
    "region": "Africa",
    "regionSlug": "africa",
    "href": "/markets/africa/ethiopia",
    "utcOffset": 3.0,
    "x": 705.7,
    "y": 253.3,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "upcoming"
      },
      {
        "name": "Pharmacovigilance",
        "status": "upcoming"
      }
    ]
  },
  {
    "slug": "ghana",
    "name": "Ghana",
    "region": "Africa",
    "regionSlug": "africa",
    "href": "/markets/africa/ghana",
    "utcOffset": 0.0,
    "x": 576.5,
    "y": 259.0,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "none"
      },
      {
        "name": "Pharmacovigilance",
        "status": "upcoming"
      }
    ]
  },
  {
    "slug": "kenya",
    "name": "Kenya",
    "region": "Africa",
    "regionSlug": "africa",
    "href": "/markets/africa/kenya",
    "utcOffset": 3.0,
    "x": 702.3,
    "y": 286.7,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "available"
      },
      {
        "name": "Pharmacovigilance",
        "status": "available"
      }
    ]
  },
  {
    "slug": "madagascar",
    "name": "Madagascar",
    "region": "Africa",
    "regionSlug": "africa",
    "href": "/markets/africa/madagascar",
    "utcOffset": 3.0,
    "x": 729.8,
    "y": 356.7,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "none"
      },
      {
        "name": "Pharmacovigilance",
        "status": "none"
      }
    ]
  },
  {
    "slug": "nigeria",
    "name": "Nigeria",
    "region": "Africa",
    "regionSlug": "africa",
    "href": "/markets/africa/nigeria",
    "utcOffset": 1.0,
    "x": 605.4,
    "y": 254.9,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "available"
      },
      {
        "name": "Pharmacovigilance",
        "status": "available"
      }
    ]
  },
  {
    "slug": "senegal",
    "name": "Senegal",
    "region": "Africa",
    "regionSlug": "africa",
    "href": "/markets/africa/senegal",
    "utcOffset": 0.0,
    "x": 532.4,
    "y": 234.4,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "none"
      },
      {
        "name": "Pharmacovigilance",
        "status": "none"
      }
    ]
  },
  {
    "slug": "south-africa",
    "name": "South Africa",
    "region": "Africa",
    "regionSlug": "africa",
    "href": "/markets/africa/south-africa",
    "utcOffset": 2.0,
    "x": 662.2,
    "y": 392.7,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "available"
      },
      {
        "name": "Pharmacovigilance",
        "status": "available"
      }
    ]
  },
  {
    "slug": "tanzania",
    "name": "Tanzania",
    "region": "Africa",
    "regionSlug": "africa",
    "href": "/markets/africa/tanzania",
    "utcOffset": 3.0,
    "x": 691.1,
    "y": 310.8,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "available"
      },
      {
        "name": "Pharmacovigilance",
        "status": "upcoming"
      }
    ]
  },
  {
    "slug": "togo",
    "name": "Togo",
    "region": "Africa",
    "regionSlug": "africa",
    "href": "/markets/africa/togo",
    "utcOffset": 0.0,
    "x": 583.6,
    "y": 256.5,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "none"
      },
      {
        "name": "Pharmacovigilance",
        "status": "none"
      }
    ]
  },
  {
    "slug": "uganda",
    "name": "Uganda",
    "region": "Africa",
    "regionSlug": "africa",
    "href": "/markets/africa/uganda",
    "utcOffset": 3.0,
    "x": 686.1,
    "y": 282.8,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "upcoming"
      },
      {
        "name": "Pharmacovigilance",
        "status": "upcoming"
      }
    ]
  },
  {
    "slug": "zimbabwe",
    "name": "Zimbabwe",
    "region": "Africa",
    "regionSlug": "africa",
    "href": "/markets/africa/zimbabwe",
    "utcOffset": 2.0,
    "x": 674.0,
    "y": 358.0,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "upcoming"
      },
      {
        "name": "Pharmacovigilance",
        "status": "upcoming"
      }
    ]
  },
  {
    "slug": "brunei",
    "name": "Brunei",
    "region": "Asia Pacific",
    "regionSlug": "asia-pacific",
    "href": "/markets/asia-pacific/brunei",
    "utcOffset": 8.0,
    "x": 954.0,
    "y": 270.5,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "none"
      },
      {
        "name": "Pharmacovigilance",
        "status": "none"
      }
    ]
  },
  {
    "slug": "cambodia",
    "name": "Cambodia",
    "region": "Asia Pacific",
    "regionSlug": "asia-pacific",
    "href": "/markets/asia-pacific/cambodia",
    "utcOffset": 7.0,
    "x": 919.7,
    "y": 240.4,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "upcoming"
      },
      {
        "name": "Pharmacovigilance",
        "status": "available"
      }
    ]
  },
  {
    "slug": "hong-kong",
    "name": "Hong Kong",
    "region": "Asia Pacific",
    "regionSlug": "asia-pacific",
    "href": "/markets/asia-pacific/hong-kong",
    "utcOffset": 8.0,
    "x": 944.1,
    "y": 205.5,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "available"
      },
      {
        "name": "Pharmacovigilance",
        "status": "available"
      }
    ]
  },
  {
    "slug": "india",
    "name": "India",
    "region": "Asia Pacific",
    "regionSlug": "asia-pacific",
    "href": "/markets/asia-pacific/india",
    "utcOffset": 5.5,
    "x": 832.7,
    "y": 207.1,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "available"
      },
      {
        "name": "Pharmacovigilance",
        "status": "available"
      }
    ]
  },
  {
    "slug": "indonesia",
    "name": "Indonesia",
    "region": "Asia Pacific",
    "regionSlug": "asia-pacific",
    "href": "/markets/asia-pacific/indonesia",
    "utcOffset": 7.0,
    "x": 949.2,
    "y": 288.5,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "none"
      },
      {
        "name": "Pharmacovigilance",
        "status": "available"
      }
    ]
  },
  {
    "slug": "laos",
    "name": "Laos",
    "region": "Asia Pacific",
    "regionSlug": "asia-pacific",
    "href": "/markets/asia-pacific/laos",
    "utcOffset": 7.0,
    "x": 907.8,
    "y": 220.8,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "none"
      },
      {
        "name": "Pharmacovigilance",
        "status": "none"
      }
    ]
  },
  {
    "slug": "malaysia",
    "name": "Malaysia",
    "region": "Asia Pacific",
    "regionSlug": "asia-pacific",
    "href": "/markets/asia-pacific/malaysia",
    "utcOffset": 8.0,
    "x": 912.4,
    "y": 273.7,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "available"
      },
      {
        "name": "Pharmacovigilance",
        "status": "available"
      }
    ]
  },
  {
    "slug": "myanmar",
    "name": "Myanmar",
    "region": "Asia Pacific",
    "regionSlug": "asia-pacific",
    "href": "/markets/asia-pacific/myanmar",
    "utcOffset": 6.5,
    "x": 887.5,
    "y": 217.8,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "available"
      },
      {
        "name": "Pharmacovigilance",
        "status": "available"
      }
    ]
  },
  {
    "slug": "pakistan",
    "name": "Pakistan",
    "region": "Asia Pacific",
    "regionSlug": "asia-pacific",
    "href": "/markets/asia-pacific/pakistan",
    "utcOffset": 5.0,
    "x": 799.1,
    "y": 175.8,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "upcoming"
      },
      {
        "name": "Pharmacovigilance",
        "status": "upcoming"
      }
    ]
  },
  {
    "slug": "philippines",
    "name": "Philippines",
    "region": "Asia Pacific",
    "regionSlug": "asia-pacific",
    "href": "/markets/asia-pacific/philippines",
    "utcOffset": 8.0,
    "x": 987.0,
    "y": 259.8,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "available"
      },
      {
        "name": "Pharmacovigilance",
        "status": "available"
      }
    ]
  },
  {
    "slug": "singapore",
    "name": "Singapore",
    "region": "Asia Pacific",
    "regionSlug": "asia-pacific",
    "href": "/markets/asia-pacific/singapore",
    "utcOffset": 8.0,
    "x": 918.4,
    "y": 282.9,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "available"
      },
      {
        "name": "Pharmacovigilance",
        "status": "available"
      }
    ]
  },
  {
    "slug": "sri-lanka",
    "name": "Sri Lanka",
    "region": "Asia Pacific",
    "regionSlug": "asia-pacific",
    "href": "/markets/asia-pacific/sri-lanka",
    "utcOffset": 5.5,
    "x": 842.2,
    "y": 258.8,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "available"
      },
      {
        "name": "Pharmacovigilance",
        "status": "available"
      }
    ]
  },
  {
    "slug": "taiwan",
    "name": "Taiwan",
    "region": "Asia Pacific",
    "regionSlug": "asia-pacific",
    "href": "/markets/asia-pacific/taiwan",
    "utcOffset": 8.0,
    "x": 964.6,
    "y": 199.4,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "available"
      },
      {
        "name": "Pharmacovigilance",
        "status": "available"
      }
    ]
  },
  {
    "slug": "thailand",
    "name": "Thailand",
    "region": "Asia Pacific",
    "regionSlug": "asia-pacific",
    "href": "/markets/asia-pacific/thailand",
    "utcOffset": 7.0,
    "x": 908.9,
    "y": 239.7,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "available"
      },
      {
        "name": "Pharmacovigilance",
        "status": "available"
      }
    ]
  },
  {
    "slug": "vietnam",
    "name": "Vietnam",
    "region": "Asia Pacific",
    "regionSlug": "asia-pacific",
    "href": "/markets/asia-pacific/vietnam",
    "utcOffset": 7.0,
    "x": 927.3,
    "y": 228.8,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "available"
      },
      {
        "name": "Pharmacovigilance",
        "status": "available"
      }
    ]
  },
  {
    "slug": "azerbaijan",
    "name": "Azerbaijan",
    "region": "CIS",
    "regionSlug": "cis",
    "href": "/markets/cis/azerbaijan",
    "utcOffset": 4.0,
    "x": 723.1,
    "y": 140.2,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "none"
      },
      {
        "name": "Pharmacovigilance",
        "status": "none"
      }
    ]
  },
  {
    "slug": "kazakhstan",
    "name": "Kazakhstan",
    "region": "CIS",
    "regionSlug": "cis",
    "href": "/markets/cis/kazakhstan",
    "utcOffset": 5.0,
    "x": 770.1,
    "y": 111.0,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "upcoming"
      },
      {
        "name": "MAH & Local Representation",
        "status": "upcoming"
      },
      {
        "name": "Pharmacovigilance",
        "status": "upcoming"
      }
    ]
  },
  {
    "slug": "kyrgyzstan",
    "name": "Kyrgyzstan",
    "region": "CIS",
    "regionSlug": "cis",
    "href": "/markets/cis/kyrgyzstan",
    "utcOffset": 6.0,
    "x": 804.4,
    "y": 135.6,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "upcoming"
      },
      {
        "name": "Pharmacovigilance",
        "status": "upcoming"
      }
    ]
  },
  {
    "slug": "uzbekistan",
    "name": "Uzbekistan",
    "region": "CIS",
    "regionSlug": "cis",
    "href": "/markets/cis/uzbekistan",
    "utcOffset": 5.0,
    "x": 769.2,
    "y": 135.4,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "available"
      },
      {
        "name": "Pharmacovigilance",
        "status": "available"
      }
    ]
  },
  {
    "slug": "russia",
    "name": "Russia",
    "region": "Eastern Europe",
    "regionSlug": "eastern-europe",
    "href": "/markets/eastern-europe/russia",
    "utcOffset": 3.0,
    "x": 811.9,
    "y": 71.3,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "upcoming"
      },
      {
        "name": "MAH & Local Representation",
        "status": "upcoming"
      },
      {
        "name": "Pharmacovigilance",
        "status": "upcoming"
      }
    ]
  },
  {
    "slug": "ukraine",
    "name": "Ukraine",
    "region": "Eastern Europe",
    "regionSlug": "eastern-europe",
    "href": "/markets/eastern-europe/ukraine",
    "utcOffset": 2.0,
    "x": 677.0,
    "y": 110.2,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "upcoming"
      },
      {
        "name": "MAH & Local Representation",
        "status": "upcoming"
      },
      {
        "name": "Pharmacovigilance",
        "status": "upcoming"
      }
    ]
  },
  {
    "slug": "chile",
    "name": "Chile",
    "region": "Latin America",
    "regionSlug": "latin-america",
    "href": "/markets/latin-america/chile",
    "utcOffset": -3.0,
    "x": 388.4,
    "y": 485.9,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "upcoming"
      },
      {
        "name": "MAH & Local Representation",
        "status": "none"
      },
      {
        "name": "Pharmacovigilance",
        "status": "upcoming"
      }
    ]
  },
  {
    "slug": "el-salvador",
    "name": "El Salvador",
    "region": "Latin America",
    "regionSlug": "latin-america",
    "href": "/markets/latin-america/el-salvador",
    "utcOffset": -6.0,
    "x": 292.6,
    "y": 236.9,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "none"
      },
      {
        "name": "Pharmacovigilance",
        "status": "upcoming"
      }
    ]
  },
  {
    "slug": "guatemala",
    "name": "Guatemala",
    "region": "Latin America",
    "regionSlug": "latin-america",
    "href": "/markets/latin-america/guatemala",
    "utcOffset": -6.0,
    "x": 288.8,
    "y": 229.6,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "none"
      },
      {
        "name": "Pharmacovigilance",
        "status": "upcoming"
      }
    ]
  },
  {
    "slug": "honduras",
    "name": "Honduras",
    "region": "Latin America",
    "regionSlug": "latin-america",
    "href": "/markets/latin-america/honduras",
    "utcOffset": -6.0,
    "x": 298.3,
    "y": 234.4,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "none"
      },
      {
        "name": "Pharmacovigilance",
        "status": "upcoming"
      }
    ]
  },
  {
    "slug": "nicaragua",
    "name": "Nicaragua",
    "region": "Latin America",
    "regionSlug": "latin-america",
    "href": "/markets/latin-america/nicaragua",
    "utcOffset": -6.0,
    "x": 303.1,
    "y": 240.3,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "none"
      },
      {
        "name": "Pharmacovigilance",
        "status": "upcoming"
      }
    ]
  },
  {
    "slug": "peru",
    "name": "Peru",
    "region": "Latin America",
    "regionSlug": "latin-america",
    "href": "/markets/latin-america/peru",
    "utcOffset": -5.0,
    "x": 333.7,
    "y": 322.0,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "upcoming"
      },
      {
        "name": "Pharmacovigilance",
        "status": "upcoming"
      }
    ]
  },
  {
    "slug": "saudi-arabia",
    "name": "Saudi Arabia",
    "region": "Middle East",
    "regionSlug": "middle-east",
    "href": "/markets/middle-east/saudi-arabia",
    "utcOffset": 3.0,
    "x": 721.5,
    "y": 198.3,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "available"
      },
      {
        "name": "MAH & Local Representation",
        "status": "available"
      },
      {
        "name": "Pharmacovigilance",
        "status": "available"
      }
    ]
  },
  {
    "slug": "united-arab-emirates",
    "name": "UAE",
    "region": "Middle East",
    "regionSlug": "middle-east",
    "href": "/markets/middle-east/united-arab-emirates",
    "utcOffset": 4.0,
    "x": 754.7,
    "y": 198.3,
    "capabilities": [
      {
        "name": "Regulatory Affairs",
        "status": "upcoming"
      },
      {
        "name": "MAH & Local Representation",
        "status": "upcoming"
      },
      {
        "name": "Pharmacovigilance",
        "status": "upcoming"
      }
    ]
  }
] as const;

export const MARKET_COUNT = MARKETS.length;

/** Regions in the order the design shows them, with their markets. */
export const REGIONS = [
  { slug: "asia-pacific", name: "Asia Pacific" },
  { slug: "africa", name: "Africa" },
  { slug: "latin-america", name: "Latin America" },
  { slug: "cis", name: "CIS" },
  { slug: "middle-east", name: "Middle East" },
  { slug: "eastern-europe", name: "Eastern Europe" },
] as const;

export type RegionSlug = (typeof REGIONS)[number]["slug"];

export function marketsInRegion(regionSlug: string): Market[] {
  return MARKETS.filter((m) => m.regionSlug === regionSlug);
}

export function findMarket(regionSlug: string, slug: string): Market | undefined {
  return MARKETS.find((m) => m.regionSlug === regionSlug && m.slug === slug);
}

export function findRegion(slug: string) {
  return REGIONS.find((r) => r.slug === slug);
}
