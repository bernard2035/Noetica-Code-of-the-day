"use client";

import { motion } from "framer-motion";
import { Camera, Maximize2, Video } from "lucide-react";

export default function AdminCCTVPage() {
  const cameras = [
    { id: 1, name: "Main Gate - Incoming", status: "OFFLINE" },
    { id: 2, name: "Main Gate - Outgoing", status: "OFFLINE" },
    { id: 3, name: "Pedestrian Walkway", status: "OFFLINE" },
    { id: 4, name: "Perimeter Fence North", status: "OFFLINE" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-outfit text-slate-900">Live CCTV Feeds</h1>
          <p className="text-slate-500 mt-1 text-sm">Monitor estate security cameras in real-time.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cameras.map((cam, i) => (
          <motion.div 
            key={cam.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel rounded-lg border border-slate-200 overflow-hidden flex flex-col group"
          >
            <div className="h-64 bg-white relative flex items-center justify-center">
              {cam.status === "LIVE" ? (
                <>
                  <div className="absolute top-4 left-4 flex items-center px-2 py-1 rounded bg-black/50 backdrop-blur text-xs font-mono text-slate-900">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2" /> REC
                  </div>
                  <Video className="w-12 h-12 text-slate-700" />
                </>
              ) : (
                <div className="text-slate-600 flex flex-col items-center">
                  <Camera className="w-12 h-12 mb-2 opacity-50" />
                  <span className="text-sm font-medium">CAMERA OFFLINE</span>
                </div>
              )}
              
              <button className="absolute bottom-4 right-4 p-2 bg-black/50 backdrop-blur text-slate-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-white shadow-sm">
              <span className="font-medium text-slate-600">{cam.name}</span>
              <span className={`text-xs font-bold px-2 py-1 rounded ${cam.status === 'LIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-100 text-slate-9000'}`}>
                {cam.status}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
