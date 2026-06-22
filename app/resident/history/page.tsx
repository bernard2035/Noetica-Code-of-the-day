"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle2, XCircle, Search, Ban, Loader2, QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import { getAccessHistory, cancelAccessCode } from "@/app/actions/resident";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  ACTIVE:    { label: "Active",     color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: Clock },
  USED:      { label: "Used",       color: "text-blue-700",    bg: "bg-blue-50 border-blue-200",       icon: CheckCircle2 },
  EXPIRED:   { label: "Expired",    color: "text-amber-700",   bg: "bg-amber-50 border-amber-200",     icon: XCircle },
  CANCELLED: { label: "Cancelled",  color: "text-slate-500",   bg: "bg-slate-100 border-slate-200",    icon: Ban },
};

export default function VisitorHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadHistory = async () => {
    try {
      const data = await getAccessHistory();
      setHistory(data);
    } catch (err) {
      console.error("Failed to load access history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      (item.guestName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      await cancelAccessCode(id);
      setHistory((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "CANCELLED" } : c))
      );
    } catch (err) {
      console.error("Failed to cancel code", err);
    } finally {
      setCancellingId(null);
    }
  };

  const activeCount = history.filter((h) => h.status === "ACTIVE").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-outfit text-slate-900">Visitor History</h1>
          <p className="text-slate-500 mt-1 text-sm">
            {loading ? "Loading..." : `${history.length} total code${history.length !== 1 ? "s" : ""} • ${activeCount} active`}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by visitor name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-500/40 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 focus:outline-none focus:ring-2 focus:ring-lime-500/40 transition-colors sm:w-auto w-full cursor-pointer"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="USED">Used</option>
          <option value="EXPIRED">Expired</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="glass-panel rounded-xl border border-slate-200 p-16 text-center">
          <QrCode className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">
            {searchTerm || statusFilter !== "ALL" ? "No codes match your filters." : "You haven't generated any access codes yet."}
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Visitor</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Access Code</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Vehicle</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Generated</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Expires</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence>
                  {filteredHistory.map((log, i) => {
                    const cfg = STATUS_CONFIG[log.status] || STATUS_CONFIG.EXPIRED;
                    const Icon = cfg.icon;
                    return (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-lime-500/20 flex items-center justify-center text-lime-700 font-bold mr-3 flex-shrink-0">
                              {(log.guestName || "?").charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-slate-900">{log.guestName || "Unknown"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-sm tracking-wider bg-slate-100 px-3 py-1 rounded-lg text-slate-700 border border-slate-200">
                            {log.code}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 hidden md:table-cell">
                          {log.guestVehicleInfo || <span className="text-slate-300 italic">None</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}>
                            <Icon className="w-3 h-3" />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 hidden lg:table-cell">
                          {new Date(log.creationTime).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 hidden lg:table-cell">
                          {new Date(log.expirationTime).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {log.status === "ACTIVE" ? (
                            <button
                              onClick={() => handleCancel(log.id)}
                              disabled={cancellingId === log.id}
                              className="text-xs px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center ml-auto disabled:opacity-50"
                            >
                              {cancellingId === log.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <><Ban className="w-3 h-3 mr-1" /> Cancel</>
                              )}
                            </button>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
