"use client";

import { motion } from "framer-motion";
import { CheckCircle, MapPin, Clock, XCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { getVisitorPass } from "@/app/actions/visitor";

export default function VisitorPassPage() {
  const params = useParams();
  const code = params.code as string;
  const [passData, setPassData] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPass() {
      try {
        const res = await getVisitorPass(code);
        if (res.success && res.data) {
          setPassData(res.data);
          
          if (res.data.status !== "ACTIVE") {
            setIsExpired(true);
            setTimeLeft(0);
          } else {
            const expTime = new Date(res.data.expirationTime).getTime();
            const now = new Date().getTime();
            const diffSeconds = Math.floor((expTime - now) / 1000);
            
            if (diffSeconds <= 0) {
              setIsExpired(true);
              setTimeLeft(0);
            } else {
              setTimeLeft(diffSeconds);
            }
          }
        } else {
          setError(res.message || "Invalid pass.");
        }
      } catch (err) {
        setError("Failed to load pass details.");
      } finally {
        setIsLoading(false);
      }
    }
    loadPass();
  }, [code]);

  useEffect(() => {
    if (timeLeft <= 0 && passData?.status === "ACTIVE") {
      setIsExpired(true);
      return;
    }
    
    if (timeLeft > 0 && !isExpired && passData) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, isExpired, passData]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-outfit">Loading Pass...</div>;
  }

  if (error || !passData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 text-center">
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-500 mb-6">{error || "This pass could not be found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-900">
      <div 
        className="absolute inset-0 z-0 opacity-30"
        style={{
          backgroundImage: "url('/security-guard-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center top"
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-900/90 z-0 pointer-events-none" />

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm relative z-10"
      >
        {isExpired ? (
          <div className="bg-white rounded-md shadow-2xl overflow-hidden relative">
            {/* Header - Dark Professional */}
            <div className="bg-slate-900 p-6 flex items-center justify-between">
              <div>
                <img src="/noetica_icon_transparent.png" alt="Noetica Logo" className="h-8 object-contain mb-1" />
                <p className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold">Estate Access Pass</p>
              </div>
              <div className="flex items-center space-x-2 bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                <span className="text-red-400 text-xs font-bold tracking-widest">EXPIRED</span>
              </div>
            </div>
            {/* Expired body */}
            <div className="flex justify-center pt-6 pb-2">
              <div className="w-14 h-14 bg-red-50 border-2 border-red-200 rounded-full flex items-center justify-center">
                <XCircle className="w-7 h-7 text-red-500" strokeWidth={1.5} />
              </div>
            </div>
            <div className="p-8 text-center pb-12">
               <p className="text-slate-600 font-medium mb-6">
                 This access code has expired. Please request a new code from the resident to regain access.
               </p>
               <button onClick={() => window.location.reload()} className="px-6 py-3 bg-red-50 text-red-600 font-semibold rounded-lg border border-red-200 w-full hover:bg-red-100 transition-colors">
                 Refresh Status
               </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-md shadow-2xl overflow-hidden relative">
            {/* Header - Dark Professional */}
            <div className="bg-slate-900 p-6 flex items-center justify-between">
              <div>
                <img src="/noetica_icon_transparent.png" alt="Noetica Logo" className="h-8 object-contain mb-1" />
                <p className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold">Estate Access Pass</p>
              </div>
              <div className="flex items-center space-x-2 bg-lime-500/10 border border-lime-500/30 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
                <span className="text-lime-400 text-xs font-bold tracking-widest">VALID</span>
              </div>
            </div>

            {/* Checkmark */}
            <div className="flex justify-center pt-6 pb-2">
              <div className="w-14 h-14 bg-lime-50 border-2 border-lime-200 rounded-full flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-lime-600" strokeWidth={1.5} />
              </div>
            </div>
            <p className="text-center text-slate-500 text-xs font-medium uppercase tracking-widest pb-2">Valid Pass</p>

            {/* Ticket Perforation / Divider */}
            <div className="relative h-8 bg-white flex items-center justify-center overflow-hidden">
              <div className="absolute -left-4 w-8 h-8 bg-slate-900 rounded-full shadow-inner z-20"></div>
              <div className="w-full border-t-2 border-dashed border-slate-200 mx-6"></div>
              <div className="absolute -right-4 w-8 h-8 bg-slate-900 rounded-full shadow-inner z-20"></div>
            </div>

            {/* Body */}
            <div className="p-8 pt-2 pb-10">
              <div className="text-center mb-6">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Access Code</p>
                <div className="text-5xl font-mono font-bold tracking-widest text-slate-900 py-4 bg-slate-50 rounded-md shadow-inner">
                  {code?.toUpperCase() || "ERROR"}
                </div>
              </div>

              {/* Barcode / QR */}
              <div className="flex justify-center mb-8 p-4 rounded-md bg-slate-50">
                 <QRCodeSVG value={code || "ERROR"} size={120} level="H" fgColor="#0f172a" />
              </div>

              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-md bg-slate-50 flex items-center justify-center mr-4 border border-slate-200">
                    <MapPin className="w-5 h-5 text-slate-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Destination</p>
                    <p className="text-slate-900 font-medium text-sm">{passData.destination}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-md bg-slate-50 flex items-center justify-center mr-4 border border-slate-200">
                    <Clock className="w-5 h-5 text-slate-600" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Expires In</p>
                      <p className="text-slate-900 font-medium text-sm">
                        {hours > 0 ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}` : `${minutes}:${seconds.toString().padStart(2, '0')}`}
                      </p>
                    </div>
                    <span className="animate-pulse w-2 h-2 rounded-full bg-red-500"></span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer Ribbon */}
            <div className="h-2 w-full bg-slate-900"></div>
          </div>
        )}

        <p className="text-center text-white/50 text-xs mt-6 px-8 font-medium">
          Please present this digital pass to the security personnel at the main gate for verification.
        </p>
      </motion.div>
    </div>
  );
}
