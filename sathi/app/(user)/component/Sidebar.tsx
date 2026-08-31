"use client";
import { useState } from "react";
import {
  HomeIcon, InvoiceIcon, BillIcon, CartIcon, ChartIcon,
  FileIcon, CreditCardIcon, ExpenseIcon, ReceiptIcon,
  CreditNoteIcon, DebitNoteIcon, OtherIcon,
} from "./icons";

const documentTypes = [
  { id: "invoice", name: "Invoice", icon: <InvoiceIcon /> },
  { id: "bill", name: "Bill", icon: <BillIcon /> },
  { id: "purchase_order", name: "Purchase Order", icon: <CartIcon /> },
  { id: "sales_order", name: "Sales Order", icon: <ChartIcon /> },
  { id: "quotation", name: "Quotation", icon: <FileIcon /> },
  { id: "payment", name: "Payment", icon: <CreditCardIcon /> },
  { id: "expense", name: "Expense", icon: <ExpenseIcon /> },
  { id: "receipt", name: "Receipt", icon: <ReceiptIcon /> },
  { id: "credit_note", name: "Credit Note", icon: <CreditNoteIcon /> },
  { id: "debit_note", name: "Debit Note", icon: <DebitNoteIcon /> },
  { id: "other", name: "Other", icon: <OtherIcon /> },
];

export { documentTypes };

interface SidebarProps {
  activeType: string | null;
  onTypeChange: (type: string | null) => void;
}

export default function Sidebar({ activeType, onTypeChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleTypeChange = (type: string | null) => {
    onTypeChange(type);
    setIsOpen(false); // mobile pe select karte hi band ho jaaye
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-5 left-4 z-50 p-2 rounded-xl bg-surface border border-line shadow-lg"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-64 h-full border-r border-line bg-surface flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Header with Close button on mobile */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-line shrink-0">
          <h1 className="text-2xl font-bold text-ink tracking-wide">
            Saathi<span className="text-primary">.</span>
          </h1>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1 rounded-lg text-muted hover:text-ink transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-4 pt-6 pb-2 shrink-0">
          <button
            onClick={() => handleTypeChange(null)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors group ${
              activeType === null
                ? "bg-primary/10 text-primary"
                : "text-muted hover:text-primary hover:bg-primary/10"
            }`}
          >
            <HomeIcon />
            <span className="text-[15px] font-medium">All Documents</span>
          </button>
        </div>

        <div className="px-6 pt-4 pb-2 shrink-0">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider">
            Document Types
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 pb-6 space-y-1">
          {documentTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handleTypeChange(type.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors group ${
                activeType === type.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted hover:text-primary hover:bg-primary/10"
              }`}
            >
              <div
                className={`transition-colors ${
                  activeType === type.id
                    ? "text-primary"
                    : "text-muted group-hover:text-primary"
                }`}
              >
                {type.icon}
              </div>
              <span className="text-[15px] font-medium">{type.name}</span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}