"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  managerId: string | null;
};

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", role: "EMPLOYEE", managerId: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          managerId: form.managerId || null
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create user");

      setSuccess("User created with default password 'Password123!'");
      setUsers([...users, data.user]);
      setForm({ name: "", email: "", role: "EMPLOYEE", managerId: "" });
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (session?.user.role !== "ADMIN") {
    return <p className="text-red-500">Access Denied. Admins only.</p>;
  }

  const managers = users.filter((u) => u.role === "MANAGER" || u.role === "ADMIN");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-white">User Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create User Form */}
        <div className="md:col-span-1 bg-[#111] p-6 rounded-lg shadow border border-gray-100 h-fit">
          <h2 className="text-lg font-medium mb-4">Add New User</h2>
          {error && <div className="text-sm bg-red-100 text-red-600 p-2 mb-4 rounded">{error}</div>}
          {success && <div className="text-sm bg-green-100 text-green-600 p-2 mb-4 rounded">{success}</div>}
          
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Name</label>
              <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="mt-1 block w-full rounded-md border border-[#333] px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none bg-[#0a0a0a] text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Email</label>
              <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="mt-1 block w-full rounded-md border border-[#333] px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none bg-[#0a0a0a] text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Role</label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="mt-1 block w-full rounded-md border border-[#333] px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none bg-[#0a0a0a] text-white">
                <option value="EMPLOYEE">Employee</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            
            {form.role === "EMPLOYEE" && (
              <div>
                <label className="block text-sm font-medium text-gray-300">Assign Manager (Optional)</label>
                <select value={form.managerId} onChange={e => setForm({...form, managerId: e.target.value})} className="mt-1 block w-full rounded-md border border-[#333] px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none bg-[#0a0a0a] text-white">
                  <option value="">None</option>
                  {managers.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
                  ))}
                </select>
              </div>
            )}
            
            <button type="submit" className="w-full bg-emerald-500 text-black text-white rounded-md py-2 px-4 hover:bg-emerald-600 text-sm font-medium">Create User</button>
          </form>
        </div>

        {/* User List */}
        <div className="md:col-span-2 bg-[#111] rounded-lg shadow border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-[#222]">
            <h2 className="text-lg font-medium text-white">Corporate Directory</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#0a0a0a]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
                </tr>
              </thead>
              <tbody className="bg-[#111] divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">Loading directory...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">No users found.</td></tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-[#0a0a0a]">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-emerald-500 font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                          user.role === 'MANAGER' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-emerald-600'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.managerId ? users.find(u => u.id === user.managerId)?.name || 'Unknown' : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
