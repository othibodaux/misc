import { useMemo, useState } from 'react';

export default function Connections({ person, people, connections, onAdd, onRemove }) {
  const [adding, setAdding] = useState(false);
  const [otherId, setOtherId] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const linked = useMemo(() => {
    return connections
      .filter((c) => c.person_a === person.id || c.person_b === person.id)
      .map((c) => {
        const otherPersonId = c.person_a === person.id ? c.person_b : c.person_a;
        return { conn: c, other: people.find((p) => p.id === otherPersonId) };
      })
      .filter((x) => x.other);
  }, [connections, people, person.id]);

  const linkedIds = new Set(linked.map((l) => l.other.id));
  const options = people.filter((p) => p.id !== person.id && !linkedIds.has(p.id));

  async function save() {
    if (!otherId) return;
    setBusy(true);
    try {
      await onAdd(person.id, otherId, note);
      setOtherId('');
      setNote('');
      setAdding(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-gray-500">Connections</p>
        {!adding && (
          <button className="text-xs text-accent hover:underline" onClick={() => setAdding(true)}>
            + Link someone
          </button>
        )}
      </div>

      {linked.length === 0 && !adding && (
        <p className="text-sm text-gray-500">No connections yet.</p>
      )}

      <div className="space-y-1.5">
        {linked.map(({ conn, other }) => (
          <div key={conn.id} className="flex items-center justify-between rounded-lg bg-panel2 px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm text-gray-100">{other.name}</p>
              {conn.note && <p className="truncate text-xs text-gray-400">{conn.note}</p>}
            </div>
            <button
              className="ml-2 shrink-0 text-xs text-gray-500 hover:text-red-400"
              onClick={() => onRemove(conn.id)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {adding && (
        <div className="mt-2 space-y-2">
          <select className="field" value={otherId} onChange={(e) => setOtherId(e.target.value)}>
            <option value="">— pick a person —</option>
            {options.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <input
            className="field"
            placeholder='Note, e.g. "introduced me at Leeds career fair"'
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex gap-2">
            <button className="btn-ghost flex-1" onClick={() => setAdding(false)} disabled={busy}>
              Cancel
            </button>
            <button className="btn-accent flex-1" onClick={save} disabled={busy || !otherId}>
              {busy ? 'Linking…' : 'Link'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
