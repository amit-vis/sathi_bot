import EmptyState from "../shared/EmptyState";
import { formatCurrency } from "../helperfunction/helpers";

export default function TaxesTab({ taxes }: { taxes: any[] }) {
  if (!taxes?.length) return <EmptyState text="No tax details found" />;

  return (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <table className="w-full text-left">
        <thead className="bg-surface border-b border-line">
          <tr>
            <th className="px-6 py-4 text-xs font-semibold text-muted uppercase">Tax Type</th>
            <th className="px-6 py-4 text-xs font-semibold text-muted uppercase">Rate %</th>
            <th className="px-6 py-4 text-xs font-semibold text-muted uppercase">Taxable Amount</th>
            <th className="px-6 py-4 text-xs font-semibold text-muted uppercase">Tax Amount</th>
            <th className="px-6 py-4 text-xs font-semibold text-muted uppercase">Currency</th>
          </tr>
        </thead>
        <tbody>
          {taxes.map((tax) => (
            <tr key={tax.id} className="border-b border-line hover:bg-surface/50">
              <td className="px-6 py-4 text-sm font-medium text-ink uppercase">{tax.taxType || "—"}</td>
              <td className="px-6 py-4 text-sm">{tax.ratePercent ? `${tax.ratePercent}%` : "—"}</td>
              <td className="px-6 py-4 text-sm">{formatCurrency(tax.taxableAmount)}</td>
              <td className="px-6 py-4 text-sm font-medium text-ink">{formatCurrency(tax.amount)}</td>
              <td className="px-6 py-4 text-sm text-muted">{tax.currency || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}