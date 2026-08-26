import { countryCoords, projectLatLng } from "@/lib/geo/country-coords";
import { WORLD_OUTLINE_PATH, COUNTRY_PATHS } from "@/lib/geo/world-map-data";

/** Same self-rolled overlay technique as HeatmapOverlay.tsx: a base layer plus
 *  absolutely-positioned, blurred/glowing dots placed by percentage — no charting
 *  library. The base map itself is real geography (Natural Earth 110m via d3-geo,
 *  simplified + baked into world-map-data.ts at build time), not hand-drawn shapes. */
export default function WorldMapDots({ points }: { points: Array<{ code: string; count: number }> }) {
  const maxCount = Math.max(1, ...points.map((p) => p.count));

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-navy-50" style={{ aspectRatio: "2 / 1" }}>
      <svg viewBox="0 0 1000 500" className="absolute inset-0 h-full w-full" role="img" aria-label="World map">
        <path d={WORLD_OUTLINE_PATH} className="fill-navy-200" />
        {points.map((p) => {
          const countryPath = COUNTRY_PATHS[p.code];
          return countryPath ? <path key={p.code} d={countryPath} className="fill-navy-700" /> : null;
        })}
      </svg>

      <div className="pointer-events-none absolute inset-0">
        {points.map((p) => {
          const coords = countryCoords(p.code);
          if (!coords) return null;
          const { xPct, yPct } = projectLatLng(coords.lat, coords.lng);
          const size = 16 + (Math.log(p.count + 1) / Math.log(maxCount + 1)) * 40;
          return (
            <span
              key={p.code}
              title={`${coords.name}: ${p.count} visitor${p.count === 1 ? "" : "s"}`}
              className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                left: `${xPct}%`,
                top: `${yPct}%`,
                width: size,
                height: size,
                background: "radial-gradient(circle, rgba(209,154,71,0.75) 0%, rgba(209,154,71,0) 70%)",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
