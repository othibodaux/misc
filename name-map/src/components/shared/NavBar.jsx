import { NavLink } from 'react-router-dom';

const items = [
  { to: '/', label: 'Memorize', icon: '🧠', end: true },
  { to: '/graph', label: 'Graph', icon: '🕸' },
  { to: '/directory', label: 'Directory', icon: '👥' },
  { to: '/add', label: 'Add', icon: '➕' },
];

export default function NavBar() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 border-t border-edge bg-panel/95 backdrop-blur">
      <div className="mx-auto flex max-w-2xl">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs ${
                isActive ? 'text-accent' : 'text-gray-400'
              }`
            }
          >
            <span className="text-lg leading-none">{it.icon}</span>
            {it.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
