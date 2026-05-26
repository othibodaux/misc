import { useEffect, useState } from 'react';
import { getSignedUrl } from '../../lib/photos';

function initials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join('');
}

// `src` may be a storage path (resolved to a signed URL) or a direct URL/blob.
export default function Avatar({ src, name, size = 48, hideName = false, className = '' }) {
  const isDirect = !!src && /^(https?:|blob:|data:)/.test(src);
  const directUrl = isDirect ? src : null;
  const [signedUrl, setSignedUrl] = useState(null);

  useEffect(() => {
    if (!src || isDirect) return;
    let active = true;
    getSignedUrl(src).then((u) => active && setSignedUrl(u));
    return () => {
      active = false;
    };
  }, [src, isDirect]);

  const url = directUrl || signedUrl;
  const style = { width: size, height: size };

  return (
    <div
      className={`shrink-0 overflow-hidden rounded-full bg-panel2 border border-edge flex items-center justify-center ${className}`}
      style={style}
    >
      {url ? (
        <img src={url} alt={name || ''} className="h-full w-full object-cover" />
      ) : (
        <span className="text-gray-400 font-semibold" style={{ fontSize: size * 0.36 }}>
          {hideName ? '?' : initials(name)}
        </span>
      )}
    </div>
  );
}
