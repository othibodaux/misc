import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseInvitationsCsv } from '../../lib/importLinkedIn';
import { todayISO } from '../../lib/srs';

export default function ImportLinkedIn({ people, circles, onBulkCreate }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const otherCircle = circles.find((c) => c.name === 'Other') || null;

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setResult(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const rows = parseInvitationsCsv(reader.result);
        if (!rows.length) {
          setError('No people found. Is this the LinkedIn Invitations.csv export?');
          setParsed(null);
          return;
        }
        setParsed(rows);
      } catch (err) {
        setError(`Could not read that file: ${err.message}`);
      }
    };
    reader.readAsText(file);
  }

  async function runImport() {
    if (!parsed) return;
    setBusy(true);
    setError(null);
    try {
      const existingUrls = new Set(
        people.map((p) => (p.linkedin_url || '').toLowerCase()).filter(Boolean)
      );
      const existingNames = new Set(people.map((p) => p.name.trim().toLowerCase()));

      const fresh = parsed.filter((r) => {
        const url = (r.linkedin_url || '').toLowerCase();
        if (url && existingUrls.has(url)) return false;
        if (!url && existingNames.has(r.name.trim().toLowerCase())) return false;
        return true;
      });

      const skipped = parsed.length - fresh.length;

      const toInsert = fresh.map((r) => ({
        ...r,
        circle_id: otherCircle?.id || null,
        srs_due_date: todayISO(),
      }));

      await onBulkCreate(toInsert);
      setResult({ added: toInsert.length, skipped });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card mt-4 p-4">
      <h2 className="font-medium text-white">Import from LinkedIn</h2>
      <p className="mt-1 text-xs text-gray-400">
        Upload your LinkedIn <span className="text-gray-200">Invitations.csv</span> export to add
        everyone at once{otherCircle ? ' into the "Other" circle' : ''}. Photos are added later per
        person.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleFile}
      />
      <button type="button" className="btn-ghost mt-3" onClick={() => inputRef.current?.click()}>
        Choose CSV file
      </button>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {parsed && !result && (
        <div className="mt-3">
          <p className="text-sm text-gray-300">
            Found <span className="font-semibold text-white">{parsed.length}</span> people ready to
            import.
          </p>
          <button className="btn-accent mt-2 w-full" onClick={runImport} disabled={busy}>
            {busy ? 'Importing…' : `Import ${parsed.length} people`}
          </button>
        </div>
      )}

      {result && (
        <div className="mt-3 rounded-lg bg-panel2 p-3 text-sm">
          <p className="text-green-400">✓ Added {result.added} people.</p>
          {result.skipped > 0 && (
            <p className="text-gray-400">Skipped {result.skipped} already in your network.</p>
          )}
          <button className="btn-accent mt-3 w-full" onClick={() => navigate('/directory')}>
            View directory
          </button>
        </div>
      )}
    </div>
  );
}
