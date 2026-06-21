"use client";

import { useState, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { KeyRound, ShieldCheck, Mail, Lock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/resident";
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await signIn("credentials", {
      identifier,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid credentials. Please try again.");
      setIsLoading(false);
    } else {
      router.push(callbackUrl);
    }
  };

  const containerVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: "easeOut",
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md relative z-10"
    >
      <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] relative overflow-hidden">
        
        <motion.div variants={itemVariants} className="flex flex-col items-center justify-center mb-10">
          <img src="/noetica_icon_transparent.png" alt="Noetica Logo" className="h-14 object-contain mb-4" />
          <h2 className="text-2xl font-outfit font-bold text-white tracking-tight">Noetica</h2>
          <p className="text-emerald-400 text-xs mt-1 font-semibold tracking-widest uppercase">Estate Access</p>
        </motion.div>

        <motion.div variants={itemVariants} className="text-center mb-8">
          <h1 className="text-3xl font-bold font-outfit text-white mb-2 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-slate-300 text-sm">
            Sign in to manage your estate access
          </p>
        </motion.div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.div variants={itemVariants} className="space-y-1">
            <label className="text-xs font-medium text-slate-300 uppercase tracking-wider ml-1">Email or Phone</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-white placeholder-slate-500 transition-all outline-none"
                placeholder="name@example.com"
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-1">
            <label className="text-xs font-medium text-slate-300 uppercase tracking-wider ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-white placeholder-slate-500 transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-xl font-bold transition-all duration-200 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <KeyRound className="ml-2 w-4 h-4" />
                </>
              )}
            </button>
          </motion.div>
        </form>

        <motion.div variants={itemVariants} className="mt-8 relative">
          <div className="absolute inset-0 flex items-center">
             <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-slate-900/40 text-slate-400 text-xs uppercase tracking-widest backdrop-blur-xl rounded-full">
              Or continue with
            </span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-6 grid grid-cols-2 gap-4">
          <button
            onClick={() => signIn("google", { callbackUrl })}
            className="flex items-center justify-center py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-200 text-slate-200 hover:text-white"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>
          <button
            onClick={() => signIn("azure-ad", { callbackUrl })}
            className="flex items-center justify-center py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-200 text-slate-200 hover:text-white"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 21 21">
              <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
              <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
              <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
            </svg>
            Microsoft
          </button>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-8 text-center">
             <button onClick={() => router.push('/signup')} className="text-sm text-slate-400 hover:text-white transition-colors">
               Don't have an account? Sign Up
             </button>
        </motion.div>

      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-900">
      
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/premium_login_bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      />
      <div className="absolute inset-0 bg-slate-900/30 z-0 pointer-events-none" />

      <Suspense fallback={<div className="text-white z-10">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}

