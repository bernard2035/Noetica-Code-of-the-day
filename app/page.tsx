"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  const portals = [
    {
      name: "Resident Portal",
      description: "Manage your guests, generate access codes, and view billing.",
      href: "/resident",
      imgSrc: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
      borderColor: "border-emerald-200/50",
      hoverBorder: "hover:border-emerald-400/50",
      shadow: "shadow-xl shadow-emerald-900/5",
      hoverShadow: "hover:shadow-2xl hover:shadow-emerald-900/10"
    },
    {
      name: "Security Portal",
      description: "Verify visitor passes and monitor live gate logs.",
      href: "/security",
      imgSrc: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80",
      borderColor: "border-blue-200/50",
      hoverBorder: "hover:border-blue-400/50",
      shadow: "shadow-xl shadow-blue-900/5",
      hoverShadow: "hover:shadow-2xl hover:shadow-blue-900/10"
    },
    {
      name: "Admin Portal",
      description: "Manage estate configuration, CCTV, and personnel.",
      href: "/admin",
      imgSrc: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
      borderColor: "border-purple-200/50",
      hoverBorder: "hover:border-purple-400/50",
      shadow: "shadow-xl shadow-purple-900/5",
      hoverShadow: "hover:shadow-2xl hover:shadow-purple-900/10"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-slate-50 px-4 py-12">
      {/* Background Decor */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/premium_landing_bg_white.png')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      />
      <div className="absolute inset-0 bg-white/40 z-0 pointer-events-none backdrop-blur-[2px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16 relative z-10 w-full max-w-4xl mx-auto"
      >
        <div className="flex justify-center mb-8">
          <img src="/noetica_icon_transparent.png" alt="Noetica Logo" className="h-16 object-contain" />
        </div>
        
        <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-white/60 border border-slate-200 mb-8 backdrop-blur-md shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
          <span className="text-xs text-slate-700 font-semibold tracking-widest uppercase">Secure Estate Network</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold font-outfit text-slate-900 tracking-tight mb-6">
          Welcome to Noetica
        </h1>
        
        <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          The next generation of luxury estate management. Please select your designated portal below to access your secure workspace, manage visitors, or monitor estate operations.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full relative z-10">
        {portals.map((portal, index) => {
          return (
            <Link key={portal.name} href={portal.href} className="group">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`bg-white/80 backdrop-blur-xl p-6 rounded-3xl border ${portal.borderColor} ${portal.hoverBorder} transition-all duration-300 cursor-pointer h-full flex flex-col ${portal.shadow} ${portal.hoverShadow}`}
              >
                <div className="w-full h-40 mb-6 overflow-hidden rounded-2xl group-hover:scale-[1.02] transition-transform duration-300 shadow-md border border-slate-200/50">
                  <img src={portal.imgSrc} alt={`${portal.name} Cover`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                
                <h2 className="text-2xl font-bold text-slate-900 mb-2 font-outfit tracking-tight">{portal.name}</h2>
                <p className="text-slate-600 text-sm flex-1 leading-relaxed">{portal.description}</p>
                
                <div className="mt-6 flex items-center font-semibold text-sm text-slate-500 group-hover:text-slate-900 transition-colors">
                  Access Portal <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
