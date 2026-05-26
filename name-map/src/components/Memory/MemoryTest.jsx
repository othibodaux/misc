import { useEffect, useMemo, useState } from 'react';
import Avatar from '../shared/Avatar';
import CircleBadge from '../shared/CircleBadge';
import { buildQueue, dueCount, review } from '../../lib/srs';

const GRADES = [
  { key: 'missed', label: 'Missed', cls: 'bg-red-500/15 text-red-400 hover:bg-red-500/25' },
  { key: 'hard', label: 'Hard', cls: 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25' },
  { key: 'good', label: 'Good', cls: 'bg-accent/20 text-accent hover:bg-accent/30' },
  { key: 'easy', label: 'Easy', cls: 'bg-green-500/15 text-green-400 hover:bg-green-500/25' },
];

export default function MemoryTest({ people, circles, byCircle, onUpdate }) {
  const [circleFilter, setCircleFilter] = useState('all');
  const [queue, setQueue] = useState([]);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [streak, setStreak] = useState(0);
  const [done, setDone] = useState(0);

  const pool = useMemo(() => {
    if (circleFilter === 'all') return people;
    if (circleFilter === 'none') return people.filter((p) => !p.circle_id);
    return people.filter((p) => p.circle_id === circleFilter);
  }, [people, circleFilter]);

  function start() {
    setQueue(buildQueue(pool));
    setIdx(0);
    setRevealed(false);
    setDone(0);
    setStreak(0);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: reset session state when filter/data changes
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- rebuild only on filter or roster-size change
  }, [circleFilter, people.length]);

  const current = queue[idx] || null;
  const due = dueCount(pool);

  async function grade(g) {
    if (!current) return;
    const patch = review(current, g);
    onUpdate(current.id, patch); // optimistic; hook updates state
    setStreak((s) => (g === 'missed' ? 0 : s + 1));
    setDone((d) => d + 1);
    setRevealed(false);
    setIdx((i) => i + 1);
  }

  if (pool.length === 0) {
    return (
      <Shell circles={circles} circleFilter={circleFilter} setCircleFilter={setCircleFilter} due={0} streak={0}>
        <div className="card mt-10 p-8 text-center text-gray-400">
          No faces to study here yet. Add people from the ➕ tab.
        </div>
      </Shell>
    );
  }

  if (!current) {
    return (
      <Shell circles={circles} circleFilter={circleFilter} setCircleFilter={setCircleFilter} due={due} streak={streak}>
        <div className="card mt-10 p-8 text-center">
          <p className="text-2xl">🎉</p>
          <p className="mt-2 font-medium text-white">Session complete</p>
          <p className="mt-1 text-sm text-gray-400">You reviewed {done} {done === 1 ? 'face' : 'faces'}.</p>
          <button className="btn-accent mt-5" onClick={start}>Go again</button>
        </div>
      </Shell>
    );
  }

  const circle = byCircle(current.circle_id);

  return (
    <Shell circles={circles} circleFilter={circleFilter} setCircleFilter={setCircleFilter} due={due} streak={streak}>
      <div className="mt-2 text-center text-xs text-gray-500">
        {idx + 1} / {queue.length}
      </div>

      <div className="card mt-3 flex flex-col items-center p-6">
        <Avatar src={current.photo_url} name={current.name} hideName size={180} />

        {!revealed ? (
          <>
            <p className="mt-5 text-gray-400">Do you remember their name?</p>
            <button className="btn-accent mt-4 w-full" onClick={() => setRevealed(true)}>
              Reveal
            </button>
          </>
        ) : (
          <div className="mt-5 w-full text-center">
            <h2 className="text-2xl font-semibold text-white">{current.name}</h2>
            {current.headline && <p className="text-sm text-gray-300">{current.headline}</p>}
            {current.company && <p className="text-sm text-gray-400">{current.company}</p>}
            {circle && <div className="mt-2 flex justify-center"><CircleBadge circle={circle} /></div>}
            {current.where_met && (
              <p className="mt-2 text-xs text-gray-500">Met: {current.where_met}</p>
            )}
            {current.notes && (
              <p className="mt-2 whitespace-pre-wrap text-sm text-gray-300">{current.notes}</p>
            )}

            <p className="mt-5 text-xs text-gray-500">How well did you recall it?</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {GRADES.map((g) => (
                <button key={g.key} className={`btn ${g.cls}`} onClick={() => grade(g.key)}>
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}

function Shell({ children, circles, circleFilter, setCircleFilter, due, streak }) {
  return (
    <div className="mx-auto max-w-md px-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Memorize</h1>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-gray-400">Due: <span className="text-accent">{due}</span></span>
          <span className="text-gray-400">🔥 {streak}</span>
        </div>
      </div>
      <select
        className="field mt-3 w-auto"
        value={circleFilter}
        onChange={(e) => setCircleFilter(e.target.value)}
      >
        <option value="all">All circles</option>
        {circles.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
        <option value="none">No circle</option>
      </select>
      {children}
    </div>
  );
}
