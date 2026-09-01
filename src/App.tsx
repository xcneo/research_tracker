import { useEffect, useState, useCallback } from 'react';
import { Globe2, Loader2 } from 'lucide-react';
import WorldMap from '@/components/WorldMap';
import ManagePanel from '@/components/ManagePanel';
import { supabase } from '@/lib/supabase';
import type { Affiliation, AffiliationInput } from '@/types';

export default function App() {
  const [affiliations, setAffiliations] = useState<Affiliation[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('affiliations')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('load error', error);
    } else if (data) {
      setAffiliations(data as Affiliation[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async (input: AffiliationInput) => {
    const { error } = await supabase.from('affiliations').insert(input);
    if (error) throw error;
    await load();
  };

  const handleUpdate = async (id: string, input: AffiliationInput) => {
    const { error } = await supabase
      .from('affiliations')
      .update(input)
      .eq('id', id);
    if (error) throw error;
    await load();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('affiliations').delete().eq('id', id);
    if (error) throw error;
    await load();
  };

  const handleToggleActive = async (aff: Affiliation) => {
    const { error } = await supabase
      .from('affiliations')
      .update({ is_active: !aff.is_active })
      .eq('id', aff.id);
    if (error) throw error;
    await load();
  };

  const active = affiliations.filter((a) => a.is_active);
  const past = affiliations.filter((a) => !a.is_active);

  return (
    <div className="fixed inset-0 bg-[#070b14] text-white overflow-hidden">
      {/* subtle vignette / radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(20,30,55,0.6) 0%, rgba(7,11,20,0.95) 70%)',
        }}
      />

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Globe2 className="w-5 h-5 text-sky-400" />
          <h1 className="text-base font-semibold tracking-wide text-slate-100">
            Research Affiliations Worldwide
          </h1>
        </div>
        <Legend />
      </header>

      {/* Map */}
      <div className="absolute inset-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 text-sky-400 animate-spin" />
          </div>
        ) : (
          <WorldMap affiliations={affiliations} />
        )}
      </div>

      {/* Manage panel */}
      <ManagePanel
        active={active}
        past={past}
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />
    </div>
  );
}

function Legend() {
  const items = [
    { label: 'Botany', color: '#3b82f6' },
    { label: 'Astronomy', color: '#ef4444' },
    { label: 'Glacial / Arctic', color: '#a855f7' },
    { label: 'Research Station', color: '#eab308' },
  ];
  return (
    <div className="hidden md:flex items-center gap-4">
      {items.map((i) => (
        <div key={i.label} className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{
              backgroundColor: i.color,
              boxShadow: `0 0 6px ${i.color}`,
            }}
          />
          <span className="text-[11px] text-slate-400">{i.label}</span>
        </div>
      ))}
    </div>
  );
}
