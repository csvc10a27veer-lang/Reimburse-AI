"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Camera } from "lucide-react";

export default function NewExpensePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ocrScanning, setOcrScanning] = useState(false);
  
  const [form, setForm] = useState<{
    amount: string;
    currency: string;
    category: string;
    description: string;
    date: string;
    receiptUrl: string;
    detectedLogo: string;
    handwrittenNote: string;
    items: {name: string, amount: number, isReimbursable: boolean}[];
  }>({
    amount: "",
    currency: "USD",
    category: "Meals",
    description: "",
    date: new Date().toISOString().split('T')[0],
    receiptUrl: "",
    detectedLogo: "",
    handwrittenNote: "",
    items: [],
  });

  const handleFakeOCR = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64String = reader.result as string;
      setOcrScanning(true);
      // Simulate OCR delay and Advanced Enterprise OCR
      setTimeout(() => {
        const mockItems = [
          { name: "Coffee & Sandwiches", amount: 30.00, isReimbursable: true },
          { name: "Gift Card (Personal)", amount: 15.00, isReimbursable: false }
        ];
        const newTotal = mockItems.filter(i => i.isReimbursable).reduce((a, b) => a + b.amount, 0).toFixed(2);
        
        setForm((prev) => ({
          ...prev,
          receiptUrl: base64String,
          amount: newTotal,
          description: "Client Lunch at Starbucks",
          date: new Date().toISOString().split('T')[0], // Defaults to today, try changing it to a weekend for compliance testing
          category: "Meals",
          detectedLogo: "Starbucks Corporation",
          handwrittenNote: "Discussed Q3 strategy. Gratuity included.",
          items: mockItems
        }));
        setOcrScanning(false);
      }, 2000);
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit expense");

      router.push("/expenses");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Submit New Expense</h1>
        <p className="text-gray-500 mt-1">Upload a receipt or enter details manually.</p>
      </div>

      <div className="bg-[#111] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#222] overflow-hidden">
        {/* Smart Upload Section */}
        <div className="p-6 border-b border-gray-100 bg-emerald-500/10/30">
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-emerald-500/20 rounded-lg bg-[#111] relative cursor-pointer hover:border-blue-400 transition"
               onClick={() => fileInputRef.current?.click()}>
            <input type="file" className="hidden" ref={fileInputRef} onChange={handleFakeOCR} accept="image/*,.pdf" />
            
            {ocrScanning ? (
              <div className="flex flex-col items-center text-emerald-400 animate-pulse">
                <Camera className="h-10 w-10 mb-3" />
                <p className="font-medium text-sm">Scanning receipt with Enterprise AI OCR...</p>
                <p className="text-xs text-emerald-300 mt-1">Extracting logo, item splits, and handwritten notes...</p>
              </div>
            ) : form.receiptUrl ? (
              <div className="flex flex-col items-center text-gray-300">
                <img src={form.receiptUrl} alt="Receipt preview" className="h-40 w-auto object-contain rounded-md shadow-[0_4px_20px_rgba(0,0,0,0.5)] mb-3 border border-[#222]" />
                <p className="font-medium text-emerald-400 text-sm">Receipt successfully attached</p>
                <p className="text-xs text-gray-500 mt-1">Click to upload a different image</p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-gray-500">
                <Upload className="h-10 w-10 mb-3 text-emerald-400" />
                <p className="font-medium text-gray-300">Click to upload receipt</p>
                <p className="text-sm mt-1">Enterprise AI will read the logo, read handwriting, and itemize.</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Extractions Preview */}
        {form.items && form.items.length > 0 && (
          <div className="p-6 bg-emerald-500/10 border-b border-emerald-500/10">
            <h3 className="text-sm font-bold text-emerald-700 mb-3 flex items-center">
              <span className="mr-2">✨</span> AI Receipt Analysis
            </h3>
            {form.detectedLogo && <p className="text-sm text-emerald-600 mb-1"><strong>Detected Merchant Logo:</strong> {form.detectedLogo}</p>}
            {form.handwrittenNote && <p className="text-sm text-emerald-600 mb-4"><strong>Handwritten Translation:</strong> {form.handwrittenNote}</p>}
            
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Itemized Split (Toggle Non-Reimbursable)</p>
              {form.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-[#111] p-3 rounded-md border border-emerald-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">{item.name}</span>
                    <span className="text-xs text-gray-500">${item.amount.toFixed(2)}</span>
                  </div>
                  <label className="flex items-center space-x-2 cursor-pointer bg-[#0a0a0a] px-3 py-1.5 rounded-md border border-[#222]">
                    <input 
                      type="checkbox" 
                      className="rounded text-emerald-400 focus:ring-emerald-500 h-4 w-4"
                      checked={item.isReimbursable}
                      onChange={(e) => {
                        const newItems = [...form.items];
                        newItems[idx].isReimbursable = e.target.checked;
                        const newTotal = newItems.filter(i => i.isReimbursable).reduce((acc, curr) => acc + curr.amount, 0);
                        setForm({...form, items: newItems, amount: newTotal.toFixed(2)});
                      }}
                    />
                    <span className="text-xs font-medium text-gray-300">{item.isReimbursable ? "Business" : "Personal"}</span>
                  </label>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3 italic">Claim total is automatically updated based on toggles above.</p>
          </div>
        )}

        {/* Manual Entry Form */}
        <div className="p-6">
          {error && <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-sm font-medium text-gray-300">Total Claim Amount</label>
                <div className="mt-1 flex rounded-md shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                  <select
                    className="inline-flex items-center rounded-l-md border border-r-0 border-[#333] bg-[#0a0a0a] px-3 text-gray-500 sm:text-sm focus:outline-none"
                    value={form.currency}
                    onChange={e => setForm({...form, currency: e.target.value})}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="INR">INR</option>
                    <option value="JPY">JPY</option>
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.amount}
                    onChange={e => setForm({...form, amount: e.target.value})}
                    className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border border-[#333] px-3 py-2 sm:text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-[#0a0a0a]"
                    placeholder="0.00"
                    readOnly={form.items.length > 0} // Lock if driven by items
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Date of Transaction</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={e => setForm({...form, date: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-[#333] px-3 py-2 sm:text-sm focus:border-emerald-500 focus:outline-none bg-[#0a0a0a] text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300">Vendor / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Uber ride to airport"
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-[#333] px-3 py-2 sm:text-sm focus:border-emerald-500 focus:outline-none bg-[#0a0a0a] text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300">Expense Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm({...form, category: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-[#333] px-3 py-2 sm:text-sm focus:border-emerald-500 focus:outline-none bg-[#0a0a0a] text-white"
                >
                  <option value="Meals">Meals</option>
                  <option value="Travel">Travel & Lodging</option>
                  <option value="Transport">Transportation & Mileage</option>
                  <option value="Office">Office Supplies</option>
                  <option value="Software">Software & Subscriptions</option>
                  <option value="Entertainment">Entertainment (High Scrutiny)</option>
                  <option value="Alcohol">Alcohol (Blacklisted Policy)</option>
                  <option value="Other">Other</option>
                </select>
              </div>

            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => router.push('/expenses')}
                className="mr-3 bg-[#111] py-2 px-4 border border-[#333] rounded-md shadow-[0_4px_20px_rgba(0,0,0,0.5)] text-sm font-medium text-gray-300 hover:bg-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || ocrScanning}
                className="bg-emerald-500 text-black border border-transparent rounded-md shadow-[0_4px_20px_rgba(0,0,0,0.5)] py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit for Approval"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
