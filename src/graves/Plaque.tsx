import type { Status } from "@/domain/types";

const SHAPES = [
  "M10 150 V50 Q10 8 60 8 Q110 8 110 50 V150 Z",
  "M12 150 V42 Q12 32 22 32 H40 Q42 8 60 8 Q78 8 80 32 H98 Q108 32 108 42 V150 Z",
  "M14 150 V58 Q14 28 60 6 Q106 28 106 58 V150 Z",
] as const;

/** Per-status wear drawn on top of the stone. */
function Wear({ status }: { status: Status }) {
  switch (status) {
    case "alive":
      return (
        <g>
          <path d="M18 150 q3 -12 8 -14 M24 150 q1 -9 -3 -13" stroke="#7d9a3c" strokeWidth={2} strokeLinecap="round" fill="none" />
          <circle cx={26} cy={136} r={3.2} fill="#e8a0b4" />
          <circle cx={21} cy={137} r={2.6} fill="#f2b950" />
          <path d="M98 150 q-2 -10 -7 -12" stroke="#7d9a3c" strokeWidth={2} strokeLinecap="round" fill="none" />
          <circle cx={91} cy={138} r={2.8} fill="#c9b6ec" />
        </g>
      );
    case "zombie":
      return (
        <g>
          <path d="M107 54 L100 64 L104 72 L98 86" fill="none" stroke="#1a1424" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 150 V118 Q22 112 30 120 Q36 128 46 126 Q52 134 50 150 Z" fill="#5c6b34" opacity={0.85} />
          <path d="M100 150 V128 Q94 126 90 134 Q86 142 80 144 V150 Z" fill="#6f7f40" opacity={0.75} />
        </g>
      );
    case "ghost":
      return <path d="M24 40 Q30 18 52 14" fill="none" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={3} strokeLinecap="round" />;
    case "buried":
      return (
        <g>
          <path d="M96 30 L108 30 M96 30 L106 18 M96 30 L100 16 M99 24 L104 25 M101 20 L104 22" stroke="#cfc6b0" strokeOpacity={0.35} strokeWidth={0.8} fill="none" />
          <path d="M16 150 C10 128 24 118 18 98 C14 84 28 74 22 58" fill="none" stroke="#5a4a30" strokeWidth={2.4} strokeLinecap="round" />
          <path d="M18 112 q-8 -4 -10 2 q6 3 10 -2 z M22 80 q8 -5 11 1 q-6 4 -11 -1 z" fill="#6b5a3a" />
        </g>
      );
    case "lost":
      return null;
  }
}

/** The stone slab behind a grave's engraving. */
export function Plaque({ status, variant }: { status: Status; variant: 0 | 1 | 2 }) {
  const d = SHAPES[variant];
  return (
    <svg className="plaque" viewBox="0 0 120 150" preserveAspectRatio="none" aria-hidden="true">
      <path d={d} className={`plaque__stone plaque__stone--${status}`} />
      <path d={d} className="plaque__shade" transform="translate(6 0) scale(.95 1)" />
      <Wear status={status} />
      <path d={d} className={`plaque__edge plaque__edge--${status}`} />
    </svg>
  );
}
