import { useRef, useState } from 'react';
import Avatar from '../shared/Avatar';
import { parseProfileImage } from '../../lib/parseProfile';

export default function ImageUploader({ file, previewUrl, onFile, onParsed }) {
  const inputRef = useRef(null);
  const [parsing, setParsing] = useState(false);
  const [note, setNote] = useState(null);

  async function handleSelect(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    onFile(f, URL.createObjectURL(f));
    setNote(null);
    setParsing(true);
    try {
      const { fields, raw } = await parseProfileImage(f);
      onParsed(fields, raw);
      setNote('Parsed — review the fields below.');
    } catch (err) {
      setNote(`Couldn't auto-parse (${err.message}). Enter details manually.`);
    } finally {
      setParsing(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Avatar src={previewUrl} size={96} />
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={handleSelect}
      />
      <button type="button" className="btn-ghost" onClick={() => inputRef.current?.click()}>
        {file ? 'Change photo' : 'Upload screenshot / photo'}
      </button>
      {parsing && <p className="text-xs text-accent">Reading the screenshot…</p>}
      {note && !parsing && <p className="text-xs text-gray-400 text-center">{note}</p>}
    </div>
  );
}
