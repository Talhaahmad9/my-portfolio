interface AdminRouteSkeletonProps {
  title: string;
  description?: string;
  blocks?: number;
  hasTabs?: boolean;
}

export default function AdminRouteSkeleton({
  title,
  description,
  blocks = 3,
  hasTabs = false,
}: AdminRouteSkeletonProps) {
  return (
    <section className="space-y-6" aria-busy="true" aria-live="polite">
      <header className="space-y-3">
        <p className="h-3 w-28 animate-pulse rounded bg-orangeWeb/25" />
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
        {description ? <p className="max-w-2xl text-sm text-platinum/80 sm:text-base">{description}</p> : null}
      </header>

      {hasTabs ? (
        <div className="flex items-center gap-2 overflow-x-auto border-b border-oxfordBlue/70 pb-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <span key={index} className="h-9 w-28 animate-pulse rounded-md bg-oxfordBlue/70" />
          ))}
        </div>
      ) : null}

      <div className="space-y-4">
        {Array.from({ length: blocks }).map((_, index) => (
          <article key={index} className="rounded-xl border border-oxfordBlue/70 bg-oxfordBlue/35 p-4 sm:p-5">
            <div className="space-y-3">
              <p className="h-4 w-1/2 animate-pulse rounded bg-platinum/15" />
              <p className="h-3 w-full animate-pulse rounded bg-platinum/10" />
              <p className="h-3 w-5/6 animate-pulse rounded bg-platinum/10" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
