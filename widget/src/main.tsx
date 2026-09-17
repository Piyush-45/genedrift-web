import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

/**
 * The Creator widget SDK, loaded exactly as the editorial widget loads it.
 *
 * Two details that cost a deploy cycle to get wrong, both worth stating:
 *
 * 1. **The host is `static.zohocdn.com`, not `js.zohostatic.com`.** The other
 *    host serves something that answers to `window.ZOHO.CREATOR` but has a
 *    different shape — which surfaced as "init is not a function" rather than
 *    as a load failure, so it looked like an API problem instead of a wrong
 *    URL.
 * 2. **Creator does not inject it.** The widget has to load it itself.
 *
 * Loaded here rather than with a <script> tag in index.html so a failure is
 * catchable and can be shown to the person as a sentence.
 */
const CREATOR_SDK_URL = "https://static.zohocdn.com/creator/widgets/version/2.0/widgetsdk-min.js";

function loadCreatorSdk(): Promise<void> {
  if (window.ZOHO?.CREATOR) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CREATOR_SDK_URL;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("The Zoho Creator widget SDK could not be loaded. Check the network tab for a blocked request."));
    document.head.append(script);
  });
}

async function bootstrap() {
  const root = document.getElementById("root")!;
  try {
    // Skipped in dev so the mocked SDK in preview/ is left alone.
    if (import.meta.env.PROD) await loadCreatorSdk();
    const { default: App } = await import("./App");
    createRoot(root).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } catch (error) {
    root.textContent = error instanceof Error ? error.message : "The workspace could not start.";
    root.className = "boot bad";
  }
}

void bootstrap();
