"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function DashboardIndex() {
  const { data: session } = useSession();

  return (
    <div className="bg-[#111] rounded-lg shadow p-6 border border-gray-100">
      <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
        Welcome back, {session?.user.name}
      </h1>
      <p className="text-gray-400 mb-8">
        Access your reimbursements, submit new expenses, and review pending approvals.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/expenses" className="group block p-6 border rounded-xl hover:border-blue-500 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all">
          <h3 className="text-lg font-medium text-white group-hover:text-emerald-400">My Expenses</h3>
          <p className="mt-2 text-sm text-gray-500">Submit new receipts and track the status of your recent claims.</p>
        </Link>
        
        {(session?.user.role === "MANAGER" || session?.user.role === "ADMIN") && (
          <Link href="/approvals" className="group block p-6 border rounded-xl hover:border-blue-500 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all">
            <h3 className="text-lg font-medium text-white group-hover:text-emerald-400">Pending Approvals</h3>
            <p className="mt-2 text-sm text-gray-500">Review and approve expenses submitted by your team members.</p>
          </Link>
        )}

        {session?.user.role === "ADMIN" && (
          <Link href="/admin/users" className="group block p-6 border rounded-xl hover:border-blue-500 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all">
            <h3 className="text-lg font-medium text-white group-hover:text-emerald-400">Company Settings</h3>
            <p className="mt-2 text-sm text-gray-500">Manage your workforce, define approval rules, and modify workflows.</p>
          </Link>
        )}
      </div>
    </div>
  );
}
