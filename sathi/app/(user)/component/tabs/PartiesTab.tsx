import InfoRow from "../shared/InfoRow";
import EmptyState from "../shared/EmptyState";

export default function PartiesTab({ parties }: { parties: any[] }) {
  if (!parties?.length) return <EmptyState text="No parties found" />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {parties.map((party) => (
        <div key={party.id} className="rounded-2xl border border-line bg-surface p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-ink">{party.name || "Unknown Party"}</h3>
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary capitalize">
              {party.partyKind?.replace("_", " ")}
            </span>
          </div>
          <div className="space-y-2">
            <InfoRow label="Role" value={party.role} />
            <InfoRow
              label="Address"
              value={[party.address, party.city, party.state, party.country, party.pincode]
                .filter(Boolean).join(", ")}
            />
            <InfoRow label="Tax ID" value={party.taxId} />
            <InfoRow label="Company ID" value={party.companyId} />
            <InfoRow label="Phone" value={party.phone?.length ? party.phone.join(", ") : null} />
            <InfoRow label="Email" value={party.email?.length ? party.email.join(", ") : null} />
          </div>
        </div>
      ))}
    </div>
  );
}