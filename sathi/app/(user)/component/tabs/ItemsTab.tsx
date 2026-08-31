import EmptyState from "../shared/EmptyState";
import { formatCurrency } from "../helperfunction/helpers";

export default function ItemsTab({ items }: { items: any[] }) {
  if (!items?.length) return <EmptyState text="No items found" />;

  return (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <table className="w-full text-left">
        <thead className="bg-surface border-b border-line">
          <tr>
            <th className="px-4 py-3 text-xs font-semibold text-muted uppercase">#</th>
            <th className="px-4 py-3 text-xs font-semibold text-muted uppercase">Description</th>
            <th className="px-4 py-3 text-xs font-semibold text-muted uppercase">HSN/SAC</th>
            <th className="px-4 py-3 text-xs font-semibold text-muted uppercase">Qty</th>
            <th className="px-4 py-3 text-xs font-semibold text-muted uppercase">Unit</th>
            <th className="px-4 py-3 text-xs font-semibold text-muted uppercase">Rate</th>
            <th className="px-4 py-3 text-xs font-semibold text-muted uppercase">Discount</th>
            <th className="px-4 py-3 text-xs font-semibold text-muted uppercase">CGST</th>
            <th className="px-4 py-3 text-xs font-semibold text-muted uppercase">SGST</th>
            <th className="px-4 py-3 text-xs font-semibold text-muted uppercase">IGST</th>
            <th className="px-4 py-3 text-xs font-semibold text-muted uppercase">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={item.id} className="border-b border-line hover:bg-surface/50">
              <td className="px-4 py-3 text-sm text-muted">{item.slNo || item.lineNo || i + 1}</td>
              <td className="px-4 py-3 text-sm font-medium text-ink max-w-[250px] truncate">{item.description || "—"}</td>
              <td className="px-4 py-3 text-sm text-muted">{item.hsnSac || "—"}</td>
              <td className="px-4 py-3 text-sm">{item.quantity ?? "—"}</td>
              <td className="px-4 py-3 text-sm text-muted">{item.unit || "—"}</td>
              <td className="px-4 py-3 text-sm">{formatCurrency(item.rate)}</td>
              <td className="px-4 py-3 text-sm text-muted">
                {item.discountPercent ? `${item.discountPercent}%` : formatCurrency(item.discountAmount) || "—"}
              </td>
              <td className="px-4 py-3 text-sm text-muted">
                {item.cgstRate ? `${item.cgstRate}% (${formatCurrency(item.cgstAmount)})` : "—"}
              </td>
              <td className="px-4 py-3 text-sm text-muted">
                {item.sgstRate ? `${item.sgstRate}% (${formatCurrency(item.sgstAmount)})` : "—"}
              </td>
              <td className="px-4 py-3 text-sm text-muted">
                {item.igstRate ? `${item.igstRate}% (${formatCurrency(item.igstAmount)})` : "—"}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-ink">{formatCurrency(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}