"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { axiosInstance } from "@/app/api/axios";
import UpdateSubscriptionModal from "./modal/Updatesubscriptionmodal";
import { LogoutUser } from "@/app/api/user";

interface User {
  id: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  createdAt: string;
  subscriptions?: {
    id: string;
    plan: string;
    subscriptionStatus: boolean;
    startDate: string | null;
    endDate: string | null;
    totalCredits: number;
    usedCredits: number;
    remainingCredits: number;
  };
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

type StatusFilter = "" | "active" | "inactive" | "expiring";

export default function UserListPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState<StatusFilter>("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (search.trim()) params.search = search.trim();
      if (status) params.status = status;

      const { data } = await axiosInstance.get("/admin/users", { params });
      setUsers(data.users || []);
      setPagination(data.pagination || null);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleStatusChange = (newStatus: StatusFilter) => {
    setStatus(newStatus);
    setPage(1);
  };

  const handleUpdateClick = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    setSelectedUserId(userId);
    setModalOpen(true);
  };

  const handleRowClick = (userId: string) => {
    router.push(`/admin/dashboard/${userId}`);
  };

  const getDaysLeft = (endDate: string | null) => {
    if (!endDate) return null;
    const diff = new Date(endDate).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getPlanColor = (plan?: string) => {
    switch (plan) {
      case "BASIC": return "bg-blue-500/15 text-blue-400";
      case "PRO": return "bg-violet-500/15 text-violet-400";
      case "ENTERPRISE": return "bg-amber-500/15 text-amber-400";
      case "SUBSCRIPTION_ACTIVATION": return "bg-emerald-500/15 text-emerald-400";
      default: return "bg-zinc-500/15 text-zinc-400";
    }
  };

  const getExpiryColor = (days: number | null) => {
    if (days === null) return "text-zinc-600";
    if (days <= 0) return "text-red-400";
    if (days <= 3) return "text-red-400";
    if (days <= 7) return "text-amber-400";
    return "text-zinc-400";
  };

  const statusFilters: { label: string; value: StatusFilter }[] = [
    { label: "All", value: "" },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
    { label: "Expiring Soon", value: "expiring" },
  ];

  const handleLogout = async ()=>{
    await LogoutUser();
    router.push("/admin/login")
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 px-4 py-8 sm:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
            Users & Subscriptions
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {pagination ? `${pagination.totalUsers} total users` : "Loading…"}
          </p>
        </div>
        <div className="mb-6">
          <button onClick={handleLogout} className="cursor-pointer">Log out</button>
        </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search name or email…"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-zinc-600 transition-colors"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
            {statusFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => handleStatusChange(f.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  status === f.value
                    ? "bg-zinc-700 text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          {/* Header */}
          <div className="hidden sm:grid grid-cols-[1.3fr_1.8fr_1fr_0.8fr_1fr_0.8fr_110px] gap-3 px-5 py-3 bg-zinc-900/60 border-b border-zinc-800 text-xs font-medium text-zinc-500 uppercase tracking-wider">
            <span>Name</span>
            <span>Email</span>
            <span>Plan</span>
            <span>Status</span>
            <span>Credits</span>
            <span>Expires</span>
            <span className="text-right">Action</span>
          </div>

          {loading ? (
            <div className="px-5 py-16 text-center">
              <div className="flex items-center justify-center gap-3 text-zinc-500">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading…
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="px-5 py-16 text-center text-sm text-zinc-600">
              No users found
            </div>
          ) : (
            users.map((user) => {
              const daysLeft = getDaysLeft(user.subscriptions?.endDate || null);
              return (
                <div
                  key={user.id}
                  onClick={() => handleRowClick(user.id)}
                  className="grid grid-cols-1 sm:grid-cols-[1.3fr_1.8fr_1fr_0.8fr_1fr_0.8fr_110px] gap-2 sm:gap-3 px-5 py-4 border-b border-zinc-800/60 hover:bg-zinc-800/30 cursor-pointer transition-colors group"
                >
                  {/* Name */}
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-400 shrink-0">
                      {user.userName?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <span className="text-sm font-medium text-zinc-200 truncate group-hover:text-zinc-50">
                      {user.userName || "—"}
                    </span>
                  </div>

                  {/* Email */}
                  <div className="text-sm text-zinc-400 truncate self-center">
                    {user.userEmail}
                  </div>

                  {/* Plan */}
                  <div className="self-center">
                    <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium ${getPlanColor(user.subscriptions?.plan)}`}>
                      {user.subscriptions?.plan || "FREE"}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2 self-center">
                    <span className={`h-2 w-2 rounded-full ${user.subscriptions?.subscriptionStatus ? "bg-emerald-500" : "bg-zinc-600"}`} />
                    <span className="text-xs text-zinc-400">
                      {user.subscriptions?.subscriptionStatus ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Credits */}
                  <div className="text-sm tabular-nums text-zinc-400 self-center">
                    {user.subscriptions?.remainingCredits ?? 0}
                    <span className="text-zinc-600">/{user.subscriptions?.totalCredits ?? 0}</span>
                  </div>

                  {/* Expiry */}
                  <div className={`text-xs self-center ${getExpiryColor(daysLeft)}`}>
                    {daysLeft === null
                      ? "—"
                      : daysLeft <= 0
                      ? "Expired"
                      : `${daysLeft}d left`}
                  </div>

                  {/* Action */}
                  <div className="flex justify-end self-center">
                    <button
                      onClick={(e) => handleUpdateClick(e, user.id)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 text-xs font-medium text-zinc-300 hover:text-zinc-100 transition-all cursor-pointer"
                    >
                      Update
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 px-1">
            <p className="text-xs text-zinc-500">
              Page {pagination.currentPage} of {pagination.totalPages}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrev}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  pagination.hasPrev
                    ? "border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
                    : "border-zinc-800 bg-zinc-900 text-zinc-700 cursor-not-allowed"
                }`}
              >
                Previous
              </button>

              {/* Page numbers */}
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        pageNum === pagination.currentPage
                          ? "bg-zinc-100 text-zinc-900"
                          : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={!pagination.hasNext}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  pagination.hasNext
                    ? "border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
                    : "border-zinc-800 bg-zinc-900 text-zinc-700 cursor-not-allowed"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && selectedUserId && (
        <UpdateSubscriptionModal
          userId={selectedUserId}
          onClose={() => {
            setModalOpen(false);
            setSelectedUserId(null);
          }}
          onSuccess={() => {
            setModalOpen(false);
            setSelectedUserId(null);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}