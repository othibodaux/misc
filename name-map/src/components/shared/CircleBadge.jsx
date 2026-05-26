export default function CircleBadge({ circle, onClick }) {
  if (!circle) return null;
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        onClick ? 'cursor-pointer' : ''
      }`}
      style={{ backgroundColor: `${circle.color}22`, color: circle.color }}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: circle.color }} />
      {circle.name}
    </span>
  );
}
