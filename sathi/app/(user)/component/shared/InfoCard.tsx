export default function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}