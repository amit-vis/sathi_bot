export default function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-muted">
      <p className="text-lg">{text}</p>
    </div>
  );
}