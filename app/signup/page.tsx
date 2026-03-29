"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

interface Country {
  name: { common: string };
  currencies: Record<string, { name: string; symbol: string }>;
}

export default function SignupPage() {
  const router = useRouter();
  const [countries, setCountries] = useState<Country[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
    currency: "USD",
  });
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name,currencies")
      .then((res) => res.json())
      .then((data) => {
        // Sort alphabetically
        const sorted = data.sort((a: Country, b: Country) => 
          a.name.common.localeCompare(b.name.common)
        );
        setCountries(sorted);
      })
      .catch((err) => console.error("Failed to fetch countries", err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountry = countries.find(c => c.name.common === e.target.value);
    if (selectedCountry && selectedCountry.currencies) {
      const currencyCode = Object.keys(selectedCountry.currencies)[0];
      setFormData({ ...formData, currency: currencyCode });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      // Auto login after signup
      const loginRes = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (loginRes?.error) {
        throw new Error(loginRes.error);
      }

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
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

      <div className="w-full max-w-md space-y-4 bg-white p-8 rounded-xl shadow-2xl border border-gray-100 relative z-10">
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
          <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900">
            Create your workspace
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded">{error}</div>}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Your Name</label>
              <input
                name="name"
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Work Email</label>
              <input
                name="email"
                type="email"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                name="password"
                type="password"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Company Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company Name</label>
                  <input
                    name="companyName"
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    value={formData.companyName}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                   <label className="block text-sm font-medium text-gray-700">Country Location (sets default currency)</label>
                   <select 
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      onChange={handleCountryChange}
                      defaultValue=""
                   >
                     <option value="" disabled>Select a country</option>
                     {countries.map((c, i) => (
                       <option key={i} value={c.name.common}>{c.name.common}</option>
                     ))}
                   </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Detected Base Currency</label>
                  <input
                    name="currency"
                    type="text"
                    readOnly
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 shadow-sm sm:text-sm text-gray-500"
                    value={formData.currency}
                  />
                  <p className="text-xs text-gray-500 mt-1">This currency will be used for all company accounting.</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Workspace"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
