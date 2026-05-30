// SM-2-lite spaced repetition. Grades: 'missed' | 'hard' | 'good' | 'easy'.

const MIN_EASE = 1.3;
const DAY = 86400000;

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(days) {
  return new Date(Date.now() + days * DAY).toISOString().slice(0, 10);
}

// Returns the patch to persist on nm_people after a review.
export function review(person, grade) {
  let ease = Number(person.srs_ease) || 2.5;
  let interval = Number(person.srs_interval_days) || 0;
  let reps = Number(person.srs_reps) || 0;
  let lapses = Number(person.srs_lapses) || 0;

  if (grade === 'missed') {
    lapses += 1;
    reps = 0;
    ease = Math.max(MIN_EASE, ease - 0.2);
    interval = 1;
  } else {
    if (grade === 'hard') ease = Math.max(MIN_EASE, ease - 0.15);
    if (grade === 'easy') ease = ease + 0.15;

    reps += 1;
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 3;
    else interval = Math.round(interval * (grade === 'hard' ? 1.2 : ease));
    if (grade === 'easy') interval = Math.round(interval * 1.3);
    interval = Math.max(1, interval);
  }

  return {
    srs_ease: Number(ease.toFixed(2)),
    srs_interval_days: interval,
    srs_reps: reps,
    srs_lapses: lapses,
    srs_due_date: addDays(interval),
    srs_last_reviewed: new Date().toISOString(),
  };
}

// Build the study queue: due people first (oldest due first), then, if none are
// due, the least-recently-reviewed people so practice always has cards.
export function buildQueue(people) {
  const today = todayISO();
  const due = people
    .filter((p) => (p.srs_due_date || today) <= today)
    .sort((a, b) => (a.srs_due_date || '').localeCompare(b.srs_due_date || ''));
  if (due.length) return due;

  return [...people].sort((a, b) => {
    const ra = a.srs_last_reviewed || '';
    const rb = b.srs_last_reviewed || '';
    return ra.localeCompare(rb);
  });
}

export function dueCount(people) {
  const today = todayISO();
  return people.filter((p) => (p.srs_due_date || today) <= today).length;
}
