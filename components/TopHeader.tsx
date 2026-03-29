"use client";

import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

export default function TopHeader() {
  const pathname = usePathname();
  
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard Overview";
    if (pathname === "/expenses/new") return "Submit Expense";
    if (pathname === "/expenses") return "My Expenses";
    if (pathname === "/approvals") return "Approval Queue";
    if (pathname === "/admin/rules") return "Workflow Rules";
    if (pathname === "/admin/users") return "Team & Roles";
    if (pathname === "/admin/compliance") return "Compliance Alerts";
    return "";
  };

  return (
    <header className="h-20 border-b border-[#222] bg-[#0a0a0a] flex items-center justify-between px-8 text-white">
      <h1 className="text-xl font-bold">{getPageTitle()}</h1>
      
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search expenses..." 
            className="bg-[#111] border border-[#333] rounded-lg pl-9 pr-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 w-64 transition-all"
          />
        </div>
        
        <button className="px-4 py-2 border border-[#333] hover:border-[#555] rounded-lg text-sm font-medium text-gray-300 transition-colors">
          Export
        </button>
        <button className="px-4 py-2 bg-[#111] border border-[#222] text-gray-400 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed">
          + New Expense
        </button>
      </div>
    </header>
  );
}
