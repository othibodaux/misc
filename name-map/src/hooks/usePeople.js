import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export function usePeople(session) {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session) return;
    const { data, error } = await supabase
      .from('nm_people')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setPeople(data || []);
    setLoading(false);
  }, [session]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch sets state after await
    load();
  }, [load]);

  const create = useCallback(
    async (fields) => {
      const { data, error } = await supabase
        .from('nm_people')
        .insert({ ...fields, owner_id: session.user.id })
        .select()
        .single();
      if (error) throw error;
      setPeople((prev) => [data, ...prev]);
      return data;
    },
    [session]
  );

  const update = useCallback(async (id, patch) => {
    const { data, error } = await supabase
      .from('nm_people')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setPeople((prev) => prev.map((p) => (p.id === id ? data : p)));
    return data;
  }, []);

  const remove = useCallback(async (id) => {
    const { error } = await supabase.from('nm_people').delete().eq('id', id);
    if (error) throw error;
    setPeople((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { people, loading, reload: load, create, update, remove };
}
