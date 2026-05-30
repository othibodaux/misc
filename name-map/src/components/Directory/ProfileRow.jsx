import Avatar from '../shared/Avatar';

export default function ProfileRow({ person, circle, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-edge bg-panel px-3 py-2.5 text-left hover:bg-panel2"
    >
      <Avatar src={person.photo_url} name={person.name} size={44} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-white">{person.name}</p>
        <p className="truncate text-sm text-gray-400">
          {person.headline || person.company || '—'}
        </p>
      </div>
      {circle && (
        <span
          className="h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: circle.color }}
          title={circle.name}
        />
      )}
    </button>
  );
}
