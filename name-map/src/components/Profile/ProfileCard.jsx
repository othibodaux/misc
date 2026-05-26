import { useState } from 'react';
import Avatar from '../shared/Avatar';
import CircleBadge from '../shared/CircleBadge';
import ProfileForm from '../AddPerson/ProfileForm';

function Contact({ icon, value, href }) {
  if (!value) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 text-sm text-accent hover:underline"
    >
      <span>{icon}</span>
      <span className="truncate">{value}</span>
    </a>
  );
}

export default function ProfileCard({ person, circle, circles, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState(person);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      await onUpdate(person.id, {
        name: values.name,
        headline: values.headline || null,
        company: values.company || null,
        email: values.email || null,
        phone: values.phone || null,
        linkedin_url: values.linkedin_url || null,
        where_met: values.where_met || null,
        met_date: values.met_date || null,
        circle_id: values.circle_id || null,
        notes: values.notes || null,
      });
      setEditing(false);
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <div className="space-y-3">
        <ProfileForm values={values} circles={circles} onChange={setValues} />
        <div className="flex gap-2">
          <button className="btn-ghost flex-1" onClick={() => { setValues(person); setEditing(false); }} disabled={busy}>
            Cancel
          </button>
          <button className="btn-accent flex-1" onClick={save} disabled={busy}>
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center text-center">
        <Avatar src={person.photo_url} name={person.name} size={88} />
        <h2 className="mt-3 text-xl font-semibold text-white">{person.name}</h2>
        {person.headline && <p className="text-sm text-gray-300">{person.headline}</p>}
        {person.company && <p className="text-sm text-gray-400">{person.company}</p>}
        {circle && (
          <div className="mt-2">
            <CircleBadge circle={circle} />
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Contact icon="✉️" value={person.email} href={`mailto:${person.email}`} />
        <Contact icon="📞" value={person.phone} href={`tel:${person.phone}`} />
        <Contact icon="in" value={person.linkedin_url} href={person.linkedin_url} />
      </div>

      {(person.where_met || person.met_date) && (
        <p className="text-sm text-gray-400">
          Met {person.where_met && <span className="text-gray-200">{person.where_met}</span>}
          {person.met_date && ` · ${person.met_date}`}
        </p>
      )}

      <div>
        <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">Notes</p>
        <p className="whitespace-pre-wrap text-sm text-gray-200">
          {person.notes || <span className="text-gray-500">No notes yet.</span>}
        </p>
      </div>

      <div className="flex gap-2 pt-2">
        <button className="btn-ghost flex-1" onClick={() => { setValues(person); setEditing(true); }}>
          Edit
        </button>
        <button
          className="btn flex-1 bg-red-500/15 text-red-400 hover:bg-red-500/25"
          onClick={() => {
            if (confirm(`Delete ${person.name}?`)) onDelete(person.id);
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
