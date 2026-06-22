"use client";

import { motion } from "framer-motion";
import { Users, Shield, Car, AlertTriangle, Play, Pause, Camera } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import EstateMapContainer from "@/components/EstateMapContainer";
import { getAdminDashboardStats } from "@/app/actions/admin";
import Link from "next/link";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] || "Admin";
  const [cctvActive, setCctvActive] = useState(true);
  
  const [statsData, setStatsData] = useState<any>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getAdminDashboardStats();
        setStatsData(data);
      } catch (err) {
        console.error("Failed to load admin stats", err);
      }
    }
    loadStats();
  }, []);

  const stats = [
    { label: "Total Residents", value: statsData?.totalResidents ?? "0", trend: "Active", color: "text-slate-900", bg: "bg-slate-100", border: "border-slate-200", icon: Users },
    { label: "Active Guards", value: statsData?.activeGuards ?? "0", trend: "On Duty", color: "text-slate-900", bg: "bg-slate-100", border: "border-slate-200", icon: Shield },
    { label: "Vehicles Today", value: statsData?.vehiclesToday ?? "0", trend: "Today", color: "text-slate-900", bg: "bg-slate-100", border: "border-slate-200", icon: Car },
    { label: "Security Alerts", value: statsData?.securityAlerts ?? "0", trend: "Active", color: "text-slate-900", bg: "bg-slate-100", border: "border-slate-200", icon: AlertTriangle },
  ];

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">{getGreeting()},</p>
        <h2 className="text-3xl font-bold font-outfit text-slate-900 tracking-tight">{firstName} 👋</h2>
        <p className="text-slate-500 text-sm mt-1">Here&apos;s your estate management overview for today.</p>
      </motion.div>
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass-panel p-6 rounded-xl border ${stat.border}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stat.bg} ${stat.color}`}>
                  {stat.trend}
                </span>
              </div>
              <p className="text-slate-500 text-sm font-medium mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold font-outfit text-slate-900">{stat.value}</h3>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CCTV Dashboard (Mock) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass-panel rounded-xl border border-slate-200 overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white/30">
            <h3 className="font-semibold text-slate-900 flex items-center">
              <Camera className="w-5 h-5 mr-2 text-slate-900" strokeWidth={1.5} />
              Live Gate CCTV Feeds
            </h3>
            <div className="flex space-x-2">
              <button 
                onClick={() => setCctvActive(!cctvActive)}
                className={`p-2 rounded-lg transition-colors bg-slate-100 text-slate-900 hover:bg-slate-200`}
              >
                {cctvActive ? <Pause className="w-4 h-4" strokeWidth={1.5} /> : <Play className="w-4 h-4" strokeWidth={1.5} />}
              </button>
            </div>
          </div>
          
          <div className="p-6 flex-1 bg-black relative">
            <div className="absolute inset-0 grid grid-cols-2 gap-1 p-1">
              {[1, 2, 3, 4].map((cam) => (
                <div key={cam} className="relative bg-white rounded border border-slate-200 overflow-hidden group">
                  {/* Mock static noise / overlay for camera */}
                  <div className={`absolute inset-0 bg-slate-100 flex flex-col items-center justify-center ${cctvActive ? 'opacity-20' : 'opacity-100'}`}>
                    {!cctvActive && (
                      <>
                        <Camera className="w-8 h-8 text-slate-300 mb-2" strokeWidth={1} />
                        <span className="text-slate-400 font-medium text-sm">NO SIGNAL</span>
                        <span className="text-slate-400 text-xs mt-1">Check Camera Connection</span>
                      </>
                    )}
                  </div>
                  
                  {cctvActive && (
                    <>
                      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10">
                        <Camera className="w-16 h-16 text-slate-900" />
                      </div>
                      <div className="absolute top-2 left-2 text-slate-900 font-mono text-[10px] bg-black/50 px-2 py-1 rounded text-white">
                        CAM {cam} - {cam === 1 ? 'MAIN GATE IN' : cam === 2 ? 'MAIN GATE OUT' : cam === 3 ? 'PEDESTRIAN' : 'PERIMETER'}
                      </div>
                      <div className="absolute bottom-2 right-2 font-mono text-[10px] bg-black/50 px-2 py-1 rounded flex items-center text-white">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1 animate-pulse"></span> REC
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions & Recent */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <div className="glass-panel p-6 rounded-xl border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Quick Management</h3>
            <div className="space-y-3">
              <Link href="/admin/residents" className="block">
                <button className="w-full text-left px-4 py-3 bg-slate-100 hover:bg-slate-200/50 rounded-xl text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium border border-slate-300">
                  + Add New Resident
                </button>
              </Link>
              <Link href="/admin/security" className="block">
                <button className="w-full text-left px-4 py-3 bg-slate-100 hover:bg-slate-200/50 rounded-xl text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium border border-slate-300">
                  + Register Security Guard
                </button>
              </Link>
              <Link href="/admin/settings" className="block">
                <button className="w-full text-left px-4 py-3 bg-slate-100 hover:bg-slate-200/50 rounded-xl text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium border border-slate-300">
                  Manage Security Fees
                </button>
              </Link>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-xl border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">System Logs</h3>
            <div className="space-y-4">
              {statsData?.recentLogs?.length > 0 ? (
                statsData.recentLogs.map((log: any) => (
                  <div key={log.id} className="flex flex-col border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                    <span className="text-sm text-slate-900 font-medium">{log.title}</span>
                    <span className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleString()}</span>
                    <span className="text-xs text-slate-400 mt-1">{log.message}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No recent system logs.</p>
              )}
            </div>
          </div>
        </motion.div>

      </div>

      {/* Estate Map Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <EstateMapContainer />
      </motion.div>
    </div>
  );
}
