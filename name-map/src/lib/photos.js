import { supabase } from '../supabaseClient';

const BUCKET = 'nm-profile-photos';
const cache = new Map();

export async function uploadPhoto(userId, file) {
  const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase();
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return path;
}

export async function getSignedUrl(path) {
  if (!path) return null;
  if (cache.has(path)) return cache.get(path);
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 7);
  if (error) return null;
  cache.set(path, data.signedUrl);
  return data.signedUrl;
}

export async function deletePhoto(path) {
  if (!path) return;
  cache.delete(path);
  await supabase.storage.from(BUCKET).remove([path]);
}
