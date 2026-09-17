import type { IndustryIcon } from "./schema";

/**
 * The five industry glyphs, taken verbatim from the approved design. A fixed
 * set, not an upload field: letting a CMS accept arbitrary SVG is how a
 * content system becomes a script-injection surface.
 */
const PATHS: Record<IndustryIcon, React.ReactNode> = {
  pharmaceuticals: (
    <>
      <path d="M4.6 12.8 12.8 4.6a4.4 4.4 0 0 1 6.6 6.6l-8.2 8.2a4.4 4.4 0 0 1-6.6-6.6z" />
      <path d="m8.7 8.7 6.6 6.6" />
    </>
  ),
  devices: (
    <>
      <rect x="3.5" y="4.5" width="17" height="12" rx="2" />
      <path d="M3.5 11h4l2-3 2.6 6 2-3h4.4M8 20h8" />
    </>
  ),
  supplements: (
    <>
      <path d="M12 3c4.2 2 6.5 5 6.5 8.6A6.5 6.5 0 0 1 12 18a6.5 6.5 0 0 1-6.5-6.4C5.5 8 7.8 5 12 3z" />
      <path d="M12 18v3" />
    </>
  ),
  cosmetics: (
    <>
      <path d="M9 3h6v4H9z" />
      <path d="M8 7h8v3.5a3 3 0 0 1-.7 1.9L14 14v7H10v-7l-1.3-1.6A3 3 0 0 1 8 10.5z" />
    </>
  ),
  veterinary: (
    <>
      <ellipse cx="12" cy="15.5" rx="4" ry="3.2" />
      <ellipse cx="6.8" cy="10.6" rx="1.9" ry="2.3" />
      <ellipse cx="17.2" cy="10.6" rx="1.9" ry="2.3" />
      <ellipse cx="9.9" cy="6.9" rx="1.8" ry="2.2" />
      <ellipse cx="14.1" cy="6.9" rx="1.8" ry="2.2" />
    </>
  ),
};

export function IndustryGlyph({ name }: { name: IndustryIcon }) {
  return (
    <svg
      aria-hidden
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[name]}
    </svg>
  );
}
