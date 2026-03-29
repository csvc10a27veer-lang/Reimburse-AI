import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import Sidebar from "@/components/Sidebar";
import TopHeader from "@/components/TopHeader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-[#050505] overflow-hidden text-white font-sans">
      <Sidebar user={session.user} />
      
      <div className="flex-1 flex flex-col relative z-0">
        <TopHeader />
        
        <main className="flex-1 overflow-y-auto p-8 relative">
           {children}
        </main>
      </div>
    </div>
  );
}
