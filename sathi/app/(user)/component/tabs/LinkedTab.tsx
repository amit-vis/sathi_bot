import EmptyState from "../shared/EmptyState";
import { formatCurrency } from "../helperfunction/helpers";

export default function LinkedTab({ linked }: { linked: any[] }) {
  if (!linked?.length) return <EmptyState text="No linked documents found" />;

  return (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <table className="w-full text-left">
        <thead className="bg-surface border-b border-line">
          <tr>
            <th className="px-6 py-4 text-xs font-semibold text-muted uppercase">Type</th>
            <th className="px-6 py-4 text-xs font-semibold text-muted uppercase">Number</th>
            <th className="px-6 py-4 text-xs font-semibold text-muted uppercase">Date</th>
            <th className="px-6 py-4 text-xs font-semibold text-muted uppercase">Amount</th>
          </tr>
        </thead>
        <tbody>
          {linked.map((ld) => (
            <tr key={ld.id} className="border-b border-line hover:bg-surface/50">
              <td className="px-6 py-4 text-sm font-medium text-ink capitalize">{ld.type?.replace("_", " ") || "—"}</td>
              <td className="px-6 py-4 text-sm">{ld.number || "—"}</td>
              <td className="px-6 py-4 text-sm text-muted">{ld.dateRaw || "—"}</td>
              <td className="px-6 py-4 text-sm font-medium text-ink">{formatCurrency(ld.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}