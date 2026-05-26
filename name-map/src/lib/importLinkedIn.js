import Papa from 'papaparse';

// Parses a LinkedIn "Invitations.csv" export into stub people.
// Each row is an invitation; the "other" person is whoever isn't Owen,
// determined by Direction (OUTGOING -> To/invitee, INCOMING -> From/inviter).
export function parseInvitationsCsv(text) {
  const { data } = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  const seen = new Set();
  const people = [];

  for (const row of data) {
    const direction = (row.Direction || '').trim().toUpperCase();
    let name;
    let url;
    if (direction === 'INCOMING') {
      name = (row.From || '').trim();
      url = (row.inviterProfileUrl || '').trim();
    } else {
      name = (row.To || '').trim();
      url = (row.inviteeProfileUrl || '').trim();
    }

    if (!name) continue;

    const key = (url || name).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const message = (row.Message || '').trim();
    const sentAt = (row['Sent At'] || '').trim();

    people.push({
      name,
      linkedin_url: url || null,
      notes: message || null,
      where_met: sentAt ? `Connected on LinkedIn (${sentAt})` : null,
    });
  }

  return people;
}
