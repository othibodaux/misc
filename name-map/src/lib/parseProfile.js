import { supabase } from '../supabaseClient';

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      resolve(result.split(',')[1]); // strip data: prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Calls the nm-parse-profile Edge Function. Returns { fields, raw } or throws.
export async function parseProfileImage(file) {
  const image_base64 = await fileToBase64(file);
  const { data, error } = await supabase.functions.invoke('nm-parse-profile', {
    body: { image_base64, media_type: file.type || 'image/jpeg' },
  });
  if (error) throw error;
  return { fields: data?.fields || {}, raw: data?.raw ?? null };
}
