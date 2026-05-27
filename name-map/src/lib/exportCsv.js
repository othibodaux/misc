function escapeCell(value) {
  const s = value == null ? '' : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const COLUMNS = [
  ['name', 'Name'],
  ['headline', 'Headline'],
  ['company', 'Company'],
  ['email', 'Email'],
  ['phone', 'Phone'],
  ['linkedin_url', 'LinkedIn URL'],
  ['where_met', 'Where met'],
  ['met_date', 'Met date'],
  ['notes', 'Notes'],
];

export function exportPeopleCsv(people, circleName) {
  const header = [...COLUMNS.map(([, label]) => label), 'Circle'];
  const rows = people.map((p) =>
    [...COLUMNS.map(([key]) => escapeCell(p[key])), escapeCell(circleName(p.circle_id))].join(',')
  );
  const csv = [header.join(','), ...rows].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `namemap-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
