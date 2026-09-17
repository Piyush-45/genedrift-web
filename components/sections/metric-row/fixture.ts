import type { MetricRowProps } from "./schema";

/**
 * ⚠️ These figures come from the client's own material and are UNVERIFIED.
 * "46" contradicts the "30+" in their metrics row — see
 * context/blocked-on-client.md. Do not add figures that were not supplied.
 */
export const metricRowFixture: MetricRowProps = {
  type: "metric-row",
  eyebrow: "By the numbers",
  heading: "What the last few years look like.",
  items: [
    { value: "46", label: "Markets", note: "Across six regions" },
    { value: "170+", label: "Products", note: "Lifecycle managed for one client" },
    { value: "50+", label: "Intelligence reports", note: "Delivered to multinationals" },
    { value: "10+", label: "Saudi roadmaps", note: "For Gulf market entry" },
  ],
};
