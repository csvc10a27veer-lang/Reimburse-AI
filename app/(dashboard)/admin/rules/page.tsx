"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

type Rule = {
  id: string;
  type: string;
  threshold: number | null;
  stepOrder: number;
  designatedApprover?: { name: string; email: string };
};

type Manager = {
  id: string;
  name: string;
  email: string;
};

export default function ApprovalRulesPage() {
  const { data: session } = useSession();
  const [rules, setRules] = useState<Rule[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    type: "MANAGER_ONLY",
    threshold: "",
    stepOrder: "1",
    designatedApproverId: "",
  });

  const fetchData = async () => {
    try {
      const res = await fetch("/api/rules");
      const data = await res.json();
      setRules(data.rules || []);
      setManagers(data.managers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/rules?id=${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (session?.user.role !== "ADMIN") return <p>Access Denied</p>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-white">Dynamic Approval Workflow Configuration</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Make Rule Form */}
        <div className="bg-[#111] p-6 rounded-lg shadow border border-gray-100 h-fit">
          <h2 className="text-lg font-medium mb-4">Add Sequential Rule Step</h2>
          
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Sequence Step</label>
              <input type="number" min="1" required value={form.stepOrder} onChange={e => setForm({...form, stepOrder: e.target.value})} className="mt-1 block w-full rounded-md border border-[#333] px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none bg-[#0a0a0a] text-white" />
              <p className="text-xs text-gray-500 mt-1">If Step 1, the immediate manager approves first.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300">Rule Logic Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="mt-1 block w-full rounded-md border border-[#333] px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none bg-[#0a0a0a] text-white">
                <option value="MANAGER_ONLY">Direct Manager Only</option>
                <option value="PERCENTAGE">Percentage Consensus</option>
                <option value="SPECIFIC_APPROVER">Specific Override/Approver</option>
              </select>
            </div>
            
            {form.type === "PERCENTAGE" && (
              <div>
                <label className="block text-sm font-medium text-gray-300">Consensus Threshold (%)</label>
                <input type="number" min="1" max="100" placeholder="e.g. 60" required value={form.threshold} onChange={e => setForm({...form, threshold: e.target.value})} className="mt-1 block w-full rounded-md border border-[#333] px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none bg-[#0a0a0a] text-white" />
              </div>
            )}

            {form.type === "SPECIFIC_APPROVER" && (
              <div>
                <label className="block text-sm font-medium text-gray-300">Select Approver Executive</label>
                <select value={form.designatedApproverId} required onChange={e => setForm({...form, designatedApproverId: e.target.value})} className="mt-1 block w-full rounded-md border border-[#333] px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none bg-[#0a0a0a] text-white">
                  <option value="">Choose Executive...</option>
                  {managers.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
                  ))}
                </select>
              </div>
            )}
            
            <button type="submit" className="w-full bg-emerald-500 text-black text-white rounded-md py-2 px-4 hover:bg-emerald-600 text-sm font-medium mt-4">Add Rule to Flow</button>
          </form>
        </div>

        {/* Rules visualizer */}
        <div className="md:col-span-2 bg-[#111] p-6 rounded-lg shadow border border-gray-100">
          <h2 className="text-lg font-medium text-white mb-4">Current Workflow Evaluation Order</h2>
          {loading ? <p className="text-sm text-gray-500">Loading flow...</p> : rules.length === 0 ? (
            <div className="bg-[#0a0a0a] border-2 border-dashed border-[#222] p-8 text-center rounded-lg">
              <p className="text-gray-500">No custom rules. Default behavior: Auto-Approve.</p>
            </div>
          ) : (
            <div className="space-y-4 relative">
              {rules.map((r, idx) => (
                <div key={r.id} className="flex flex-col relative">
                  <div className="flex items-start bg-emerald-500/10 border border-emerald-500/10 p-4 rounded-lg">
                    <div className="flex-shrink-0 bg-emerald-500 text-black text-white rounded-full h-6 w-6 flex items-center justify-center font-bold text-xs mt-0.5">
                      {r.stepOrder}
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-sm font-semibold text-white">
                        {r.type === 'MANAGER_ONLY' && "Direct Manager Approval required"}
                        {r.type === 'PERCENTAGE' && `Committee Consensus: ${r.threshold}% required`}
                        {r.type === 'SPECIFIC_APPROVER' && `Executive Approval: ${r.designatedApprover?.name}`}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Expense will not proceed to subsequent steps until this block clears.
                      </p>
                    </div>
                    <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:text-red-700 text-xs font-medium ml-4 mt-1">Remove</button>
                  </div>
                  {idx !== rules.length - 1 && (
                    <div className="h-6 border-l-2 border-dashed border-[#333] ml-7 my-1"></div>
                  )}
                </div>
              ))}
              
              <div className="h-6 border-l-2 border-dashed border-[#333] ml-7 my-1"></div>
              <div className="flex items-center ml-2 space-x-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-green-100 text-green-600 border border-green-200">
                   ✓ 
                </div>
                <span className="font-medium text-green-700">Expense Fully Approved & Processed</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
