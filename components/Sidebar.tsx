"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusSquare, List, CheckSquare, ShieldCheck, Users, AlertTriangle } from "lucide-react";

export default function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const role = user.role;

  const NavLink = ({ href, icon: Icon, label, badge, badgeColor }: any) => {
    const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
    
    return (
      <Link 
        href={href} 
        className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
          isActive 
            ? "bg-emerald-400/10 text-emerald-400 font-medium" 
            : "text-gray-400 hover:text-white hover:bg-white/5"
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 opacity-80" />
          <span className="text-sm">{label}</span>
        </div>
        {badge && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${badgeColor}`}>
            {badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside className="w-64 bg-[#0a0a0a] border-r border-[#222] flex flex-col h-screen text-white shrink-0">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-400 rounded-xl flex items-center justify-center text-black font-bold shadow-[0_0_15px_rgba(52,211,153,0.4)]">
           <LayoutDashboard className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-[15px] tracking-[0.15em] uppercase text-white">ReimburseAI</h1>
          <p className="text-[11px] text-gray-500 font-medium pt-0.5">Expense Management</p>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-6 scrollbar-hide">
        {/* Overview */}
        <div>
          <h2 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3 px-3">Overview</h2>
          <div className="space-y-1">
            <NavLink href="/" icon={LayoutDashboard} label="Dashboard" />
          </div>
        </div>
        
        {/* Expenses */}
        <div>
          <h2 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3 px-3">Expenses</h2>
          <div className="space-y-1">
            <NavLink href="/expenses/new" icon={PlusSquare} label="Submit Expense" />
            <NavLink href="/expenses" icon={List} label="My Expenses" />
          </div>
        </div>

        {/* Approvals */}
        {(role === "MANAGER" || role === "ADMIN") && (
          <div>
            <h2 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3 px-3">Approvals</h2>
            <div className="space-y-1">
              <NavLink href="/approvals" icon={CheckSquare} label="Approval Queue" badge="5" badgeColor="bg-red-500" />
              {role === "ADMIN" && (
                <NavLink href="/admin/rules" icon={ShieldCheck} label="Workflow Rules" />
              )}
            </div>
          </div>
        )}

        {/* Admin */}
        {role === "ADMIN" && (
          <div>
            <h2 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3 px-3">Admin</h2>
            <div className="space-y-1">
              <NavLink href="/admin/users" icon={Users} label="Team & Roles" badge="12" badgeColor="bg-emerald-500 text-black" />
              <NavLink href="/admin/compliance" icon={AlertTriangle} label="Compliance & Fraud" />
            </div>
          </div>
        )}
      </nav>

      {/* Profile Footer */}
      <div className="p-4 border-t border-[#222]">
        <div className="flex items-center gap-3 bg-[#111] p-3 rounded-xl border border-[#333] hover:border-emerald-500/50 transition-colors cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-emerald-400 flex items-center justify-center text-black font-bold text-sm">
             {user.name.split(' ').map((n: string) => n[0]).join('')}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <p className="text-xs text-emerald-400 font-medium">{role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
