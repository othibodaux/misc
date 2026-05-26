export default function Drawer({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 w-full max-w-md overflow-y-auto border-l border-edge bg-ink p-5 pb-24 shadow-xl">
        <button
          className="mb-3 text-sm text-gray-400 hover:text-gray-200"
          onClick={onClose}
        >
          ✕ Close
        </button>
        {children}
      </div>
    </div>
  );
}
