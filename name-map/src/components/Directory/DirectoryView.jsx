import { useMemo, useState } from 'react';
import SearchBar from '../shared/SearchBar';
import ProfileRow from './ProfileRow';
import Drawer from '../shared/Drawer';
import ProfileCard from '../Profile/ProfileCard';
import { exportPeopleCsv } from '../../lib/exportCsv';

export default function DirectoryView({
  people,
  circles,
  byCircle,
  onUpdate,
  onDelete,
  connections = [],
  onAddConnection,
  onRemoveConnection,
}) {
  const [q, setQ] = useState('');
  const [circleFilter, setCircleFilter] = useState('all');
  const [sort, setSort] = useState('created');
  const [needsPhoto, setNeedsPhoto] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = people;
    if (needsPhoto) list = list.filter((p) => !p.photo_url);
    if (circleFilter !== 'all') {
      list = list.filter((p) =>
        circleFilter === 'none' ? !p.circle_id : p.circle_id === circleFilter
      );
    }
    if (needle) {
      list = list.filter((p) =>
        ['name', 'headline', 'company', 'notes', 'where_met']
          .map((k) => (p[k] || '').toLowerCase())
          .join(' ')
          .includes(needle)
      );
    }
    const sorted = [...list];
    if (sort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'circle')
      sorted.sort((a, b) =>
        (byCircle(a.circle_id)?.name || '~').localeCompare(byCircle(b.circle_id)?.name || '~')
      );
    else sorted.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    return sorted;
  }, [people, q, circleFilter, sort, needsPhoto, byCircle]);

  const selected = people.find((p) => p.id === selectedId) || null;

  return (
    <div className="mx-auto max-w-md px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Directory</h1>
        <button
          className="text-xs text-accent hover:underline disabled:opacity-40"
          onClick={() => exportPeopleCsv(filtered, (id) => byCircle(id)?.name || '')}
          disabled={filtered.length === 0}
        >
          Export CSV
        </button>
      </div>
      <SearchBar value={q} onChange={setQ} placeholder="Search name, company, notes…" />

      <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <select className="field w-auto" value={circleFilter} onChange={(e) => setCircleFilter(e.target.value)}>
          <option value="all">All circles</option>
          {circles.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
          <option value="none">No circle</option>
        </select>
        <select className="field w-auto" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="created">Newest</option>
          <option value="name">Name A–Z</option>
          <option value="circle">By circle</option>
        </select>
        <button
          className={`btn whitespace-nowrap border ${
            needsPhoto ? 'border-accent text-accent' : 'border-edge text-gray-300'
          }`}
          onClick={() => setNeedsPhoto((v) => !v)}
        >
          Needs photo
        </button>
      </div>

      <p className="mt-3 text-xs text-gray-500">{filtered.length} people</p>

      <div className="mt-2 space-y-2">
        {filtered.map((p) => (
          <ProfileRow key={p.id} person={p} circle={byCircle(p.circle_id)} onClick={() => setSelectedId(p.id)} />
        ))}
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-500">No people yet. Add someone from the ➕ tab.</p>
        )}
      </div>

      <Drawer open={!!selected} onClose={() => setSelectedId(null)}>
        {selected && (
          <ProfileCard
            person={selected}
            circle={byCircle(selected.circle_id)}
            circles={circles}
            onUpdate={onUpdate}
            onDelete={async (id) => {
              await onDelete(id);
              setSelectedId(null);
            }}
            people={people}
            connections={connections}
            onAddConnection={onAddConnection}
            onRemoveConnection={onRemoveConnection}
          />
        )}
      </Drawer>
    </div>
  );
}
