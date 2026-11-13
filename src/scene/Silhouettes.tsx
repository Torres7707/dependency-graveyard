const TREE_TRUNK = "M0 0 C-2 -40 6 -70 -4 -100";
const TREE_BRANCHES =
  "M-2 -60 C-20 -72 -30 -86 -42 -90 M1 -75 C18 -88 30 -104 48 -108 M-4 -100 C-12 -114 -8 -130 -20 -142 M-3 -95 C10 -110 8 -124 20 -136 M-30 -84 C-36 -92 -34 -100 -44 -106 M30 -100 C34 -112 44 -116 50 -126";

function Tree({ x, y, scale = 1, flip = false }: { x: number; y: number; scale?: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
      <path d={TREE_TRUNK} stroke="#120c1c" strokeWidth={10} strokeLinecap="round" fill="none" />
      <path d={TREE_BRANCHES} stroke="#120c1c" strokeWidth={4} strokeLinecap="round" fill="none" />
    </g>
  );
}

const GRAVES = [
  { x: 300, y: 292, d: "M0 0 V-22 Q0 -34 11 -34 Q22 -34 22 -22 V0 Z" },
  { x: 920, y: 288, d: "M0 0 V-18 H-6 V-26 H0 V-34 H8 V-26 H14 V-18 H8 V0 Z" },
  { x: 1180, y: 296, d: "M0 0 V-24 Q0 -32 9 -32 Q18 -32 18 -24 V0 Z" },
  { x: 640, y: 292, d: "M0 0 V-26 Q0 -36 12 -36 Q24 -36 24 -26 V0 Z" },
];

/** Distant church, hills, bare trees and a wrought-iron fence. */
export function Silhouettes() {
  return (
    <svg className="scene__far" viewBox="0 0 1440 360" preserveAspectRatio="xMidYMax slice">
      <defs>
        <pattern id="fence-pickets" width="18" height="52" patternUnits="userSpaceOnUse">
          <path d="M7.5 12 L9 3 L10.5 12 V52 H7.5 Z" fill="#150e20" />
        </pattern>
      </defs>
      <path d="M0 250 Q180 196 360 226 T720 214 T1080 204 T1440 226 V360 H0 Z" fill="#1e1530" />

      <g className="scene__church" fill="#191127">
        <polygon points="992,206 1074,168 1156,206" />
        <rect x={1000} y={204} width={150} height={90} />
        <rect x={1058} y={124} width={42} height={90} />
        <polygon points="1058,126 1079,56 1100,126" />
        <path d="M1079 34 V58 M1071 43 H1087" stroke="#191127" strokeWidth={4} strokeLinecap="round" />
        <rect x={1071} y={146} width={16} height={26} rx={8} fill="#f2b950" opacity={0.42} />
        <path d="M1018 250 v-18 a7 7 0 0 1 14 0 v18 z M1118 250 v-18 a7 7 0 0 1 14 0 v18 z" fill="#f2b950" opacity={0.22} />
      </g>

      <rect x={380} y={246} width={480} height={52} fill="url(#fence-pickets)" />
      <path d="M380 262 H860 M380 286 H860" stroke="#150e20" strokeWidth={3} />

      <path d="M0 300 Q240 258 480 284 T960 280 T1440 288 V360 H0 Z" fill="#120c1c" />
      {GRAVES.map((g) => (
        <path key={g.x} d={g.d} transform={`translate(${g.x} ${g.y})`} fill="#120c1c" />
      ))}
      <Tree x={180} y={300} scale={1.15} />
      <Tree x={1320} y={296} scale={1.3} flip />
      <Tree x={760} y={286} scale={0.7} />
    </svg>
  );
}
