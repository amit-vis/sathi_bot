export default function InfoRow({ label, value, bold }: { label: string; value: any; bold?: boolean }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span className={`text-ink ${bold ? "font-bold" : ""}`}>{value}</span>
    </div>
  );
}