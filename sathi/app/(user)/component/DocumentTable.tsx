interface DocumentTableProps {
  documents: any[];
  onRowClick: (documentId: string) => void;
}

export default function DocumentTable({ documents, onRowClick }: DocumentTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <table className="w-full text-left">
        <thead className="bg-surface border-b border-line">
          <tr>
            <th className="px-6 py-4 text-xs font-semibold text-muted uppercase">Doc Number</th>
            <th className="px-6 py-4 text-xs font-semibold text-muted uppercase">Type</th>
            <th className="px-6 py-4 text-xs font-semibold text-muted uppercase">Date</th>
            <th className="px-6 py-4 text-xs font-semibold text-muted uppercase">Grand Total</th>
            <th className="px-6 py-4 text-xs font-semibold text-muted uppercase">Status</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc: any) => (
            <tr
              key={doc.id}
              onClick={() => onRowClick(doc.id)}
              className="border-b border-line hover:bg-surface/50 transition-colors cursor-pointer"
            >
              <td className="px-6 py-4 text-sm font-medium text-ink">
                {doc.documentNumber || "—"}
              </td>
              <td className="px-6 py-4 text-sm text-muted capitalize">
                {doc.documentType?.replace("_", " ") || "—"}
              </td>
              <td className="px-6 py-4 text-sm text-muted">
                {doc.documentDate
                  ? new Date(doc.documentDate).toLocaleDateString("en-IN")
                  : "—"}
              </td>
              <td className="px-6 py-4 text-sm font-medium text-ink">
                {doc.grandTotal ? `₹${doc.grandTotal}` : "—"}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full ${
                    doc.balanceDue > 0
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {doc.balanceDue > 0 ? "Pending" : "Paid"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}