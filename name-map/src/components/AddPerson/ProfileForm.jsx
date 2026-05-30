const FIELDS = [
  { key: 'name', label: 'Name', required: true },
  { key: 'headline', label: 'Headline / title' },
  { key: 'company', label: 'Company' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'phone', label: 'Phone' },
  { key: 'linkedin_url', label: 'LinkedIn URL' },
  { key: 'where_met', label: 'Where we met' },
  { key: 'met_date', label: 'Date met', type: 'date' },
];

export default function ProfileForm({ values, circles, onChange }) {
  const set = (k, v) => onChange({ ...values, [k]: v });

  return (
    <div className="space-y-3">
      {FIELDS.map((f) => (
        <div key={f.key}>
          <label className="mb-1 block text-xs text-gray-400">
            {f.label}
            {f.required && ' *'}
          </label>
          <input
            className="field"
            type={f.type || 'text'}
            value={values[f.key] || ''}
            onChange={(e) => set(f.key, e.target.value)}
          />
        </div>
      ))}

      <div>
        <label className="mb-1 block text-xs text-gray-400">Circle</label>
        <select
          className="field"
          value={values.circle_id || ''}
          onChange={(e) => set('circle_id', e.target.value || null)}
        >
          <option value="">— none —</option>
          {circles.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs text-gray-400">Notes</label>
        <textarea
          className="field min-h-[80px]"
          value={values.notes || ''}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="A memory hook helps — what stood out about them?"
        />
      </div>
    </div>
  );
}
