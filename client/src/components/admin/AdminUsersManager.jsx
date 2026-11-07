import React, { useState } from 'react';
import { 
  Search, 
  ShieldCheck, 
  UserCheck, 
  Sparkles, 
  Plus, 
  Minus, 
  Mail, 
  Calendar,
  Lock,
  UserX
} from 'lucide-react';
import { optimizeAvatarUrl } from '../../utils/imageOptimizer';

export const AdminUsersManager = ({ users, onUpdateRole, onAdjustStars }) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'admin' | 'user'

  const filtered = users.filter(user => {
    const matchesSearch = 
      !search || 
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      (user.full_name && user.full_name.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (roleFilter === 'admin') return user.role === 'admin';
    if (roleFilter === 'user') return user.role === 'user';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#141416] p-4 rounded-2xl border border-white/10">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search users by @username, email, or full name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1c1c20] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {['all', 'admin', 'user'].map((filter) => (
            <button
              key={filter}
              onClick={() => setRoleFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition cursor-pointer ${
                roleFilter === filter
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {filter} {filter === 'admin' && `(${users.filter(u => u.role === 'admin').length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Users Directory Table */}
      <div className="bg-[#141416] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1c1c20] text-zinc-400 font-bold border-b border-white/10 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Creator Identity</th>
                <th className="p-4">System Role</th>
                <th className="p-4">ClickStar Balance</th>
                <th className="p-4">Content Volume</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Quick Star Adjustments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-zinc-500">
                    No users matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-800/40 transition">
                    <td className="p-4 flex items-center gap-3">
                      <img 
                        src={optimizeAvatarUrl(user.avatar_url, 90)} 
                        alt={user.username} 
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-zinc-800" 
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-sm">@{user.username}</span>
                          {user.is_verified && (
                            <span className="text-emerald-400 text-[10px]">✓</span>
                          )}
                        </div>
                        <span className="text-[11px] text-zinc-400 block">{user.full_name || 'Creator'}</span>
                        <span className="text-[10px] text-zinc-500">{user.email}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => onUpdateRole(user.id, user.role)}
                        title="Click to toggle Admin / User role"
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold cursor-pointer transition ${
                          user.role === 'admin' 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30' 
                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        }`}
                      >
                        {user.role === 'admin' ? (
                          <>
                            <ShieldCheck className="w-3 h-3 text-amber-400" />
                            <span>ADMIN</span>
                          </>
                        ) : (
                          <span>USER</span>
                        )}
                      </button>
                    </td>

                    <td className="p-4">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-extrabold text-sm">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{user.stars_count?.toLocaleString() || 0}</span>
                      </div>
                    </td>

                    <td className="p-4 text-zinc-300 font-medium">
                      {user.posts_count || 0} posts shared
                    </td>

                    <td className="p-4 text-zinc-500 whitespace-nowrap">
                      {new Date(user.created_at).toLocaleDateString(undefined, { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onAdjustStars(user.id, 100)}
                          title="Grant +100 ClickStars"
                          className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-amber-500/20 hover:text-amber-400 text-zinc-300 font-bold text-xs border border-zinc-700 transition cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>100</span>
                        </button>
                        <button
                          onClick={() => onAdjustStars(user.id, -100)}
                          title="Deduct 100 ClickStars"
                          className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-rose-500/20 hover:text-rose-400 text-zinc-400 font-bold text-xs border border-zinc-700 transition cursor-pointer flex items-center gap-1"
                        >
                          <Minus className="w-3 h-3" />
                          <span>100</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

