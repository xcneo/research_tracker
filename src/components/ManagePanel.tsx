import { useState } from 'react';
import { MapPin, Plus, Pencil, Trash2, Check, X, Clock } from 'lucide-react';
import type { Affiliation, AffiliationInput } from '@/types';
import { DISCIPLINE_PRESETS } from '@/types';

interface ManagePanelProps {
  active: Affiliation[];
  past: Affiliation[];
  onAdd: (input: AffiliationInput) => Promise<void>;
  onUpdate: (id: string, input: AffiliationInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleActive: (aff: Affiliation) => Promise<void>;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const emptyForm: AffiliationInput = {
  location_name: '',
  country: '',
  lab: '',
  project: '',
  discipline: 'botany',
  color: '#3b82f6',
  lat: 0,
  lng: 0,
  is_active: true,
  work_done: false,
};

export default function ManagePanel({
  active,
  past,
  onAdd,
  onUpdate,
  onDelete,
  onToggleActive,
  collapsed,
  onToggleCollapse,
}: ManagePanelProps) {
  const [form, setForm] = useState<AffiliationInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<'active' | 'past'>('active');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };

  const startEdit = (a: Affiliation) => {
    setForm({
      location_name: a.location_name,
      country: a.country,
      lab: a.lab,
      project: a.project,
      discipline: a.discipline,
      color: a.color,
      lat: a.lat,
      lng: a.lng,
      is_active: a.is_active,
      work_done: a.work_done,
    });
    setEditingId(a.id);
    setShowForm(true);
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);
    if (!form.location_name.trim()) {
      setError('Location name is required.');
      return;
    }
    if (form.lat === 0 && form.lng === 0) {
      setError('Please enter latitude and longitude.');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await onUpdate(editingId, form);
      } else {
        await onAdd(form);
      }
      resetForm();
    } catch (e: any) {
      setError(e.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const list = tab === 'active' ? active : past;

  return (
    <div className="absolute bottom-4 left-4 z-40 w-[360px] max-w-[calc(100vw-2rem)]">
      <div className="rounded-xl border border-white/10 bg-[#0b1220]/95 backdrop-blur-md shadow-2xl overflow-hidden">
        {/* Header / toggle bar */}
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-sky-400" />
            <span className="text-sm font-semibold text-white">Affiliations</span>
            <span className="text-xs text-slate-500">
              ({active.length} active · {past.length} past)
            </span>
          </div>
          <span className="text-slate-400 text-xs">
            {collapsed ? 'Show' : 'Hide'}
          </span>
        </button>

        {!collapsed && (
          <div className="px-4 pb-4">
            {/* Tabs */}
            <div className="flex gap-1 mb-3 bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setTab('active')}
                className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
                  tab === 'active'
                    ? 'bg-sky-500/20 text-sky-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Current ({active.length})
              </button>
              <button
                onClick={() => setTab('past')}
                className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
                  tab === 'past'
                    ? 'bg-slate-500/20 text-slate-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Previous ({past.length})
              </button>
            </div>

            {/* List */}
            <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1 mb-3 custom-scroll">
              {list.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4">
                  No {tab === 'active' ? 'current' : 'previous'} affiliations yet.
                </p>
              )}
              {list.map((a) => (
                <div
                  key={a.id}
                  className="group flex items-center gap-2 rounded-lg px-2.5 py-2 bg-white/[0.03] hover:bg-white/[0.07] transition-colors border border-white/5"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: a.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-100 truncate">
                      {a.location_name}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {a.lab} · {a.project}
                    </p>
                  </div>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${
                      a.work_done
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'bg-amber-500/15 text-amber-300'
                    }`}
                  >
                    {a.work_done ? 'Done' : 'Ongoing'}
                  </span>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(a)}
                      className="p-1 hover:text-sky-400 text-slate-400 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onToggleActive(a)}
                      className="p-1 hover:text-slate-200 text-slate-400 transition-colors"
                      title={a.is_active ? 'Move to previous' : 'Restore to current'}
                    >
                      <Clock className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDelete(a.id)}
                      className="p-1 hover:text-red-400 text-slate-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Form toggle */}
            {!showForm && (
              <button
                onClick={() => {
                  setForm(emptyForm);
                  setEditingId(null);
                  setShowForm(true);
                }}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-sky-300 hover:text-sky-200 bg-sky-500/10 hover:bg-sky-500/15 rounded-lg py-2 transition-colors border border-sky-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                {editingId ? 'Add affiliation' : 'Add new affiliation'}
              </button>
            )}

            {/* Form */}
            {showForm && (
              <div className="rounded-lg bg-black/30 border border-white/10 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">
                    {editingId ? 'Edit affiliation' : 'New affiliation'}
                  </span>
                  <button
                    onClick={resetForm}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <Field label="Location name">
                  <input
                    type="text"
                    value={form.location_name}
                    onChange={(e) =>
                      setForm({ ...form, location_name: e.target.value })
                    }
                    placeholder="e.g. Singapore"
                    className={inputCls}
                  />
                </Field>

                <Field label="Country">
                  <input
                    type="text"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    placeholder="e.g. Singapore"
                    className={inputCls}
                  />
                </Field>

                <Field label="Lab / University">
                  <input
                    type="text"
                    value={form.lab}
                    onChange={(e) => setForm({ ...form, lab: e.target.value })}
                    placeholder="e.g. NParks"
                    className={inputCls}
                  />
                </Field>

                <Field label="Project">
                  <input
                    type="text"
                    value={form.project}
                    onChange={(e) => setForm({ ...form, project: e.target.value })}
                    placeholder="e.g. Orchid project"
                    className={inputCls}
                  />
                </Field>

                <Field label="Discipline">
                  <div className="flex flex-wrap gap-1">
                    {DISCIPLINE_PRESETS.map((d) => (
                      <button
                        key={d.value}
                        onClick={() =>
                          setForm({ ...form, discipline: d.value, color: d.color })
                        }
                        className={`text-[10px] px-2 py-1 rounded-md font-medium border transition-colors ${
                          form.discipline === d.value
                            ? 'border-white/30 text-white'
                            : 'border-white/10 text-slate-400 hover:text-slate-200'
                        }`}
                        style={
                          form.discipline === d.value
                            ? { backgroundColor: d.color + '33' }
                            : undefined
                        }
                      >
                        <span
                          className="inline-block w-2 h-2 rounded-full mr-1 align-middle"
                          style={{ backgroundColor: d.color }}
                        />
                        {d.label}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="Custom color">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="w-8 h-8 rounded bg-transparent border border-white/10 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className={`${inputCls} flex-1 font-mono`}
                      placeholder="#3b82f6"
                    />
                  </div>
                </Field>

                <div className="grid grid-cols-2 gap-2">
                  <Field label="Latitude">
                    <input
                      type="number"
                      step="0.0001"
                      value={form.lat}
                      onChange={(e) =>
                        setForm({ ...form, lat: parseFloat(e.target.value) || 0 })
                      }
                      className={inputCls}
                      placeholder="1.3521"
                    />
                  </Field>
                  <Field label="Longitude">
                    <input
                      type="number"
                      step="0.0001"
                      value={form.lng}
                      onChange={(e) =>
                        setForm({ ...form, lng: parseFloat(e.target.value) || 0 })
                      }
                      className={inputCls}
                      placeholder="103.8198"
                    />
                  </Field>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) =>
                      setForm({ ...form, is_active: e.target.checked })
                    }
                    className="accent-sky-500 w-3.5 h-3.5"
                  />
                  <span className="text-xs text-slate-300">Current affiliation</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.work_done}
                    onChange={(e) =>
                      setForm({ ...form, work_done: e.target.checked })
                    }
                    className="accent-emerald-500 w-3.5 h-3.5"
                  />
                  <span className="text-xs text-slate-300">Work completed</span>
                </label>

                {error && (
                  <p className="text-[11px] text-red-400">{error}</p>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-white bg-sky-500/80 hover:bg-sky-500 rounded-lg py-2 transition-colors disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {saving ? 'Saving…' : editingId ? 'Update' : 'Add'}
                  </button>
                  <button
                    onClick={resetForm}
                    className="text-xs font-medium text-slate-400 hover:text-slate-200 bg-white/5 hover:bg-white/10 rounded-lg px-3 py-2 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const inputCls =
  'w-full bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 transition-colors';

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[10px] font-medium text-slate-400 mb-1 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}
