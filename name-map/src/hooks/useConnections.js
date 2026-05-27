import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export function useConnections(session) {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session) return;
    const { data, error } = await supabase
      .from('nm_connections')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setConnections(data || []);
    setLoading(false);
  }, [session]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch sets state after await
    load();
  }, [load]);

  const add = useCallback(
    async (personA, personB, note) => {
      if (personA === personB) throw new Error('Pick two different people.');
      const { data, error } = await supabase
        .from('nm_connections')
        .insert({ owner_id: session.user.id, person_a: personA, person_b: personB, note: note || null })
        .select()
        .single();
      if (error) throw error;
      setConnections((prev) => [data, ...prev]);
      return data;
    },
    [session]
  );

  const remove = useCallback(async (id) => {
    const { error } = await supabase.from('nm_connections').delete().eq('id', id);
    if (error) throw error;
    setConnections((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { connections, loading, reload: load, add, remove };
}
