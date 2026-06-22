"use client";

import { motion } from "framer-motion";
import { Search, Filter, ShieldAlert, CheckCircle, XCircle, Clock } from "lucide-react";

import { useState, useEffect } from "react";
import { getGateLogs } from "@/app/actions/security";

export default function SecurityLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const data = await getGateLogs();
        setLogs(data);
      } catch (err) {
        console.error("Failed to load gate logs", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLogs();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold font-outfit text-slate-900 tracking-tight">Access Logs</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Detailed history of all gate entry and exit events.</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center text-sm font-medium shadow-sm">
            <Filter className="w-4 h-4 mr-2" strokeWidth={1.5} /> Filter
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
          <input 
            type="text" 
            placeholder="Search by code, visitor name, or destination..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-12 pr-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-500/50 transition-all font-medium"
          />
        </div>
        <select className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-lime-500/50 font-medium min-w-[150px]">
          <option>All Events</option>
          <option>Successful Entry</option>
          <option>Failed Attempts</option>
          <option>Exits</option>
        </select>
      </motion.div>

      {/* Logs Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="p-4 pl-6">Status & Type</th>
                <th className="p-4">Time</th>
                <th className="p-4">Access Code</th>
                <th className="p-4">Visitor</th>
                <th className="p-4">Destination</th>
                <th className="p-4 pr-6">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">Loading logs...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No recent logs found.</td>
                </tr>
              ) : logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center space-x-3">
                      {log.status === "USED" ? (
                        <div className="w-8 h-8 rounded-full bg-lime-50 border border-lime-200 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-lime-600" strokeWidth={2} />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
                          <XCircle className="w-4 h-4 text-red-500" strokeWidth={2} />
                        </div>
                      )}
                      <div>
                        <p className={`text-xs font-bold ${log.status === 'USED' ? 'text-lime-700' : 'text-red-600'}`}>
                          {log.status === "USED" ? "SUCCESS" : "FAILED"}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">ENTRY</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center text-slate-700 font-medium text-sm">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400" strokeWidth={1.5} />
                      {new Date(log.creationTime).toLocaleString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-mono font-medium text-sm bg-slate-100 px-2.5 py-1 rounded-md text-slate-700 border border-slate-200/60">
                      {log.code}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-medium text-slate-900">{log.guestName || "Unknown"}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-slate-600">{log.resident?.address || "Unknown"}</p>
                  </td>
                  <td className="p-4 pr-6">
                    {log.status === "EXPIRED" ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-600 border border-red-100">
                        <ShieldAlert className="w-3 h-3 mr-1.5" strokeWidth={2} />
                        Expired
                      </span>
                    ) : log.vehicleInfo ? (
                      <span className="text-xs text-slate-600 font-medium border border-slate-200 px-2.5 py-1 rounded-md bg-white">
                        Car: {log.vehicleInfo}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
