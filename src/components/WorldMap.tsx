import { useMemo, useState, useRef } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { geoPath, geoAlbersUsa } from 'd3-geo';
import type { Affiliation } from '@/types';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

interface WorldMapProps {
  affiliations: Affiliation[];
}

interface HoverInfo {
  affiliation: Affiliation;
  x: number;
  y: number;
}

export default function WorldMap({ affiliations }: WorldMapProps) {
  const [hover, setHover] = useState<HoverInfo | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Countries that have/had a project — for subtle highlight
  const projectCountries = useMemo(() => {
    const map = new Map<string, boolean>();
    affiliations.forEach((a) => {
      const key = a.country.toLowerCase().trim();
      if (key) map.set(key, true);
    });
    // Also map common alternate names to ISO numeric ids is complex; we rely on
    // a name match against geo properties.name. Build a set of names.
    const names = new Set<string>();
    affiliations.forEach((a) => {
      if (a.country) names.add(a.country.trim());
    });
    return names;
  }, [affiliations]);

  const handleMouseEnter = (a: Affiliation, e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHover({
      affiliation: a,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!hover) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHover({ ...hover, x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  // Compute tooltip position with viewport/boundary detection
  const tooltipPos = useMemo(() => {
    if (!hover) return { left: 0, top: 0 };
    const TOOLTIP_W = 280;
    const TOOLTIP_H = 150;
    const PAD = 12;
    let left = hover.x + 16;
    let top = hover.y + 16;
    const containerW = containerRef.current?.clientWidth ?? window.innerWidth;
    const containerH = containerRef.current?.clientHeight ?? window.innerHeight;

    if (left + TOOLTIP_W + PAD > containerW) {
      left = hover.x - TOOLTIP_W - 16;
    }
    if (left < PAD) {
      left = PAD;
    }
    if (top + TOOLTIP_H + PAD > containerH) {
      top = hover.y - TOOLTIP_H - 16;
    }
    if (top < PAD) {
      top = PAD;
    }
    return { left, top };
  }, [hover]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHover(null)}
    >
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{
          scale: 165,
          center: [0, 0],
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup
          zoom={1}
          center={[0, 0]}
          minZoom={1}
          maxZoom={5}
          fill="#0a0f1e"
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo) => {
                const hasProject = projectCountries.has(geo.properties.name);
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => {}}
                    onMouseLeave={() => {}}
                    style={{
                      default: {
                        fill: hasProject ? '#1e2a45' : '#111827',
                        stroke: '#3b4252',
                        strokeWidth: 0.3,
                        outline: 'none',
                        transition: 'fill 200ms',
                      },
                      hover: {
                        fill: hasProject ? '#283655' : '#1a2333',
                        stroke: '#4b5563',
                        strokeWidth: 0.4,
                        outline: 'none',
                      },
                      pressed: {
                        fill: hasProject ? '#2a3a5c' : '#161f2e',
                        outline: 'none',
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {affiliations.map((a) => {
            const dotColor = dotColorFor(a);
            return (
            <Marker key={a.id} coordinates={[a.lng, a.lat]}>
              <g
                onMouseEnter={(e) => handleMouseEnter(a, e as any)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* outer pulsing ring */}
                <circle
                  r={6}
                  fill={dotColor}
                  opacity={0.35}
                  className="dot-pulse-ring"
                  style={{ pointerEvents: 'none' }}
                />
                {/* blinking core dot */}
                <circle
                  r={3.5}
                  fill={dotColor}
                  stroke="#ffffff"
                  strokeWidth={0.6}
                  className="dot-blink"
                  style={{ pointerEvents: 'all' }}
                />
                {/* invisible larger hit area */}
                <circle
                  r={14}
                  fill="transparent"
                  style={{ pointerEvents: 'all' }}
                />
              </g>
            </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>

      {hover && (
        <div
          className="absolute z-50 pointer-events-none rounded-lg border border-white/15 bg-[#0b1220]/95 backdrop-blur-md px-4 py-3 shadow-2xl"
          style={{ left: tooltipPos.left, top: tooltipPos.top, width: 280 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: dotColorFor(hover.affiliation) }}
            />
            <span className="text-white font-semibold text-sm tracking-wide">
              {hover.affiliation.location_name}
            </span>
            <span
              className={`ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full ${statusBadgeClass(hover.affiliation)}`}
            >
              {statusLabel(hover.affiliation)}
            </span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex gap-2">
              <span className="text-slate-500 w-16 shrink-0">Lab / Uni</span>
              <span className="text-slate-100">{hover.affiliation.lab}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-slate-500 w-16 shrink-0">Project</span>
              <span className="text-slate-100">{hover.affiliation.project}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-slate-500 w-16 shrink-0">Field</span>
              <span className="text-slate-100 capitalize">
                {hover.affiliation.discipline}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-slate-500 w-16 shrink-0">Local time</span>
              <span className="text-slate-100">{localTimeFor(hover.affiliation.lng)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Approximate local time from longitude — good enough for a quick glance.
function localTimeFor(lng: number): string {
  const offsetHours = Math.round(lng / 15);
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const local = new Date(utc + offsetHours * 3600000);
  return local.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// silence unused import warning for geoAlbersUsa (kept for potential use)
void geoPath;
void geoAlbersUsa;

function dotColorFor(a: Affiliation): string {
  if (!a.is_active) return '#ffffff';
  if (a.work_done) return '#9ca3af';
  return a.color;
}

function statusLabel(a: Affiliation): string {
  if (!a.is_active) return 'Previous';
  return a.work_done ? 'Done' : 'Ongoing';
}

function statusBadgeClass(a: Affiliation): string {
  if (!a.is_active) return 'bg-slate-400/20 text-slate-300 border border-slate-400/30';
  if (a.work_done) return 'bg-slate-500/20 text-slate-300 border border-slate-500/30';
  return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
}
