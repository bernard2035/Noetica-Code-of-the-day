"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, UserPlus, Trash2, X, Loader2, User, Mail, KeyRound, MapPin, CheckCircle2, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { getAllUsers, createResident, deleteUser } from "@/app/actions/admin";

export default function AdminResidentsPage() {
  const [residents, setResidents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const loadResidents = async () => {
    setIsLoading(true);
    try {
      const users = await getAllUsers();
      setResidents(users.filter((u: any) => u.role === "RESIDENT"));
    } catch (err) {
      console.error("Failed to load residents", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResidents();
  }, []);

  const filtered = residents.filter((r) =>
    (r.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddResident = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError("");
    const formData = new FormData(e.currentTarget);
    const res = await createResident(formData);
    if (res.success) {
      setShowModal(false);
      loadResidents();
    } else {
      setModalError(res.message || "An error occurred");
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (userId: string) => {
    setDeletingId(userId);
    const res = await deleteUser(userId);
    if (res.success) {
      setResidents((prev) => prev.filter((r) => r.id !== userId));
    } else {
      alert(res.message || "Failed to delete user");
    }
    setDeletingId(null);
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-outfit text-slate-900">Resident Management</h1>
          <p className="text-slate-500 mt-1 text-sm">
            {isLoading ? "Loading..." : `${residents.length} registered resident${residents.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          onClick={() => { setShowModal(true); setModalError(""); }}
          className="px-4 py-2.5 bg-lime-600 hover:bg-lime-500 text-slate-900 rounded-xl font-medium transition-colors flex items-center justify-center"
        >
          <UserPlus className="w-4 h-4 mr-2" /> Add Resident
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-500/40 transition-all"
        />
      </div>

      <div className="glass-panel rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Resident</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Address</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Occupants</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fee Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    {searchTerm ? "No residents match your search." : "No residents registered yet."}
                  </td>
                </tr>
              ) : (
                filtered.map((res, i) => (
                  <motion.tr
                    key={res.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-9 h-9 rounded-full bg-lime-500/20 flex items-center justify-center text-lime-700 font-bold mr-3 uppercase flex-shrink-0">
                          {(res.name || "?").charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{res.name || "—"}</div>
                          <div className="text-xs text-slate-400">{res.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {res.residentProfile?.address || <span className="text-slate-400 italic">Not set</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {res.residentProfile?.occupantCount ?? 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {res.residentProfile?.securityFeeStatus === "PAID" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {confirmDeleteId === res.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-slate-500">Confirm delete?</span>
                          <button
                            onClick={() => handleDelete(res.id)}
                            disabled={deletingId === res.id}
                            className="text-xs px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            {deletingId === res.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Yes"}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-xs px-2 py-1 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(res.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
                          title="Delete resident"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Resident Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-lime-50 to-white">
                <h3 className="font-bold text-lg text-slate-900 flex items-center">
                  <UserPlus className="w-5 h-5 mr-2 text-lime-600" /> Add New Resident
                </h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {modalError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                    {modalError}
                  </div>
                )}

                <form onSubmit={handleAddResident} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" name="name" required placeholder="Jane Doe"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-lime-500/40 focus:border-lime-500 text-slate-900 transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="email" name="email" required placeholder="resident@estate.com"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-lime-500/40 focus:border-lime-500 text-slate-900 transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Home Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" name="address" placeholder="e.g. 12 Palm Avenue"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-lime-500/40 focus:border-lime-500 text-slate-900 transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Temporary Password</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="password" name="password" required placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-lime-500/40 focus:border-lime-500 text-slate-900 transition-all" />
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button type="button" onClick={() => setShowModal(false)}
                      className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting}
                      className="flex-1 py-2.5 px-4 bg-lime-600 hover:bg-lime-500 text-slate-900 rounded-xl font-semibold transition-colors flex items-center justify-center disabled:opacity-70">
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Resident"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
