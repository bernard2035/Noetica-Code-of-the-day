"use client";

import { useState, useEffect } from "react";
import { usePaystackPayment } from "react-paystack";
import { motion } from "framer-motion";
import { CreditCard, Shield, CheckCircle2, AlertCircle, Lock, Loader2, XCircle, Clock } from "lucide-react";
import { useSession } from "next-auth/react";
import { getPaymentHistory } from "@/app/actions/resident";

export default function BillingPage() {
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [feeStatus, setFeeStatus] = useState("PENDING");
  const [amount, setAmount] = useState(50000);

  useEffect(() => {
    async function loadBillingData() {
      try {
        const data = await getPaymentHistory();
        setPayments(data.payments);
        setFeeStatus(data.feeStatus);
        setAmount(data.defaultFee);
      } catch (err) {
        console.error("Failed to load billing data", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadBillingData();
  }, []);

  const config = {
    reference: new Date().getTime().toString(),
    email: email || session?.user?.email || "resident@noetica.com",
    amount: amount * 100, // Paystack uses kobo
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY as string,
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = (reference: any) => {
    window.location.href = `/api/paystack/callback?reference=${reference.reference}`;
  };

  const onClose = () => {
    alert("Payment cancelled.");
  };

  const statusIcon = feeStatus === "PAID"
    ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
    : <Clock className="w-5 h-5 text-amber-500" />;

  const statusLabel = feeStatus === "PAID"
    ? <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">PAID</span>
    : <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">PENDING</span>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold font-outfit text-slate-900">Billing &amp; Security Fee</h2>
          <p className="text-slate-500 mt-2">Manage your estate security and maintenance payments.</p>
        </div>
        <div className="flex items-center space-x-2">
          {statusIcon}
          {statusLabel}
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

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <>
              <div className="text-5xl font-bold font-outfit text-slate-900 tracking-tight mb-8 relative z-10">
                ₦{amount.toLocaleString()}
              </div>

              {feeStatus === "PAID" && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center relative z-10">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                  <p className="text-emerald-700 text-sm font-medium">Your security fee is paid and up to date. Thank you!</p>
                </div>
              )}

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
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 rounded-xl text-white font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center relative z-10"
              >
                <CreditCard className="w-5 h-5 mr-2" /> Pay Now Securely
              </button>

              <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center relative z-10">
                <Lock className="w-3 h-3 mr-1" /> Secured by Paystack
              </p>
            </>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="glass-panel p-6 rounded-xl border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Payment History</h3>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              </div>
            ) : payments.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No payment records yet.</p>
            ) : (
              <div className="space-y-3">
                {payments.map((p) => (
                  <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center">
                      {p.status === "SUCCESS" ? (
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mr-3 flex-shrink-0" />
                      ) : p.status === "FAILED" ? (
                        <XCircle className="w-8 h-8 text-red-400 mr-3 flex-shrink-0" />
                      ) : (
                        <Clock className="w-8 h-8 text-amber-400 mr-3 flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-sm text-slate-900 font-medium">Security Fee</p>
                        <p className="text-xs text-slate-500">{new Date(p.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">₦{Number(p.amount).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
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
