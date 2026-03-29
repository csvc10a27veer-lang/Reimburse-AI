import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function CompliancePage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  // Fetch all flagged expenses globally for the company
  const flaggedExpenses = await prisma.expense.findMany({
    where: {
      submitter: { companyId: session.user.companyId },
      OR: [
        { isDuplicate: true },
        { isWeekend: true },
        { policyViolation: { not: null } }
      ]
    },
    include: { submitter: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Compliance & Fraud Alerts</h1>
        <p className="text-gray-400 mt-1">Review flagged expenses that violated company policies or triggered AI anomalies.</p>
      </div>

      {flaggedExpenses.length === 0 ? (
        <div className="bg-[#111] p-8 text-center rounded-xl border border-[#222]">
          <p className="text-emerald-400 font-medium">All clear! No compliance violations detected.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {flaggedExpenses.map((exp: any) => (
            <div key={exp.id} className="bg-[#111] border border-red-500/20 rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg text-white">{exp.description}</h3>
                  <p className="text-xs text-gray-500">Submitted by: <span className="text-gray-300">{exp.submitter.name} ({exp.submitter.email})</span></p>
                </div>
                <div className="text-right">
                  <span className="block font-bold text-red-400">${exp.amount.toFixed(2)}</span>
                  <span className="text-xs text-gray-500">{new Date(exp.date).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg items-center">
                <span className="text-xs font-bold text-red-500 uppercase tracking-wide mr-2">🚨 AI Triggers: </span>
                {exp.isDuplicate && <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-md font-medium border border-red-500/30">Duplicate Submission</span>}
                {exp.isWeekend && <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded-md font-medium border border-orange-500/30">Weekend Expense</span>}
                {exp.policyViolation && <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-md font-medium border border-red-500/30">Policy: {exp.policyViolation}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
