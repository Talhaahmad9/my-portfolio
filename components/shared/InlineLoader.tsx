"use client";

export default function InlineLoader({ size = 16 }: { size?: number }) {
  const s = size;
  return (
    <span className="inline-flex items-center" role="status" aria-live="polite">
      <svg
        className="animate-spin"
        width={s}
        height={s}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="text-platinum/30" />
        <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" className="text-orangeWeb" strokeLinecap="round" />
      </svg>
      <span className="sr-only">Loading</span>
    </span>
  );
}
