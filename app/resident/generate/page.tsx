"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, User, Clock, QrCode, ArrowRight, Share2, Copy, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { generateAccessCode } from "@/app/actions/resident";

export default function GenerateCodePage() {
  const [visitorName, setVisitorName] = useState("");
  const [hasVehicle, setHasVehicle] = useState(false);
  const [plateNumber, setPlateNumber] = useState("");
  const [vehicleBrand, setVehicleBrand] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [expiresIn, setExpiresIn] = useState("2");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    try {
      const guestVehicleInfo = hasVehicle 
        ? `${vehicleBrand} ${vehicleModel} - ${vehicleColor} - ${plateNumber}` 
        : undefined;
        
      const res = await generateAccessCode({
        guestName: visitorName,
        guestVehicleInfo,
        expiresInHours: Number(expiresIn)
      });
      
      setGeneratedCode(res.code);
    } catch (err) {
      console.error("Failed to generate code", err);
      alert("Failed to generate access code. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const getShareMessage = () => {
    const ticketUrl = `${window.location.origin}/visitor/${generatedCode}`;
    return `Hello ${visitorName || "there"}!\n\nHere is your access code for Noetica Estate:\nCode: ${generatedCode}\n\nClick the link below to view your digital pass at the gate:\n${ticketUrl}`;
  };

  const handleCopy = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(getShareMessage());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (generatedCode) {
      if (navigator.share) {
        try {
          await navigator.share({
            title: "Estate Access Code",
            text: getShareMessage(),
          });
        } catch (err) {
          console.error("Error sharing", err);
        }
      } else {
        handleCopy();
        alert("Native sharing is not supported on your current browser/device. The full message has been copied to your clipboard instead!");
      }
    }
  };

  if (generatedCode) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-panel p-10 rounded-xl max-w-md w-full text-center border border-green-500/30 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500"></div>
          
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-400" />
          </div>
          
          <h2 className="text-2xl font-bold font-outfit text-slate-900 mb-2">Code Generated!</h2>
          <p className="text-slate-500 text-sm mb-6">
            Share this code with {visitorName || "your visitor"}. It expires in {expiresIn} hours.
          </p>
          
          <div className="bg-white rounded-lg p-6 mb-8 border border-slate-200 relative group flex flex-col items-center">
            <div className="bg-white p-3 rounded-xl mb-4 shadow-[0_0_20px_rgba(74,222,128,0.2)]">
              <QRCodeSVG 
                value={generatedCode} 
                size={140} 
                fgColor="#000000" 
                bgColor="#ffffff" 
              />
            </div>
            <p className="text-5xl font-mono font-bold tracking-[0.2em] text-slate-900">
              {generatedCode}
            </p>
          </div>
          
          <div className="flex space-x-4">
            <button 
              onClick={handleCopy}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-900 font-medium transition-colors flex items-center justify-center"
            >
              {copied ? <Check className="w-5 h-5 mr-2 text-green-400" /> : <Copy className="w-5 h-5 mr-2" />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button 
              onClick={handleShare}
              className="flex-1 py-3 px-4 bg-lime-600 hover:bg-lime-500 rounded-xl text-slate-900 font-medium shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center"
            >
              <Share2 className="w-5 h-5 mr-2" /> Share
            </button>
          </div>
          
          <button 
            onClick={() => {
              setGeneratedCode(null);
              setVisitorName("");
              setHasVehicle(false);
            }}
            className="mt-6 text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            Generate Another Code
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold font-outfit text-slate-900">Generate Access Code</h2>
        <p className="text-slate-500 mt-2">Create a temporary gate pass for your visitor.</p>
      </div>

      <motion.form 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleGenerate} 
        className="space-y-6"
      >
        <div className="glass-panel p-6 rounded-xl border border-slate-200">
          <div className="space-y-6">
            
            {/* Visitor Name */}
            <div>
              <label className="flex items-center text-sm font-medium text-slate-600 mb-2">
                <User className="w-4 h-4 mr-2 text-lime-600" /> Visitor Name
              </label>
              <input
                type="text"
                required
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-4 py-3 bg-white shadow-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 text-slate-900 placeholder-slate-500 outline-none transition-all"
              />
            </div>

            {/* Expiration */}
            <div>
              <label className="flex items-center text-sm font-medium text-slate-600 mb-2">
                <Clock className="w-4 h-4 mr-2 text-lime-600" /> Valid For (Hours)
              </label>
              <select
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value)}
                className="w-full px-4 py-3 bg-white shadow-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 text-slate-900 outline-none transition-all appearance-none"
              >
                <option value="1">1 Hour</option>
                <option value="2">2 Hours (Default)</option>
                <option value="4">4 Hours</option>
                <option value="12">12 Hours</option>
                <option value="24">24 Hours</option>
              </select>
            </div>
          </div>
        </div>

        {/* Vehicle Details Toggle */}
        <div className="glass-panel p-6 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-slate-900 font-medium flex items-center">
                <Car className="w-5 h-5 mr-2 text-indigo-400" /> Vehicle Registration
              </h3>
              <p className="text-sm text-slate-500 mt-1">Is the visitor driving in?</p>
            </div>
            <button
              type="button"
              onClick={() => setHasVehicle(!hasVehicle)}
              className={`w-14 h-7 rounded-full transition-colors relative ${hasVehicle ? 'bg-lime-600' : 'bg-slate-200'}`}
            >
              <motion.div 
                animate={{ x: hasVehicle ? 28 : 2 }} 
                className="w-6 h-6 bg-white rounded-full mt-0.5 shadow-md"
              />
            </button>
          </div>

          <AnimatePresence>
            {hasVehicle && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: "auto", opacity: 1, marginTop: 24 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                className="overflow-hidden space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 ml-1 mb-1 block">Plate Number</label>
                    <input
                      type="text"
                      value={plateNumber}
                      onChange={(e) => setPlateNumber(e.target.value)}
                      placeholder="ABC-123-XY"
                      className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200 rounded-xl text-slate-900 text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 ml-1 mb-1 block">Brand</label>
                    <input
                      type="text"
                      value={vehicleBrand}
                      onChange={(e) => setVehicleBrand(e.target.value)}
                      placeholder="e.g. Toyota"
                      className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200 rounded-xl text-slate-900 text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 ml-1 mb-1 block">Model</label>
                    <input
                      type="text"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      placeholder="e.g. Camry"
                      className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200 rounded-xl text-slate-900 text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 ml-1 mb-1 block">Color</label>
                    <input
                      type="text"
                      value={vehicleColor}
                      onChange={(e) => setVehicleColor(e.target.value)}
                      placeholder="e.g. Black"
                      className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200 rounded-xl text-slate-900 text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          type="submit"
          disabled={isGenerating || !visitorName}
          className="w-full py-4 bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-400 hover:to-lime-500 rounded-lg text-slate-900 font-bold text-lg shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <div className="flex items-center">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
              Generating...
            </div>
          ) : (
            <>
              Generate Access Code <QrCode className="ml-2 w-5 h-5" />
            </>
          )}
        </button>
      </motion.form>
    </div>
  );
}
