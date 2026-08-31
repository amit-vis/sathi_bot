interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 mt-6">
      <button
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="px-4 py-2 text-sm rounded-lg border border-line text-muted hover:text-ink disabled:opacity-40"
      >
        Previous
      </button>
      <span className="text-sm text-muted">
        Page {page} of {totalPages}
      </span>
      <button
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="px-4 py-2 text-sm rounded-lg border border-line text-muted hover:text-ink disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}