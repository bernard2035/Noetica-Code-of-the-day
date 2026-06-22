"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CheckCircle, XCircle, User, Car, Clock, ShieldAlert, ScanLine, Loader2 } from "lucide-react";
import { Scanner } from '@yudiel/react-qr-scanner';
import { useSession } from "next-auth/react";
import EstateMapContainer from "@/components/EstateMapContainer";
import { validateAccessCode, markCodeAsUsed, getLiveGateActivity } from "@/app/actions/security";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function SecurityDashboard() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] || "Officer";
  const [codeInput, setCodeInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [verifyResult, setVerifyResult] = useState<null | 'valid' | 'invalid'>(null);
  
  // Data for valid codes
  const [accessData, setAccessData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");
  
  // New vehicle info (if added by security)
  const [securityVehicleInfo, setSecurityVehicleInfo] = useState("");
  const [isLogging, setIsLogging] = useState(false);
  
  const [liveActivity, setLiveActivity] = useState<any[]>([]);

  useEffect(() => {
    async function fetchActivity() {
      try {
        const activity = await getLiveGateActivity();
        setLiveActivity(activity);
      } catch (err) {
        console.error("Failed to load gate activity", err);
      }
    }
    fetchActivity();
    // Poll every 10 seconds for new activity
    const interval = setInterval(fetchActivity, 10000);
    return () => clearInterval(interval);
  }, []);

  const performVerification = async (code: string) => {
    if (!code) return;
    setIsSearching(true);
    setVerifyResult(null);
    setAccessData(null);
    setErrorMessage("");
    setSecurityVehicleInfo("");

    try {
      const res = await validateAccessCode(code);
      if (res.success && res.data) {
        setAccessData(res.data);
        setVerifyResult('valid');
      } else {
        setErrorMessage(res.message || "Invalid or expired code");
        setVerifyResult('invalid');
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred");
      setVerifyResult('invalid');
    } finally {
      setIsSearching(false);
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    performVerification(codeInput);
  };

  const handleLogEntry = async () => {
    if (!accessData) return;
    setIsLogging(true);
    
    try {
      const res = await markCodeAsUsed(accessData.id, securityVehicleInfo || undefined);
      if (res.success) {
        // Reset state after successful log
        setVerifyResult(null);
        setCodeInput("");
        setAccessData(null);
        setSecurityVehicleInfo("");
      } else {
        alert("Failed to log entry: " + (res as any).message);
      }
    } catch (err: any) {
      alert("Error logging entry: " + err.message);
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      
      {/* Code Verification Column */}
      <div className="space-y-6 flex flex-col">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">{getGreeting()},</p>
          <h2 className="text-3xl font-bold font-outfit text-slate-900 tracking-tight">{firstName} 👋</h2>
          <p className="text-slate-500 text-sm mt-1">Verify visitor passes at the gate below.</p>
        </motion.div>
        
        <form onSubmit={handleVerify} className="glass-panel p-8 rounded-xl border border-slate-200 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-lime-500/10 rounded-full blur-2xl"></div>
          
          <div className="flex justify-between items-center mb-3 relative z-10">
            <label className="text-sm font-medium text-slate-600">Enter 6-Digit Access Code</label>
            <button 
              type="button"
              onClick={() => setIsScanning(!isScanning)}
              className="text-xs flex items-center bg-lime-500/20 text-lime-600 px-3 py-1.5 rounded-lg hover:bg-lime-500/30 transition-colors"
            >
              <ScanLine className="w-4 h-4 mr-1.5" />
              {isScanning ? "Close Scanner" : "Scan QR"}
            </button>
          </div>

          <AnimatePresence>
            {isScanning && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-6 rounded-xl border border-amber-500/30"
              >
                <Scanner 
                  onScan={(result) => {
                    if (result && result.length > 0) {
                      const code = result[0].rawValue;
                      setCodeInput(code);
                      setIsScanning(false);
                      performVerification(code);
                    }
                  }} 
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex space-x-4 relative z-10">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-9000" />
              <input
                type="text"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. 8A2F9B"
                maxLength={6}
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-300 rounded-lg text-slate-900 text-2xl font-mono tracking-widest outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all uppercase placeholder:text-slate-600"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || codeInput.length < 5}
              className="px-8 bg-lime-500 hover:bg-amber-400 text-slate-900 font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Verify'}
            </button>
          </div>
        </form>

        {/* Verification Result */}
        <AnimatePresence mode="wait">
          {verifyResult === 'valid' && accessData && (
            <motion.div
              key="valid"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 glass-panel p-8 rounded-xl border border-green-500/50 bg-green-500/5 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500"></div>
              
              <div className="flex items-center mb-8">
                <CheckCircle className="w-12 h-12 text-green-400 mr-4" />
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Access Granted</h3>
                  <p className="text-green-400 font-medium">Valid Entry Code</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white shadow-sm p-4 rounded-xl">
                    <p className="text-xs text-slate-500 uppercase mb-1">Visitor Name</p>
                    <p className="font-semibold text-slate-900 flex items-center"><User className="w-4 h-4 mr-2 text-slate-500"/> {accessData.visitorName}</p>
                  </div>
                  <div className="bg-white shadow-sm p-4 rounded-xl">
                    <p className="text-xs text-slate-500 uppercase mb-1">Resident Host</p>
                    <p className="font-semibold text-slate-900">{accessData.resident?.user?.name} ({accessData.resident?.address})</p>
                  </div>
                </div>

                {accessData.vehicleInfo ? (
                  <div className="bg-white shadow-sm p-4 rounded-xl border border-slate-200">
                    <p className="text-xs text-slate-500 uppercase mb-2">Pre-registered Vehicle</p>
                    <div className="flex items-center text-slate-900">
                      <Car className="w-5 h-5 mr-3 text-slate-500" />
                      <span className="font-mono bg-slate-100 px-2 py-1 rounded text-lime-600 mr-3">{accessData.vehicleInfo}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white shadow-sm p-4 rounded-xl border border-amber-200 bg-amber-50">
                    <p className="text-xs text-amber-700 uppercase mb-2 font-medium">Log Vehicle Information (Optional)</p>
                    <div className="relative">
                      <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={securityVehicleInfo}
                        onChange={(e) => setSecurityVehicleInfo(e.target.value)}
                        placeholder="Enter vehicle plate number or details..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900 text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={handleLogEntry}
                disabled={isLogging}
                className="w-full mt-8 py-4 bg-green-500 hover:bg-green-400 text-slate-900 font-bold rounded-xl transition-colors disabled:opacity-70 flex justify-center items-center"
              >
                {isLogging ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                Log Entry & Clear
              </button>
            </motion.div>
          )}

          {verifyResult === 'invalid' && (
            <motion.div
              key="invalid"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel p-8 rounded-xl border border-red-500/50 bg-red-500/5 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-rose-600"></div>
              <div className="flex flex-col items-center text-center">
                <XCircle className="w-16 h-16 text-red-500 mb-4" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h3>
                <p className="text-red-400 mb-6">{errorMessage || "This code is invalid or has expired."}</p>
                <button 
                  onClick={() => {
                    setVerifyResult(null);
                    setCodeInput("");
                  }}
                  className="px-6 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Try Another Code
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Live Log Column */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-outfit text-slate-900 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-slate-500" /> Live Gate Activity
          </h2>
          <span className="flex items-center text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
            LIVE
          </span>
        </div>

        <div className="glass-panel rounded-xl border border-slate-200 overflow-hidden h-[calc(100vh-200px)] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {liveActivity.length > 0 ? (
              liveActivity.map((log: any) => (
                <div key={log.id} className="bg-white shadow-sm border border-slate-200 p-4 rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-2 h-10 rounded-full mr-4 ${log.status === 'EXPIRED' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                    <div>
                      <p className="text-slate-900 font-medium text-sm">
                        {log.status === 'EXPIRED' ? 'Expired Entry Attempt' : `Entry: Visitor for ${log.resident?.user?.name || "Unknown"} (${log.resident?.address || "Unknown"})`}
                      </p>
                      <p className="text-slate-500 text-xs mt-1 font-mono">
                        Code: ••••{log.code.slice(-2)} | {new Date(log.creationTime).toLocaleString()} | {log.guestName || "Unknown"}
                      </p>
                    </div>
                  </div>
                  {log.status === 'EXPIRED' && <ShieldAlert className="w-5 h-5 text-amber-500" />}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 p-4 text-center">No recent gate activity.</p>
            )}
          </div>
        </div>

        {/* Map Box */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <EstateMapContainer />
        </motion.div>
      </div>
    </div>
  );
}
