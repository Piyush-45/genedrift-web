/**
 * Copies the generated field spec into the widget's source so it is bundled
 * into the zip.
 *
 * The widget cannot fetch it from the website at runtime — a Creator widget
 * runs on a Zoho origin and the site may not even be deployed yet. Bundling
 * means the zip must be rebuilt when a section's fields change, which is the
 * right trade: a stale bundled spec shows the wrong form, a failed fetch shows
 * nothing at all.
 */
import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const src = resolve(process.cwd(), "..", "public", "section-fields.json");
const dest = resolve(process.cwd(), "src", "section-fields.json");

if (!existsSync(src)) {
  console.error(`[sync-fields] ${src} not found. Run \`npm run build\` in the website repo first.`);
  process.exit(1);
}
copyFileSync(src, dest);
console.log("[sync-fields] section-fields.json → widget/src/");
