"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Purple Lines Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{
         backgroundImage: `repeating-linear-gradient(45deg, #a855f7 0, #a855f7 1px, transparent 1px, transparent 40px)`,
         backgroundSize: `56px 56px`,
         animation: `slide-bg 4s linear infinite`
      }} />

      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-2xl border border-gray-100 relative z-10">
        <div className="flex justify-center items-center space-x-6 mb-2 mt-2">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="w-10 h-10 rounded-full border-[3px] border-purple-400 bg-gray-900 animate-glow-dot"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </div>

        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              create a new company workspace
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded">{error}</div>}
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                type="email"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <div className="mt-6 flex flex-col gap-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Hackathon Demo Login</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('employee')}
              disabled={loading}
              className="flex items-center justify-center rounded-md border border-gray-300 bg-gray-50 py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:border-purple-500/50 transition-all focus:outline-none disabled:opacity-50"
            >
              Login as Employee
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('manager')}
              disabled={loading}
              className="flex items-center justify-center rounded-md border border-purple-200 bg-purple-50 py-2 px-4 text-sm font-medium text-purple-700 hover:bg-purple-100 hover:border-purple-500/50 transition-all focus:outline-none disabled:opacity-50"
            >
              Login as Manager
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
