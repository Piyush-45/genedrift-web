import type { ExploreJourneysProps } from "./schema";

export const exploreJourneysFixture: ExploreJourneysProps = {
  type: "explore-journeys",
  eyebrow: "Explore",
  heading: "Start with the problem, not our service names.",
  standfirst:
    "Most people arrive knowing the outcome they need, not what the industry calls it.",
  linkLabel: "Explore",
  items: [
    {
      title: "Enter a new market",
      body: "Pathway, classification and the filing route for a country you have never registered in.",
      href: "/explore/business-needs",
      resting: false,
    },
    {
      title: "Build or maintain PV compliance",
      body: "A local QPPV, case intake and the aggregate reports the authority expects.",
      href: "/expertise/pharmacovigilance",
      resting: false,
    },
    {
      title: "Establish local representation or MAH",
      body: "A licence holder where you have no legal entity, with obligations managed for you.",
      href: "/expertise/mah-local-representation",
      resting: false,
    },
    {
      title: "Not sure where to start",
      body: "Tell us the product and the destination. We will map the pathway and come back.",
      href: "/explore/questionnaire",
      resting: false,
    },
  ],
  certificationsLabel: "Certified & compliant",
  showCertifications: true,
};
