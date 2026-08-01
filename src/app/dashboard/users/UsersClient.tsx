'use client';

import React, { useState } from 'react';
import { UserRecord, toggleUserRoleAction } from '@/lib/actions/users';
import { Card } from '@/components/ui/Card';
import { Users, Shield, ShieldCheck, User, Search, Loader2 } from 'lucide-react';

interface UsersClientProps {
  initialUsers: UserRecord[];
  currentUserId: number;
}

export function UsersClient({ initialUsers, currentUserId }: UsersClientProps) {
  const [usersList, setUsersList] = useState<UserRecord[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleRole = async (targetUser: UserRecord) => {
    setTogglingId(targetUser.id);
    const res = await toggleUserRoleAction(targetUser.id);
    if (res.success && res.newRole) {
      setUsersList((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role: res.newRole! } : u))
      );
    } else {
      alert(res.error || 'Failed to update user role');
    }
    setTogglingId(null);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Table Card */}
      <Card className="p-0 overflow-hidden">
        {/* Table Toolbar Header with Integrated Search Bar */}
        <div className="p-4 border-b border-[#222] bg-[#141414] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Registered Accounts</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-neutral-400 border border-neutral-700">
              {filteredUsers.length} Users
            </span>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="h-3.5 w-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#0a0a0a] border border-[#262626] rounded-lg text-xs placeholder-neutral-500 focus:outline-none transition"
            />
          </div>
        </div>
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <User className="h-10 w-10 text-neutral-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white">No Users Found</h3>
            <p className="text-xs text-neutral-500 mt-1">
              No registered user accounts match your query &quot;{searchTerm}&quot;.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#222] text-neutral-400 font-semibold uppercase tracking-wider bg-[#141414]">
                  <th className="py-3.5 px-4 font-bold text-white">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Cash Balance (CAD)</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4 text-right">Make Admin / Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f1f]">
                {filteredUsers.map((u) => {
                  const isSelf = u.id === currentUserId;
                  const isAdmin = u.role === 'admin';
                  const isToggling = togglingId === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-[#1a1a1a] transition-colors group text-neutral-200">
                      {/* User Info */}
                      <td className="py-4 px-4 font-medium">
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs border ${
                            isAdmin
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                          }`}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white">{u.name}</span>
                              {isSelf && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-neutral-400">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Current Role */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                          isAdmin
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                        }`}>
                          {isAdmin ? <Shield className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                          <span>{u.role}</span>
                        </span>
                      </td>

                      {/* Cash Balance */}
                      <td className="py-4 px-4 font-bold text-white">
                        ${u.cashBalance.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CAD
                      </td>

                      {/* Joined Date */}
                      <td className="py-4 px-4 text-neutral-400 text-xs">{u.createdAt}</td>

                      {/* Admin Role Toggle Switch */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleToggleRole(u)}
                            disabled={isToggling}
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-50 ${
                              isAdmin
                                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
                            }`}
                          >
                            {isToggling ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
                            ) : isAdmin ? (
                              <ShieldCheck className="h-3.5 w-3.5" />
                            ) : (
                              <Shield className="h-3.5 w-3.5 text-neutral-400" />
                            )}
                            <span>{isAdmin ? 'Admin Active' : 'Make Admin'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
export default UsersClient;
