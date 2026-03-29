"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

type PendingExpense = {
  id: string;
  amount: number;
  originalCurrency: string;
  convertedAmount: number;
  category: string;
  description: string;
  date: string;
  submitter: { name: string; email: string };
  receiptUrl?: string | null;
  isDuplicate?: boolean;
  isWeekend?: boolean;
  policyViolation?: string | null;
  detectedLogo?: string | null;
  handwrittenNote?: string | null;
  items?: string | null;
};

export default function ApprovalsPage() {
  const { data: session } = useSession();
  const [expenses, setExpenses] = useState<PendingExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, string>>({});

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/approvals");
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleAction = async (expenseId: string, action: 'APPROVE' | 'REJECT') => {
    setActioningId(expenseId);
    try {
      const res = await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expenseId,
          action,
          comments: comments[expenseId] || null
        }),
      });
      if (res.ok) {
        // Remove from list
        setExpenses(expenses.filter(e => e.id !== expenseId));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActioningId(null);
    }
  };

  if (session?.user.role === "EMPLOYEE") {
    return <p className="text-red-500">Access Denied</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-white">Pending Approvals Action Center</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-gray-500">Loading your approval queue...</p>
        ) : expenses.length === 0 ? (
           <div className="col-span-full border-2 border-dashed border-[#222] rounded-xl p-12 flex flex-col items-center justify-center text-gray-500">
             <span className="text-4xl mb-4">🏆</span>
             <h3 className="text-lg font-medium text-white">Inbox Zero!</h3>
             <p>You have no pending expenses requiring your approval right now.</p>
           </div>
        ) : (
          expenses.map((exp) => (
            <div key={exp.id} className="bg-[#111] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#222] overflow-hidden flex flex-col">
              <div className="p-5 border-b border-gray-100 bg-[#0a0a0a] flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-white">{exp.submitter.name}</h3>
                  <p className="text-xs text-gray-500">{exp.submitter.email}</p>
                </div>
                <div className="bg-blue-100 text-emerald-600 text-xs px-2 py-1 rounded font-medium">
                  {exp.category}
                </div>
              </div>
              
              <div className="p-5 flex-1">
                <div className="mb-4">
                  <p className="text-2xl font-bold text-white">
                    {exp.originalCurrency} {exp.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    (≈ {exp.convertedAmount.toFixed(2)} Base Currency)
                  </p>
                </div>
                
                <div className="space-y-2 mb-6">
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date</span>
                    <p className="text-sm text-white">{new Date(exp.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Description</span>
                    <p className="text-sm text-white">{exp.description}</p>
                  </div>

                  {/* Compliance Flags */}
                  {(exp.isDuplicate || exp.isWeekend || exp.policyViolation) && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md mt-3">
                      <p className="text-xs font-bold text-red-800 uppercase tracking-wide mb-1 flex items-center">
                        <span className="mr-1">🚨</span> Compliance Warnings
                      </p>
                      {exp.isDuplicate && <p className="text-xs font-medium text-red-700">• Potential Duplicate Submission</p>}
                      {exp.isWeekend && <p className="text-xs font-medium text-red-700">• Suspicious Weekend/Holiday Expense</p>}
                      {exp.policyViolation && <p className="text-xs font-medium text-red-700">• {exp.policyViolation}</p>}
                    </div>
                  )}

                  {/* AI Extractions */}
                  {(exp.detectedLogo || exp.handwrittenNote || exp.items) && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md mt-3">
                      <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-1 flex items-center">
                        <span className="mr-1">✨</span> AI Receipt Analysis
                      </p>
                      {exp.detectedLogo && <p className="text-xs text-emerald-500 mb-1"><strong>Logo:</strong> {exp.detectedLogo}</p>}
                      {exp.handwrittenNote && <p className="text-xs text-emerald-500 mb-2"><strong>Notes:</strong> {exp.handwrittenNote}</p>}
                      {exp.items && JSON.parse(exp.items).filter((i: any) => i.isReimbursable).length > 0 && (
                        <div className="mt-1">
                           <p className="text-xs font-semibold text-emerald-600">Approved Item Split:</p>
                           <ul className="list-disc pl-4 text-xs text-emerald-500 mt-1">
                             {JSON.parse(exp.items).filter((i: any) => i.isReimbursable).map((i: any, idx: number) => (
                               <li key={idx}>{i.name} - ${Number(i.amount).toFixed(2)}</li>
                             ))}
                           </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {exp.receiptUrl && (
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Receipt Attachment</span>
                      <div className="mt-1">
                        <a href={exp.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 text-sm font-medium hover:underline flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                          View Receipt Image
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-auto">
                   <input
                     type="text"
                     placeholder="Leave a comment (optional)..."
                     className="w-full text-sm rounded-md border border-[#333] px-3 py-2 mb-4 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                     value={comments[exp.id] || ""}
                     onChange={(e) => setComments({...comments, [exp.id]: e.target.value})}
                   />
                   
                   <div className="flex space-x-3 mt-auto">
                     <button
                       onClick={() => handleAction(exp.id, 'REJECT')}
                       disabled={actioningId === exp.id}
                       className="flex-1 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                     >
                       REJECT
                     </button>
                     <button
                       onClick={() => handleAction(exp.id, 'APPROVE')}
                       disabled={actioningId === exp.id}
                       className="flex-1 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 shadow-[0_4px_20px_rgba(0,0,0,0.5)] rounded-lg transition-colors disabled:opacity-50"
                     >
                       APPROVE
                     </button>
                   </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
