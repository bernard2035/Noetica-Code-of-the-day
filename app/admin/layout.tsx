"use client";

import { useSession, signOut } from "next-auth/react";
import NotificationTray from "@/components/NotificationTray";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  Users, 
  Shield, 
  Camera, 
  Settings, 
  LogOut,
  Bell,
  Activity
} from "lucide-react";
import { useEffect, useState, useRef } from "react";

const navItems = [
  { name: "Overview", href: "/admin", icon: Activity },
  { name: "Residents", href: "/admin/residents", icon: Users },
  { name: "Security Personnel", href: "/admin/security", icon: Shield },
  { name: "CCTV Feeds", href: "/admin/cctv", icon: Camera },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white shadow-sm backdrop-blur-xl hidden md:flex flex-col z-10">
        <div className="p-6 border-b border-slate-200">
          <img src="/noetica_icon_transparent.png" alt="Noetica Logo" className="h-8 mb-2 object-contain" />
          <h2 className="text-xl font-outfit font-bold text-slate-900 tracking-tight">
            Admin
          </h2>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">
            Estate Management
          </p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center px-4 py-3 rounded-xl transition-colors ${
                    isActive 
                      ? "bg-slate-100 text-slate-900 border border-slate-200 font-semibold shadow-sm" 
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? "text-slate-900" : ""}`} strokeWidth={1.5} />
                  <span className="font-medium">{item.name}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={() => signOut()}
            className="flex w-full items-center px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" strokeWidth={1.5} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div 
          className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: "url('/security-bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        />
        
        {/* Topbar */}
        <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 z-50">
          <h1 className="text-xl font-semibold font-outfit text-slate-900">
            {navItems.find(item => item.href === pathname)?.name || "Overview"}
          </h1>
          
          <div className="flex items-center space-x-6">
            <NotificationTray />

            <div className="flex items-center pl-6 border-l border-slate-200 cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-lime-400 to-lime-500 flex items-center justify-center text-slate-900 font-bold text-sm shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                {session?.user?.name?.charAt(0) || "A"}
              </div>
              <div className="ml-3 hidden sm:block">
                <p className="text-sm font-medium text-slate-900">{session?.user?.name || "System Admin"}</p>
                <p className="text-xs text-lime-600">Master Access</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 z-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-7xl mx-auto h-full"
          >
            {children}
          </motion.div>
        </div>
        
        {/* Thick Green Bottom Bar */}
        <div className="w-full bg-gradient-to-r from-lime-600 via-lime-700 to-lime-800 flex-shrink-0 z-50 shadow-[0_-4px_20px_rgba(77,124,15,0.4)] flex items-center justify-center py-3">
          <p className="text-lime-50 text-xs font-medium tracking-wide">
            &copy; {new Date().getFullYear()} Noetica Estate. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
}
