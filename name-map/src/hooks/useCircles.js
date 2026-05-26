import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export function useCircles(session) {
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session) return;
    const { data, error } = await supabase
      .from('nm_circles')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error) setCircles(data || []);
    setLoading(false);
  }, [session]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch sets state after await
    load();
  }, [load]);

  const byId = useCallback(
    (id) => circles.find((c) => c.id === id) || null,
    [circles]
  );

  return { circles, loading, reload: load, byId };
}
