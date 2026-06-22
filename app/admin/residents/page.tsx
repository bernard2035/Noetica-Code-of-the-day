"use client";

import { motion } from "framer-motion";
import { Search, Filter, UserPlus, MoreVertical, Edit, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getAllUsers } from "@/app/actions/admin";

export default function AdminResidentsPage() {
  const [residents, setResidents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchResidents() {
      try {
        const users = await getAllUsers();
        setResidents(users.filter((u: any) => u.role === "RESIDENT"));
      } catch (err) {
        console.error("Failed to load residents", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchResidents();
  }, []);

  const filtered = residents.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-outfit text-slate-900">Resident Management</h1>
          <p className="text-slate-500 mt-1 text-sm">Manage all estate residents, their details, and billing status.</p>
        </div>
        <button className="px-4 py-2.5 bg-lime-600 hover:bg-lime-500 text-slate-900 rounded-xl font-medium transition-colors flex items-center justify-center">
          <UserPlus className="w-4 h-4 mr-2" /> Add Resident
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-9000" />
          <input 
            type="text" 
            placeholder="Search residents by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
        <button className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center justify-center sm:w-auto w-full">
          <Filter className="w-4 h-4 mr-2" /> Filter
        </button>
      </div>

      <div className="glass-panel rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white shadow-sm border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Resident</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Address</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Fee Status</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading residents...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No residents found.</td>
                </tr>
              ) : filtered.map((res, i) => (
                <motion.tr 
                  key={res.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-slate-100/20 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-lime-500/20 flex items-center justify-center text-lime-600 font-bold mr-3 uppercase">
                        {res.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">{res.name}</div>
                        <div className="text-xs text-slate-9000">{res.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {res.residentProfile?.address || "N/A"} <span className="text-slate-9000 text-xs block">{res.residentProfile?.familyMembers?.length || 1} Occupants</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {res.residentProfile?.phone || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {res.residentProfile?.billingStatus === "PAID" ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-lime-500/10 text-lime-600 border border-lime-500/20">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-slate-500 hover:text-slate-900 mx-2"><Edit className="w-4 h-4" /></button>
                    <button className="text-slate-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
