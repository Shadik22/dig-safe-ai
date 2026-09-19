export function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="pg-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.78 0.15 200)" />
          <stop offset="100%" stopColor="oklch(0.6 0.19 256)" />
        </linearGradient>
      </defs>
      <path
        d="M24 3 42 9v14c0 11-7.6 19.4-18 22C13.6 42.4 6 34 6 23V9L24 3Z"
        fill="url(#pg-logo)"
        opacity="0.18"
      />
      <path
        d="M24 3 42 9v14c0 11-7.6 19.4-18 22C13.6 42.4 6 34 6 23V9L24 3Z"
        stroke="url(#pg-logo)"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="M13 27c0-6 4.4-10 9.6-10 4.4 0 6.4 2.6 6.4 5.2 0 2.4-1.7 4.1-4.2 4.1-2 0-3.3-1.1-3.3-2.6"
        stroke="url(#pg-logo)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect x="29.5" y="24.5" width="6" height="7" rx="1.6" stroke="url(#pg-logo)" strokeWidth="2.4" />
    </svg>
  );
}

export function Wordmark({ size = 34 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2.5">
      <Logo size={size} />
      <span className="font-display text-lg font-semibold tracking-tight text-foreground">
        PipeGuard <span className="text-primary">AI</span>
      </span>
    </span>
  );
}
