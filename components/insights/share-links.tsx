"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Share controls: copy link, LinkedIn (where this audience is) and email.
 * Plain links, no third-party scripts or tracking pixels: the page makes no
 * call to a social network until the reader chooses to share.
 *
 * "row" sits under the article; "rail" is the vertical set beside the text
 * on wide screens.
 */
export function ShareLinks({
  url,
  title,
  variant = "row",
}: {
  url: string;
  title: string;
  variant?: "row" | "rail";
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  };

  const linkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const mail = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;

  if (variant === "rail") {
    const btn =
      "grid size-10 place-items-center rounded-full border border-line bg-canvas text-mid transition-colors hover:border-accent hover:text-accent";
    return (
      <div className="flex flex-col items-center gap-2.5">
        <span className="label mb-1 text-faint">Share</span>
        <button type="button" onClick={copy} className={btn} aria-label={copied ? "Link copied" : "Copy link"} title={copied ? "Link copied" : "Copy link"}>
          {copied ? <CheckIcon /> : <LinkIcon />}
        </button>
        <a className={btn} href={linkedIn} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" title="Share on LinkedIn">
          <span className="text-xs font-bold">in</span>
        </a>
        <a className={btn} href={mail} aria-label="Share by email" title="Share by email">
          <MailIcon />
        </a>
      </div>
    );
  }

  const pill =
    "inline-flex items-center gap-2 rounded-pill border border-line px-4 py-2 text-sm font-semibold text-mid transition-colors hover:border-accent hover:text-accent";
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span className="label mr-2 text-faint">Share</span>
      <button type="button" onClick={copy} className={pill} aria-live="polite">
        {copied ? <CheckIcon /> : <LinkIcon />}
        {copied ? "Link copied" : "Copy link"}
      </button>
      <a className={pill} href={linkedIn} target="_blank" rel="noopener noreferrer">
        LinkedIn
      </a>
      <a className={cn(pill)} href={mail}>
        <MailIcon />
        Email
      </a>
    </div>
  );
}

function LinkIcon() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <path d="M8.5 11.5a3.5 3.5 0 0 0 5 0l2.5-2.5a3.5 3.5 0 0 0-5-5L10 5" />
      <path d="M11.5 8.5a3.5 3.5 0 0 0-5 0L4 11a3.5 3.5 0 0 0 5 5l1-1" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
      <rect x="2.5" y="4.5" width="15" height="11" rx="2" />
      <path d="m3.5 6 6.5 5 6.5-5" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m4.5 10.5 3.5 3.5 7.5-8" />
    </svg>
  );
}
