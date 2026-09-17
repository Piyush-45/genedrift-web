import { cn } from "@/lib/cn";

/**
 * The eyebrow + heading + right-hand standfirst used by most sections.
 * `tone` switches the palette for sections sitting on the deep band.
 */
export function SectionHead({
  eyebrow,
  heading,
  headingTail,
  standfirst,
  tone = "light",
  className,
}: {
  eyebrow: string;
  heading: string;
  headingTail?: string;
  standfirst?: string;
  tone?: "light" | "deep";
  className?: string;
}) {
  const deep = tone === "deep";
  return (
    <div
      className={cn(
        "flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16",
        className,
      )}
    >
      <div>
        <p className={cn("label", deep ? "text-on-deep-accent" : "text-accent")}>{eyebrow}</p>
        <h2 className={cn("mt-4 max-w-[42ch] text-h1 leading-[1.12]", deep && "text-on-deep")}>
          {heading}
          {headingTail ? (
            <>
              {" "}
              <span className={deep ? "text-on-deep-muted" : "text-dim"}>{headingTail}</span>
            </>
          ) : null}
        </h2>
      </div>
      {standfirst && (
        <p
          className={cn(
            "max-w-[24rem] text-lead",
            deep ? "text-on-deep-muted" : "text-muted",
          )}
        >
          {standfirst}
        </p>
      )}
    </div>
  );
}
