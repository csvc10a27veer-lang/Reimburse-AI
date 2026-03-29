"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  const handleDemoLogin = async (role: 'employee' | 'manager') => {
    setLoading(true);
    setError("");
    try {
      const seedRes = await fetch('/api/seed', { method: 'POST' });
      if (!seedRes.ok) throw new Error("Failed to initialize demo accounts");

      const res = await signIn("credentials", {
        redirect: false,
        email: role === 'employee' ? 'employee@demo.com' : 'manager@demo.com',
        password: 'Password123!',
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (e: any) {
      setError(e.message || "An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Light-Emerald Lines Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{
         backgroundImage: `repeating-linear-gradient(45deg, #10b981 0, #10b981 1px, transparent 1px, transparent 40px)`,
         backgroundSize: `56px 56px`,
         animation: `slide-bg 4s linear infinite`
      }} />

      <div className="w-full max-w-md space-y-8 bg-[#111] p-8 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-[#222] relative z-10">
        <div className="flex justify-center items-center space-x-6 mb-6 mt-2">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="w-10 h-10 rounded-full border-[3px] border-emerald-400 bg-[#050505] animate-glow-dot shadow-[0_0_15px_rgba(16,185,129,0.5)]"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </div>

        <div>
          <div className="flex items-center justify-center gap-3 px-2 mb-6 mt-6">
            <div className="bg-emerald-400 p-1.5 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <LayoutDashboard className="h-6 w-6 text-black" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-white font-bold text-lg tracking-widest leading-none">REIMBURSEAI</span>
              <span className="text-emerald-500/80 text-[10px] font-medium uppercase tracking-wider mt-1">Expense Management</span>
            </div>
          </div>

          <p className="mt-2 text-center text-sm text-gray-400">
            Sign in below or{" "}
            <Link href="/signup" className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
              create a new workspace.
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 p-3 rounded-md">{error}</div>}
          <div className="space-y-4 rounded-md shadow-sm mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">Email address</label>
              <input
                type="email"
                required
                className="mt-1 block w-full rounded-md border border-[#333] bg-[#0a0a0a] text-white px-3 py-2 shadow-[0_4px_20px_rgba(0,0,0,0.5)] focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Password</label>
              <input
                type="password"
                required
                className="mt-1 block w-full rounded-md border border-[#333] bg-[#0a0a0a] text-white px-3 py-2 shadow-[0_4px_20px_rgba(0,0,0,0.5)] focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-emerald-500 py-2.5 px-4 text-sm font-bold text-black hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-[#111] disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              {loading ? "Signing in..." : "Sign in to Workspace"}
            </button>
          </div>
        </form>

        <div className="mt-8 flex flex-col gap-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#333]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[#111] px-2 text-gray-500 font-medium tracking-wide text-xs uppercase">Hackathon Demo Login</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('employee')}
              disabled={loading}
              className="flex items-center justify-center rounded-md border border-[#333] bg-[#0a0a0a] py-2.5 px-4 text-sm font-medium text-gray-300 hover:bg-[#1a1a1a] hover:border-emerald-500/50 hover:text-emerald-400 transition-all focus:outline-none shadow-[0_4px_20px_rgba(0,0,0,0.5)] disabled:opacity-50"
            >
              Employee
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('manager')}
              disabled={loading}
              className="flex items-center justify-center rounded-md border border-emerald-500/30 bg-emerald-500/10 py-2.5 px-4 text-sm font-medium text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500 transition-all focus:outline-none shadow-[0_4px_20px_rgba(0,0,0,0.5)] disabled:opacity-50"
            >
              Manager
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
