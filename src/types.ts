export interface Affiliation {
  id: string;
  location_name: string;
  country: string;
  lab: string;
  project: string;
  discipline: string;
  color: string;
  lat: number;
  lng: number;
  is_active: boolean;
  work_done: boolean;
  created_at: string;
}

export type AffiliationInput = Omit<Affiliation, 'id' | 'created_at'>;

export const DISCIPLINE_PRESETS: { label: string; value: string; color: string }[] = [
  { label: 'Botany', value: 'botany', color: '#3b82f6' },
  { label: 'Astronomy', value: 'astronomy', color: '#ef4444' },
  { label: 'Glacial / Arctic Science', value: 'glacial', color: '#a855f7' },
  { label: 'Research Station', value: 'station', color: '#eab308' },
];
