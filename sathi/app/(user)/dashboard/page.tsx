"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import HeaderWithProfile from "../component/headerProfile";
import { getUser } from "@/app/auth/store";
import { documentUser, downloadExcel } from "@/app/api/document";
import Sidebar, { documentTypes } from "../component/Sidebar";
import DocumentTable from "../component/DocumentTable";
import Pagination from "../component/Pagination";
import FilterBar from "../component/FilterBar";
import { FileIcon } from "../component/icons";

export default function DashboardPage() {
  const user = getUser();
  const router = useRouter();
  const [ subcriptiondetails, setSubscriptionDetails] = useState(null)
  const [activeType, setActiveType] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<{
    startDate?: string;
    endDate?: string;
    documentNumber?: string;
    documentType?: string;
  }>({});
  const [pagination, setPagination] = useState({
    page: 1, limit: 20, total: 0, totalPages: 0,
  });

  // Jab activeType change ho, filters reset karo aur fetch karo
  useEffect(() => {
    setFilters({});
    fetchDocuments(1, {});
  }, [activeType]);

  const fetchDocuments = useCallback(async (
    page: number,
    currentFilters?: typeof filters
  ) => {
    setLoading(true);
    try {
      const appliedFilters = currentFilters ?? filters;

      const params = new URLSearchParams({
        page: String(page),
        limit: String(pagination.limit),
      });

      // 👇 sidebar se type aaye toh woh use karo, nahi toh filter bar se
      if (activeType) {
        params.append("documentType", activeType);
      } else if (appliedFilters.documentType) {
        params.append("documentType", appliedFilters.documentType);
      }

      if (appliedFilters.startDate) params.append("startDate", appliedFilters.startDate);
      if (appliedFilters.endDate) params.append("endDate", appliedFilters.endDate);
      if (appliedFilters.documentNumber) params.append("documentNumber", appliedFilters.documentNumber);

      const res = await documentUser(params);
      const result = res.data;

      if (result.success) {
        setDocuments(Array.isArray(result.data) ? result.data : []);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [activeType, filters, pagination.limit]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    fetchDocuments(1, newFilters);
  };

  const handleRowClick = (documentId: string) => {
    router.push(`/dashboard/document/${documentId}`);
  };

  const handleDownloadExcel = async () => {
  try {
    const params = new URLSearchParams();

    if (activeType) {
      params.append("documentType", activeType);
    } else if (filters.documentType) {
      params.append("documentType", filters.documentType);
    }
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.documentNumber) params.append("documentNumber", filters.documentNumber);

    const res = await downloadExcel(params);

    // Blob se file download trigger karo
    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `documents_${new Date().toISOString().split("T")[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed:", error);
  }
};

  return (
    <div className="flex h-screen w-full bg-base text-ink overflow-hidden font-sans">
      <Sidebar activeType={activeType} onTypeChange={setActiveType} />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <HeaderWithProfile 
        userName={user?.userName} 
        userEmail={user?.userEmail} />

        <div className="flex-1 overflow-y-auto p-8 bg-base">
          {/* Heading */}
         <div className="flex items-center justify-between mb-6">
  <h2 className="text-2xl font-semibold text-ink">
    {activeType
      ? activeType === "other"
        ? "Other Documents"
        : documentTypes.find((d) => d.id === activeType)?.name + "s"
      : "All Documents"}
  </h2>
  <div className="flex items-center gap-4">
    <span className="text-sm text-muted">Total: {pagination?.total}</span>
    {documents.length > 0 && (
      <button
        onClick={handleDownloadExcel}
        className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
      >
        <DownloadIcon />
        Download Excel
      </button>
    )}
  </div>
</div>

          {/* 👇 FilterBar — documentType dropdown sirf All Documents mein */}
          <FilterBar
            key={activeType ?? "all"} // 👈 tab change pe reset ho jaaye
            onFilterChange={handleFilterChange}
            showDocumentType={activeType === null}
          />

          {/* Documents */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted">
              <FileIcon />
              <p className="mt-4 text-lg">No documents found</p>
            </div>
          ) : (
            <>
              <DocumentTable documents={documents} onRowClick={handleRowClick} />
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(page) => fetchDocuments(page)}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}