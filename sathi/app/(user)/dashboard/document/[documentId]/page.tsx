"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getDocumentDetail } from "@/app/api/document";
import { BackArrowIcon } from "../../../component/icons";
import { formatCurrency } from "../../../component/helperfunction/helpers";
import OverviewTab from "../../../component/tabs/OverviewTab";
import ItemsTab from "../../../component/tabs/ItemsTab";
import PartiesTab from "../../../component/tabs/PartiesTab";
import TaxesTab from "../../../component/tabs/TaxesTab";
import LinkedTab from "../../../component/tabs/LinkedTab";

const tabs = ["overview", "items", "parties", "taxes", "linked"] as const;
type Tab = (typeof tabs)[number];

export default function DocumentDetailPage() {
  const { documentId } = useParams();
  const router = useRouter();
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  useEffect(() => {
    if (documentId) fetchDocument();
  }, [documentId]);

  const fetchDocument = async () => {
    try {
      const res = await getDocumentDetail(documentId as string);
      if (res.data.success) {
        setDoc(res.data.data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-base">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-base text-muted px-4 text-center">
        <p className="text-lg">Document not found</p>
        <button onClick={() => router.back()} className="mt-4 px-4 py-2 text-sm rounded-lg border border-line hover:text-ink">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base text-ink font-sans">
      {/* Header */}
      <div className="border-b border-line bg-surface px-4 py-4 md:px-8 md:py-6">
        <button onClick={() => router.back()} className="text-sm text-muted hover:text-ink mb-4 flex items-center gap-2">
          <BackArrowIcon /> Back to Documents
        </button>

        {/* Reponsive Header Layout: Mobile par flex-col, Medium screen par flex-row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold break-words">{doc.documentNumber || "Untitled Document"}</h1>
            <p className="text-sm text-muted mt-1 capitalize">
              {doc.documentType?.replace("_", " ") || "—"} •{" "}
              {doc.documentDate ? new Date(doc.documentDate).toLocaleDateString("en-IN") : "No date"}
            </p>
          </div>
          
          <div className="md:text-right mt-2 md:mt-0 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start">
            <div className="flex flex-col md:items-end">
               <p className="text-sm text-muted hidden md:block">Grand Total</p>
               <p className="text-2xl md:text-3xl font-bold">{doc.grandTotal ? formatCurrency(doc.grandTotal) : "—"}</p>
            </div>
            
            <span className={`text-xs font-medium px-3 py-1 rounded-full mt-0 md:mt-2 ${
              doc.balanceDue > 0 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
            }`}>
              {doc.balanceDue > 0 ? `Due: ${formatCurrency(doc.balanceDue)}` : "Paid"}
            </span>
          </div>
        </div>

        {/* Scrollable Tabs for Mobile */}
        <div className="flex gap-2 mt-6 overflow-x-auto no-scrollbar pb-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-lg capitalize transition-colors ${
                activeTab === tab
                  ? "bg-primary text-white"
                  : "text-muted hover:text-ink hover:bg-primary/10"
              }`}
            >
              {tab === "linked" ? "Linked Docs" : tab}
              {tab === "items" && ` (${doc.items?.length || 0})`}
              {tab === "parties" && ` (${doc.parties?.length || 0})`}
              {tab === "taxes" && ` (${doc.taxes?.length || 0})`}
              {tab === "linked" && ` (${doc.linkedDocuments?.length || 0})`}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {/* Mobile par padding kam ki hai (p-4), aur desktop pe normal (md:p-8) */}
      <div className="p-4 md:p-8">
        {activeTab === "overview" && <OverviewTab doc={doc} />}
        {activeTab === "items" && <ItemsTab items={doc.items} />}
        {activeTab === "parties" && <PartiesTab parties={doc.parties} />}
        {activeTab === "taxes" && <TaxesTab taxes={doc.taxes} />}
        {activeTab === "linked" && <LinkedTab linked={doc.linkedDocuments} />}
      </div>
    </div>
  );
}