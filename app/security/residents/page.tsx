"use client";

import { motion } from "framer-motion";
import { Search, MapPin, Phone, User } from "lucide-react";

export default function SecurityResidentsPage() {
  const residents = [
    { id: 1, name: "David O.", unit: "Unit 4B", phone: "+234 800 123 4567", status: "Active" },
    { id: 2, name: "Jane Smith", unit: "Unit 12C", phone: "+234 800 987 6543", status: "Active" },
    { id: 3, name: "Samuel Agu", unit: "Block 5", phone: "+234 801 234 5678", status: "Away" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold font-outfit text-slate-900 tracking-tight">Resident Directory</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Lookup resident details for manual verification.</p>
        </div>
      </div>

      {/* Search */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex"
      >
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
          <input 
            type="text" 
            placeholder="Search by name, unit, or phone number..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-12 pr-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all font-medium"
          />
        </div>
      </motion.div>

      {/* Residents List */}
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
                <th className="p-4 pl-6">Resident Name</th>
                <th className="p-4">Unit / Address</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {residents.map((res) => (
                <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                        {res.name.charAt(0)}
                      </div>
                      <p className="text-sm font-medium text-slate-900">{res.name}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center text-slate-700 text-sm font-medium">
                      <MapPin className="w-4 h-4 mr-2 text-slate-400" strokeWidth={1.5} />
                      {res.unit}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center text-slate-700 text-sm font-medium">
                      <Phone className="w-4 h-4 mr-2 text-slate-400" strokeWidth={1.5} />
                      {res.phone}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                      res.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {res.status}
                    </span>
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
