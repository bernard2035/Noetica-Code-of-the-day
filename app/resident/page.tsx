"use client";

import { motion } from "framer-motion";
import { QrCode, Users, Clock, ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { getAccessHistory, getResidentProfile } from "@/app/actions/resident";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

if (typeof window !== "undefined") {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function ResidentDashboard() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] || "there";
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  const [history, setHistory] = useState<any[]>([]);
  const [address, setAddress] = useState("Update your profile");
  const [mapCenter, setMapCenter] = useState({ lat: 6.5244, lng: 3.3792 }); // Lagos default
  
  useEffect(() => {
    async function loadData() {
      try {
        const hist = await getAccessHistory();
        setHistory(hist);
        const profile = await getResidentProfile();
        if (profile?.address) {
          setAddress(profile.address);
        }
        if (profile?.lat && profile?.lng) {
          setMapCenter({ lat: profile.lat, lng: profile.lng });
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      }
    }
    loadData();
  }, []);

  const activeCodes = history.filter(h => h.status === "ACTIVE").length;
  const totalVisitors = history.length;
  const pendingExpiry = history.filter(h => 
    h.status === "ACTIVE" && new Date(h.expirationTime).getTime() - new Date().getTime() < 3600000
  ).length;

  const stats = [
    { name: "Active Codes", value: activeCodes.toString(), icon: QrCode, color: "text-lime-600", bg: "bg-blue-400/10" },
    { name: "Total Visitors", value: totalVisitors.toString(), icon: Users, color: "text-indigo-400", bg: "bg-indigo-400/10" },
    { name: "Pending Expiry", value: pendingExpiry.toString(), icon: Clock, color: "text-lime-600", bg: "bg-amber-400/10" },
  ];

  useEffect(() => {
    if (mapContainer.current && !map.current && typeof window !== "undefined") {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [mapCenter.lng, mapCenter.lat], 
        zoom: 14,
      });

      // Add a marker for the user's home
      new mapboxgl.Marker({ color: "#3b82f6" })
        .setLngLat([mapCenter.lng, mapCenter.lat])
        .addTo(map.current);

      map.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapCenter]);

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
        <p className="text-slate-500 text-sm mt-1">Here&apos;s an overview of your estate activity today.</p>
      </motion.div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass-panel p-6 rounded-lg border border-slate-200 hover:border-slate-300/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium">{stat.name}</p>
                  <p className="text-3xl font-bold font-outfit text-slate-900 mt-2">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Generate Code Quick Action */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 relative overflow-hidden rounded-xl bg-gradient-to-br from-lime-500 to-indigo-700 p-8 shadow-2xl"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <QrCode className="w-48 h-48" />
          </div>
          
          <div className="relative z-10">
            <span className="px-3 py-1 bg-white/20 text-slate-900 text-xs font-semibold uppercase tracking-wider rounded-full backdrop-blur-md">
              Quick Action
            </span>
            <h3 className="text-3xl font-bold font-outfit text-slate-900 mt-6 mb-2">
              Expect a Visitor?
            </h3>
            <p className="text-blue-100 max-w-md mb-8">
              Generate a secure, time-limited access code for your guest to present at the estate gate.
            </p>
            
            <Link href="/resident/generate">
              <button className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center">
                Generate New Code
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-panel p-6 rounded-xl border border-slate-200"
        >
          <h3 className="text-lg font-semibold font-outfit text-slate-900 mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {history.slice(0, 3).map((log, i) => (
              <div key={log.id} className="flex items-start">
                <div className={`w-2 h-2 mt-2 rounded-full mr-4 shadow-[0_0_8px_rgba(59,130,246,0.8)] ${log.status === 'USED' ? 'bg-lime-500' : 'bg-blue-500'}`}></div>
                <div>
                  <p className="text-slate-900 text-sm font-medium">{log.guestName || "Unknown"} <span className="text-slate-500 font-normal">{log.status === 'USED' ? 'arrived' : 'code generated'}</span></p>
                  <p className="text-xs text-slate-9000 mt-1">{new Date(log.creationTime).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <p className="text-sm text-slate-500">No recent activity.</p>
            )}
          </div>
          
          <button className="w-full mt-8 py-2 text-sm text-lime-600 hover:text-blue-300 transition-colors font-medium">
            <Link href="/resident/history">View All History</Link>
          </button>
        </motion.div>
      </div>

      {/* Estate Map Box */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-panel p-6 rounded-xl border border-slate-200"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold font-outfit text-slate-900 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-lime-600" /> My Home Location
          </h3>
          <Link href="/resident/profile">
            <button className="text-sm text-lime-600 hover:text-blue-300 transition-colors font-medium">
              Update Location
            </button>
          </Link>
        </div>
        
        <div className="w-full h-80 rounded-lg overflow-hidden border border-slate-200 relative">
          <div ref={mapContainer} className="w-full h-full" />
          <div className="absolute top-4 left-4 bg-white backdrop-blur border border-slate-200 px-3 py-2 rounded-lg pointer-events-none">
            <p className="text-xs text-slate-600 font-medium">{address}</p>
          </div>
        </div>
      </motion.div>

    </div>
  );
}
