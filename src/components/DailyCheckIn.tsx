'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type CheckIn = {
  id: string;
  date: string;
  mood: number;
  energy: number;
  sleepHours: number;
  intention: string;
  gratitude: string;
  note: string;
  createdAt: string;
};

type Draft = Omit<CheckIn, 'id' | 'createdAt'>;

const STORAGE_KEY = 'jules-daily-checkins-v1';

function getLocalDateValue(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function createDraft(date: string): Draft {
  return {
    date,
    mood: 3,
    energy: 3,
    sleepHours: 7,
    intention: '',
    gratitude: '',
    note: '',
  };
}

const moodLabels = ['Very low', 'Low', 'Steady', 'Good', 'Very good'];
const energyLabels = ['Depleted', 'Low', 'Moderate', 'Energised', 'Very energised'];

function isCheckIn(value: unknown): value is CheckIn {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Partial<CheckIn>;
  return (
    typeof entry.id === 'string' &&
    typeof entry.date === 'string' &&
    typeof entry.mood === 'number' &&
    entry.mood >= 1 &&
    entry.mood <= 5 &&
    typeof entry.energy === 'number' &&
    entry.energy >= 1 &&
    entry.energy <= 5 &&
    typeof entry.sleepHours === 'number' &&
    entry.sleepHours >= 0 &&
    entry.sleepHours <= 24 &&
    typeof entry.intention === 'string' &&
    typeof entry.gratitude === 'string' &&
    typeof entry.note === 'string' &&
    typeof entry.createdAt === 'string'
  );
}

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `checkin-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatDate(value: string): string {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}

export default function DailyCheckIn() {
  const [today, setToday] = useState('');
  const [entries, setEntries] = useState<CheckIn[]>([]);
  const [draft, setDraft] = useState<Draft>(() => createDraft(''));
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const localToday = getLocalDateValue();
    setToday(localToday);
    setDraft((current) => (current.date ? current : { ...current, date: localToday }));

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.every(isCheckIn)) {
          setEntries(parsed.sort((left, right) => right.date.localeCompare(left.date)));
        } else {
          setNotice('Saved check-ins were invalid, so Jules opened with a clean history.');
        }
      }
    } catch {
      setNotice('Saved check-ins could not be read. Browser storage may be unavailable.');
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      setNotice('This check-in is visible now but could not be saved in the browser.');
    }
  }, [entries, ready]);

  const recentSummary = useMemo(() => {
    const recent = entries.slice(0, 7);
    if (!recent.length) return null;
    const total = recent.reduce(
      (summary, entry) => {
        summary.mood += entry.mood;
        summary.energy += entry.energy;
        summary.sleep += entry.sleepHours;
        return summary;
      },
      { mood: 0, energy: 0, sleep: 0 },
    );
    return {
      mood: total.mood / recent.length,
      energy: total.energy / recent.length,
      sleep: total.sleep / recent.length,
    };
  }, [entries]);

  const saveCheckIn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotice('');

    if (!draft.date) {
      setError('Choose a date for this check-in.');
      return;
    }
    if (today && draft.date > today) {
      setError('Check-ins cannot be saved for a future date.');
      return;
    }
    if (!Number.isFinite(draft.sleepHours) || draft.sleepHours < 0 || draft.sleepHours > 24) {
      setError('Sleep must be between 0 and 24 hours.');
      return;
    }

    const existing = entries.find((entry) => entry.date === draft.date);
    const nextEntry: CheckIn = {
      ...draft,
      intention: draft.intention.trim(),
      gratitude: draft.gratitude.trim(),
      note: draft.note.trim(),
      id: existing?.id ?? createId(),
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };

    setEntries((current) =>
      [nextEntry, ...current.filter((entry) => entry.date !== draft.date)].sort((left, right) =>
        right.date.localeCompare(left.date),
      ),
    );
    setDraft(createDraft(today || getLocalDateValue()));
    setNotice(existing ? `The ${formatDate(nextEntry.date)} check-in was updated.` : 'Your check-in was saved in this browser.');
  };

  const loadEntry = (entry: CheckIn) => {
    setDraft({
      date: entry.date,
      mood: entry.mood,
      energy: entry.energy,
      sleepHours: entry.sleepHours,
      intention: entry.intention,
      gratitude: entry.gratitude,
      note: entry.note,
    });
    setNotice(`Editing the check-in from ${formatDate(entry.date)}.`);
    document.getElementById('check-in')?.scrollIntoView({ behavior: 'smooth' });
  };

  const removeEntry = (id: string) => {
    setEntries((current) => current.filter((entry) => entry.id !== id));
    setNotice('The selected check-in was removed.');
  };

  const clearHistory = () => {
    if (!window.confirm('Delete every check-in stored in this browser?')) return;
    setEntries([]);
    setNotice('Local check-in history was cleared.');
  };

  const exportHistory = () => {
    const exportDate = today || getLocalDateValue();
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `jules-checkins-${exportDate}.json`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    window.setTimeout(() => {
      link.remove();
      URL.revokeObjectURL(url);
    }, 0);
    setNotice('A JSON copy of your local history was exported.');
  };

  return (
    <div className="space-y-10">
      <section aria-label="Recent check-in summary" className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Saved days" value={String(entries.length)} />
        <SummaryCard label="Recent mood" value={recentSummary ? `${recentSummary.mood.toFixed(1)} / 5` : '—'} />
        <SummaryCard label="Recent energy" value={recentSummary ? `${recentSummary.energy.toFixed(1)} / 5` : '—'} />
        <SummaryCard label="Recent sleep" value={recentSummary ? `${recentSummary.sleep.toFixed(1)} h` : '—'} />
      </section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section id="check-in" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Daily check-in</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Notice what is present today</h2>
          <p className="mt-3 leading-7 text-slate-600">A private reflection form for personal awareness. It does not assess, diagnose or treat health conditions.</p>

          <form onSubmit={saveCheckIn} className="mt-8 space-y-6">
            <label className="block text-sm font-semibold text-slate-700">
              Date
              <input
                type="date"
                value={draft.date}
                max={today || undefined}
                onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              />
            </label>

            <ScaleField
              label="Mood"
              value={draft.mood}
              labels={moodLabels}
              onChange={(value) => setDraft((current) => ({ ...current, mood: value }))}
            />
            <ScaleField
              label="Energy"
              value={draft.energy}
              labels={energyLabels}
              onChange={(value) => setDraft((current) => ({ ...current, energy: value }))}
            />

            <label className="block text-sm font-semibold text-slate-700">
              Sleep hours
              <input
                type="number"
                min="0"
                max="24"
                step="0.25"
                value={draft.sleepHours}
                onChange={(event) => setDraft((current) => ({ ...current, sleepHours: Number(event.target.value) }))}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              />
            </label>

            <TextField
              label="Today’s intention"
              value={draft.intention}
              placeholder="One realistic focus for today"
              onChange={(value) => setDraft((current) => ({ ...current, intention: value.slice(0, 180) }))}
            />
            <TextField
              label="Something I appreciate"
              value={draft.gratitude}
              placeholder="A person, moment or ordinary detail"
              onChange={(value) => setDraft((current) => ({ ...current, gratitude: value.slice(0, 180) }))}
            />
            <label className="block text-sm font-semibold text-slate-700">
              Notes
              <textarea
                rows={5}
                value={draft.note}
                onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value.slice(0, 1000) }))}
                placeholder="Write freely, or leave this blank"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              />
              <span className="mt-1 block text-right text-xs font-normal text-slate-400">{draft.note.length}/1000</span>
            </label>

            {error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
            {notice && <p role="status" className="rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-800">{notice}</p>}

            <button
              type="submit"
              className="w-full rounded-xl bg-slate-900 px-5 py-3.5 font-semibold text-white transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-200"
            >
              Save check-in
            </button>
          </form>
        </section>

        <section id="history" aria-labelledby="history-heading" className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Private history</p>
              <h2 id="history-heading" className="mt-2 text-3xl font-bold text-slate-900">Your recent reflections</h2>
            </div>
            {entries.length > 0 && (
              <div className="flex gap-2">
                <button type="button" onClick={exportHistory} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-500 hover:text-teal-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-100">Export JSON</button>
                <button type="button" onClick={clearHistory} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-400 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-100">Clear</button>
              </div>
            )}
          </div>

          {!ready ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">Loading local history…</div>
          ) : entries.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-10 text-center">
              <p className="text-4xl" aria-hidden="true">🌱</p>
              <h3 className="mt-4 text-xl font-bold text-slate-900">No check-ins yet</h3>
              <p className="mx-auto mt-2 max-w-md leading-7 text-slate-600">Complete the form when useful. There is no streak, score or obligation to write every day.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <article key={entry.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-teal-700">{formatDate(entry.date)}</p>
                      <h3 className="mt-1 text-xl font-bold text-slate-900">Mood {entry.mood}/5 · Energy {entry.energy}/5 · Sleep {entry.sleepHours}h</h3>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => loadEntry(entry)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:border-teal-500 hover:text-teal-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-100">Edit</button>
                      <button type="button" onClick={() => removeEntry(entry.id)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:border-rose-400 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-100">Delete</button>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <Reflection label="Intention" value={entry.intention} />
                    <Reflection label="Appreciation" value={entry.gratitude} />
                  </div>
                  {entry.note && <div className="mt-4 rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Notes</p><p className="mt-2 whitespace-pre-wrap leading-7 text-slate-700">{entry.note}</p></div>}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function ScaleField({
  label,
  value,
  labels,
  onChange,
}: {
  label: string;
  value: number;
  labels: string[];
  onChange: (value: number) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-slate-700">{label}</legend>
      <div className="mt-3 grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => onChange(score)}
            aria-pressed={value === score}
            aria-label={`${label}: ${labels[score - 1]}`}
            className={`rounded-xl border px-2 py-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-100 ${
              value === score
                ? 'border-teal-700 bg-teal-700 text-white'
                : 'border-slate-300 bg-white text-slate-600 hover:border-teal-500'
            }`}
          >
            {score}
          </button>
        ))}
      </div>
      <p className="mt-2 text-sm text-slate-500">{labels[value - 1]}</p>
    </fieldset>
  );
}

function TextField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
      />
    </label>
  );
}

function Reflection({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-teal-50/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">{label}</p>
      <p className="mt-2 leading-7 text-slate-700">{value || 'Not recorded'}</p>
    </div>
  );
}
