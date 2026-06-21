"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Check, Filter, Trash2 } from "lucide-react";
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  deleteNotification, 
  clearAllNotifications 
} from "@/app/actions/notifications";

export default function NotificationTray() {
  const [show, setShow] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filter, setFilter] = useState("ALL");
  const trayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const data = await getUserNotifications();
        setNotifications(data);
      } catch (e) {
        console.error(e);
      }
    }
    fetchNotifications();

    // Setup an interval to poll notifications every 30s
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close tray when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (trayRef.current && !trayRef.current.contains(event.target as Node)) {
        setShow(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === "ALL") return true;
    return n.category === filter;
  });

  const handleMarkRead = async (id: string) => {
    // optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    await markNotificationAsRead(id);
  };

  const handleDelete = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    await deleteNotification(id);
  };

  const handleClearAll = async () => {
    setNotifications([]);
    await clearAllNotifications();
  };

  const categories = ["ALL", "SYSTEM", "SECURITY", "BILLING"];

  return (
    <div className="relative" ref={trayRef}>
      <button 
        onClick={() => setShow(!show)}
        className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>
        )}
      </button>

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/80 backdrop-blur-xl flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-xs text-red-600 bg-red-500/10 px-2 py-1 rounded-full font-semibold">
                    {unreadCount} New
                  </span>
                )}
              </div>
              
              {/* Filters */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {categories.map(c => (
                  <button 
                    key={c}
                    onClick={() => setFilter(c)}
                    className={`text-[10px] px-2 py-1 rounded-full whitespace-nowrap transition-colors ${
                      filter === c ? "bg-slate-800 text-white" : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                    <Bell className="w-5 h-5 text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-500">No notifications found.</p>
                </div>
              ) : (
                filteredNotifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`p-4 border-b border-slate-100 group transition-colors relative ${!n.isRead ? "bg-blue-50/30" : "hover:bg-slate-50"}`}
                  >
                    {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
                    <div className="flex justify-between items-start gap-4">
                      <div 
                        className="flex-1 cursor-pointer" 
                        onClick={() => !n.isRead && handleMarkRead(n.id)}
                      >
                        <p className={`text-sm font-medium ${!n.isRead ? "text-slate-900" : "text-slate-600"}`}>
                          {n.title}
                        </p>
                        <p className={`text-xs mt-1 leading-relaxed ${!n.isRead ? "text-slate-600" : "text-slate-500"}`}>
                          {n.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{n.category}</span>
                          <span className="text-[10px] text-slate-400">•</span>
                          <span className="text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!n.isRead && (
                          <button onClick={() => handleMarkRead(n.id)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors" title="Mark as read">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(n.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Clear notification">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-slate-100 text-center bg-slate-50 flex justify-between items-center">
                <button 
                  onClick={() => setShow(false)}
                  className="text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors"
                >
                  Close Tray
                </button>
                <button 
                  onClick={handleClearAll}
                  className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors flex items-center"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear All
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
