// Geocoding via OpenStreetMap Nominatim — free, no API key required.
// Usage policy: send a descriptive User-Agent, max 1 request per second.

interface GeoResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    country?: string;
    state?: string;
    city?: string;
    town?: string;
    village?: string;
  };
}

export interface ResolvedLocation {
  lat: number;
  lng: number;
  country: string;
}

export async function geocodeLocation(
  query: string,
  signal?: AbortSignal,
): Promise<ResolvedLocation | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
    query,
  )}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!res.ok) return null;
  const data = (await res.json()) as GeoResult[];
  if (!data || data.length === 0) return null;
  const hit = data[0];
  return {
    lat: parseFloat(hit.lat),
    lng: parseFloat(hit.lon),
    country: hit.address?.country ?? '',
  };
}
