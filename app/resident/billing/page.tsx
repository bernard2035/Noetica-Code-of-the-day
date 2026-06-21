"use client";

import { useState } from "react";
import { usePaystackPayment } from "react-paystack";
import { motion } from "framer-motion";
import { CreditCard, Shield, CheckCircle2, AlertCircle, Lock } from "lucide-react";
import { useSession } from "next-auth/react";

export default function BillingPage() {
  const { data: session } = useSession();
  const [amount, setAmount] = useState(50000); // 50,000 NGN default
  const [email, setEmail] = useState("");

  const config = {
    reference: (new Date()).getTime().toString(),
    email: email || session?.user?.email || "resident@noetica.com",
    amount: amount * 100, // Paystack uses kobo
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY as string,
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = (reference: any) => {
    // Pass the reference to the callback API to verify and update DB
    window.location.href = `/api/paystack/callback?reference=${reference.reference}`;
  };

  const onClose = () => {
    alert("Payment cancelled.");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold font-outfit text-slate-900">Billing & Security Fee</h2>
          <p className="text-slate-500 mt-2">Manage your estate security and maintenance payments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 glass-panel p-8 rounded-xl border border-slate-200 relative overflow-hidden"
        >
          {/* Decorative background */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center mb-6 relative z-10">
            <div className="w-12 h-12 bg-lime-500/10 rounded-xl flex items-center justify-center mr-4 border border-lime-500/20">
              <Shield className="w-6 h-6 text-lime-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Current Outstanding</h3>
              <p className="text-slate-500 text-sm">Monthly Security Fee</p>
            </div>
          </div>

          <div className="text-5xl font-bold font-outfit text-slate-900 tracking-tight mb-8 relative z-10">
            ₦{amount.toLocaleString()}
          </div>

          <div className="space-y-4 mb-8 relative z-10">
            <div>
              <label className="text-sm font-medium text-slate-600 mb-2 block">Email for Receipt</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={session?.user?.email || "Enter your email"}
                className="w-full px-4 py-3 bg-white shadow-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/50 text-slate-900 outline-none transition-all"
              />
            </div>
          </div>

          <button
            onClick={() => {
              initializePayment({ onSuccess, onClose });
            }}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 rounded-xl text-slate-900 font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center relative z-10"
          >
            <CreditCard className="w-5 h-5 mr-2" /> Pay Now Securely
          </button>
          
          <p className="text-center text-xs text-slate-9000 mt-4 flex items-center justify-center relative z-10">
            <Lock className="w-3 h-3 mr-1" /> Secured by Paystack
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="glass-panel p-6 rounded-xl border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Payment History</h3>
            <div className="space-y-4">
              {[1, 2].map((_, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-slate-100 rounded-xl border border-slate-200">
                  <div className="flex items-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mr-3" />
                    <div>
                      <p className="text-sm text-slate-900 font-medium">Security Fee</p>
                      <p className="text-xs text-slate-500">Oct 12, 2026</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">₦50,000</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-lime-500/10 border border-lime-500/20 rounded-xl p-6 relative overflow-hidden">
            <AlertCircle className="absolute -right-4 -bottom-4 w-24 h-24 text-lime-600/10" />
            <h4 className="text-lime-600 font-semibold mb-2 relative z-10">Important Notice</h4>
            <p className="text-slate-700 text-sm relative z-10">
              Failure to pay the security fee before the 5th of every month will result in restricted access for generating visitor codes.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
