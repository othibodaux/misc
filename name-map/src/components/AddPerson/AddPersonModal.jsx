import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageUploader from './ImageUploader';
import ProfileForm from './ProfileForm';
import { uploadPhoto } from '../../lib/photos';
import { todayISO } from '../../lib/srs';

const EMPTY = {
  name: '',
  headline: '',
  company: '',
  email: '',
  phone: '',
  linkedin_url: '',
  where_met: '',
  met_date: '',
  circle_id: null,
  notes: '',
};

export default function AddPersonModal({ session, circles, onCreate }) {
  const navigate = useNavigate();
  const [values, setValues] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [rawParse, setRawParse] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  function applyParsed(fields, raw) {
    setRawParse(raw);
    setValues((v) => ({
      ...v,
      name: fields.name || v.name,
      headline: fields.headline || v.headline,
      company: fields.company || v.company,
      email: fields.email || v.email,
      phone: fields.phone || v.phone,
      linkedin_url: fields.linkedin_url || v.linkedin_url,
    }));
  }

  async function save() {
    if (!values.name.trim()) {
      setErr('A name is required.');
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      let photo_url = null;
      if (file) photo_url = await uploadPhoto(session.user.id, file);
      await onCreate({
        ...values,
        met_date: values.met_date || null,
        circle_id: values.circle_id || null,
        photo_url,
        raw_parse: rawParse,
        srs_due_date: todayISO(),
      });
      navigate('/directory');
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-5">
      <h1 className="mb-4 text-xl font-semibold text-white">Add a person</h1>

      <div className="card p-4">
        <ImageUploader
          file={file}
          previewUrl={previewUrl}
          onFile={(f, url) => {
            setFile(f);
            setPreviewUrl(url);
          }}
          onParsed={applyParsed}
        />
      </div>

      <div className="card mt-4 p-4">
        <ProfileForm values={values} circles={circles} onChange={setValues} />
      </div>

      {err && <p className="mt-3 text-sm text-red-400">{err}</p>}

      <div className="mt-4 flex gap-2">
        <button className="btn-ghost flex-1" onClick={() => navigate(-1)} disabled={saving}>
          Cancel
        </button>
        <button className="btn-accent flex-1" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save person'}
        </button>
      </div>
    </div>
  );
}
