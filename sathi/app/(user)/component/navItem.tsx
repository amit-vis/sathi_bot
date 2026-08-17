export function NavItem({ label, icon, active, onClick }: { label: string; icon: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
        active ? "bg-primary/10 text-primary font-medium" : "text-muted hover:text-ink hover:bg-surface-2"
      }`}
    >
      {icon} {label}
    </button>
  );
}