"use client";
import { useState } from "react";

interface FilterBarProps {
  onFilterChange: (filters: {
    startDate?: string;
    endDate?: string;
    documentNumber?: string;
    documentType?: string;
  }) => void;
  showDocumentType?: boolean; // sirf "All Documents" tab mein true
}

const documentTypeOptions = [
  { value: "", label: "All Types" },
  { value: "invoice", label: "Invoice" },
  { value: "bill", label: "Bill" },
  { value: "purchase_order", label: "Purchase Order" },
  { value: "sales_order", label: "Sales Order" },
  { value: "quotation", label: "Quotation" },
  { value: "payment", label: "Payment" },
  { value: "expense", label: "Expense" },
  { value: "receipt", label: "Receipt" },
  { value: "credit_note", label: "Credit Note" },
  { value: "debit_note", label: "Debit Note" },
  { value: "other", label: "Other" },
];

export default function FilterBar({ onFilterChange, showDocumentType = false }: FilterBarProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [documentType, setDocumentType] = useState("");

  const handleApply = () => {
    onFilterChange({
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(documentNumber && { documentNumber }),
      ...(showDocumentType && documentType && { documentType }),
    });
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setDocumentNumber("");
    setDocumentType("");
    onFilterChange({});
  };

  // har input change pe apply — real-time feel
  const handleSearchChange = (value: string) => {
    setDocumentNumber(value);
    onFilterChange({
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(value && { documentNumber: value }),
      ...(showDocumentType && documentType && { documentType }),
    });
  };

  return (
    <div className="flex flex-wrap items-end gap-4 mb-6 p-4 rounded-2xl border border-line bg-surface">
      {/* Search Bar */}
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-medium text-muted mb-1">
          Search Document
        </label>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search by document number..."
            value={documentNumber}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-line bg-base text-ink placeholder:text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Start Date */}
      <div className="w-full md:min-w-[160px] md:w-auto">
        <label className="block text-xs font-medium text-muted mb-1">
          Start Date
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full px-3 py-2.5 text-sm rounded-lg border border-line bg-base text-ink focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* End Date */}
      <div className="w-full md:min-w-[160px] md:w-auto">
        <label className="block text-xs font-medium text-muted mb-1">
          End Date
        </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full px-3 py-2.5 text-sm rounded-lg border border-line bg-base text-ink focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Document Type - sirf All Documents tab mein */}
      {showDocumentType && (
        <div className="w-full md:min-w-[160px] md:w-auto">
          <label className="block text-xs font-medium text-muted mb-1">
            Document Type
          </label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-line bg-base text-ink focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {documentTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleApply}
          className="px-5 py-2.5 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
        >
          Apply
        </button>
        <button
          onClick={handleReset}
          className="px-5 py-2.5 text-sm font-medium rounded-lg border border-line text-muted hover:text-ink transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}