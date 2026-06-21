"use client";

import { motion } from "framer-motion";
import { Clock, CheckCircle2, XCircle, Search, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import { getAccessHistory } from "@/app/actions/resident";

export default function VisitorHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await getAccessHistory();
        setHistory(data);
      } catch (err) {
        console.error("Failed to load access history", err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  const filteredHistory = history.filter(
    (item) => {
      const matchesSearch = (item.guestName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    }
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-outfit text-slate-900">Visitor History</h1>
          <p className="text-slate-500 mt-1 text-sm">Review all past access codes generated and their usage logs.</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-9000" />
          <input 
            type="text" 
            placeholder="Search by visitor name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors sm:w-auto w-full cursor-pointer appearance-none"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="USED">Used</option>
          <option value="EXPIRED">Expired</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Data Table */}
      <div className="glass-panel rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white shadow-sm border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Visitor</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Access Code</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Vehicle Details</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Generated / Used Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredHistory.map((log, i) => (
                <motion.tr 
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-slate-100/20 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-lime-500/20 flex items-center justify-center text-lime-600 font-bold mr-3">
                        {(log.guestName || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">{log.guestName || "Unknown"}</div>
                        <div className="text-xs text-slate-9000">{log.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm tracking-wider bg-white px-2 py-1 rounded text-slate-600 border border-slate-200">
                      {log.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {log.guestVehicleInfo || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-slate-900 capitalize">
                      {log.status.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="text-slate-600">Gen: {new Date(log.creationTime).toLocaleString()}</div>
                    <div className="text-slate-9000 text-xs mt-0.5">
                      {log.status === "USED" ? "Code used" : (log.status === "EXPIRED" ? `Exp: ${new Date(log.expirationTime).toLocaleString()}` : "Not used")}
                    </div>
                  </td>
                </motion.tr>
              ))}
              
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-9000">
                    No visitor logs found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
