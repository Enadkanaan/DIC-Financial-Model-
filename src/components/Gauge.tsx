import { COLORS } from '../lib/config';
import { clamp, fmtPct } from '../lib/format';
import { useCountUp } from './CountUp';

interface GaugeProps {
  /** Percentage value; may exceed 100 (rendered as a full red arc with the true value printed). */
  value: number;
  label: string;
  caption?: string;
  /** Optional reference marker (e.g. % of contract time elapsed). */
  marker?: { value: number; label: string };
  /** Bands drawn on the outer rim: [from%, to%, colour]. */
  bands?: [number, number, string][];
  color?: string;
}

const CX = 110;
const CY = 110;
const R = 84;
const STROKE = 16;

/** Point on the semicircle for p in [0,1]: 0 = left, 1 = right. */
const pt = (p: number, r = R) => {
  const a = Math.PI * (1 - p);
  return { x: CX + r * Math.cos(a), y: CY - r * Math.sin(a) };
};

const arc = (from: number, to: number, r = R) => {
  const a = pt(clamp(from, 0, 1), r);
  const b = pt(clamp(to, 0, 1), r);
  return `M ${a.x.toFixed(3)} ${a.y.toFixed(3)} A ${r} ${r} 0 0 1 ${b.x.toFixed(3)} ${b.y.toFixed(3)}`;
};

/** Semicircular gauge; the arc and the printed % sweep up together from 0 on mount and ease to new values. */
export function Gauge({ value, label, caption, marker, bands, color = COLORS.brand }: GaugeProps) {
  const target = Number.isFinite(value) ? value : 0;
  const shown = useCountUp(target, 1300);
  const markerShown = useCountUp(marker?.value ?? 0, 1300);
  const p = clamp(shown, 0, 100) / 100;
  const over = shown > 100;
  const fill = over ? COLORS.negative : color;

  return (
    <figure className="flex flex-col items-center" aria-label={`${label}: ${fmtPct(target)}`}>
      <svg viewBox="0 0 220 132" className="w-full max-w-[240px]" role="img">
        <path d={arc(0, 1)} fill="none" stroke={COLORS.grid} strokeWidth={STROKE} />
        {bands?.map(([f, t, c]) => (
          <path key={`${f}-${t}`} d={arc(f / 100, t / 100, R + STROKE / 2 + 4)} fill="none" stroke={c} strokeWidth={3} />
        ))}
        {p > 0.0005 && <path d={arc(0, p)} fill="none" stroke={fill} strokeWidth={STROKE} />}
        {marker &&
          (() => {
            const m = clamp(markerShown, 0, 100) / 100;
            const a = pt(m, R - STROKE / 2 - 3);
            const b = pt(m, R + STROKE / 2 + 3);
            return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#000000" strokeWidth={2.5} />;
          })()}
        <text x={CX} y={CY - 14} textAnchor="middle" className="num" fontSize="28" fontWeight={600} fill={over ? COLORS.negative : '#101828'}>
          {fmtPct(shown)}
        </text>
        <text x={CX - R} y={CY + 18} textAnchor="middle" fontSize="10" fill="#98A2B3">0%</text>
        <text x={CX + R} y={CY + 18} textAnchor="middle" fontSize="10" fill="#98A2B3">100%</text>
      </svg>
      <figcaption className="-mt-1 text-center">
        <p className="text-[13px] font-semibold text-gray-900">{label}</p>
        {caption && <p className="mt-0.5 text-xs text-gray-500">{caption}</p>}
        {marker && (
          <p className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-gray-500">
            <span className="inline-block h-3 w-0.5 bg-black" /> {marker.label}: {fmtPct(marker.value)}
          </p>
        )}
      </figcaption>
    </figure>
  );
}
