"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ArrowLeft, UserPlus, Search, Mail } from "lucide-react"
import { portalUsers, type PortalUser, type AccessRole } from "@/lib/portfolio-portal-config"

const roles: AccessRole[] = ["CFO", "Finance analyst", "Viewer"]

const statusStyle: Record<PortalUser["status"], string> = {
  active: "bg-[#EAF3DE] text-[#3B6D11]",
  invited: "bg-[#EAF1EF] text-[#1B4D45]",
  suspended: "bg-[#FBEAEA] text-[#A32D2D]",
}

export function PortalAccessRights({ onBack }: { onBack: () => void }) {
  const [users, setUsers] = useState<PortalUser[]>(portalUsers)
  const [query, setQuery] = useState("")

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.company.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()),
  )

  const changeRole = (id: string, role: AccessRole) =>
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)))

  const toggleSuspend = (id: string) =>
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === "suspended" ? "active" : "suspended" } : u,
      ),
    )

  return (
    <div className="min-h-screen bg-[#F7F6F3] font-sans">
      <header className="border-b border-[#E8E6E0] bg-white px-8 py-5">
        <button
          onClick={onBack}
          className="mb-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-[#6B6963] transition-colors hover:text-[#1B4D45]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to administration
        </button>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-[18px] font-semibold text-[#2C2C2A]">Access rights</h1>
            <p className="text-[13px] text-[#6B6963]">Manage who can access the Portfolio Portal and what they can do</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg bg-[#1B4D45] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#164039]">
            <UserPlus className="h-4 w-4" />
            Invite user
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-8 py-6">
        <div className="relative mb-4 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A988F]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, company, or email…"
            className="w-full rounded-lg border border-[#E8E6E0] bg-white py-2 pl-9 pr-3 text-[13px] text-[#2C2C2A] outline-none transition-colors focus:border-[#1B4D45]"
          />
        </div>

        <div className="overflow-hidden rounded-[10px] border border-[#E8E6E0] bg-white">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E8E6E0] bg-[#FAFAF8] text-[11px] uppercase tracking-wide text-[#9A988F]">
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Company</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Last active</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-[#F0EEE9] last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF1EF] text-[11px] font-semibold text-[#1B4D45]">
                        {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium text-[#2C2C2A]">{user.name}</div>
                        <div className="flex items-center gap-1 text-[11px] text-[#9A988F]">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[13px] text-[#6B6963]">{user.company}</td>
                  <td className="px-5 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => changeRole(user.id, e.target.value as AccessRole)}
                      className="rounded-md border border-[#E8E6E0] bg-white px-2 py-1 text-[12px] text-[#2C2C2A] outline-none focus:border-[#1B4D45]"
                    >
                      {roles.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize",
                        statusStyle[user.status],
                      )}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[12px] text-[#9A988F]">{user.lastActive}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => toggleSuspend(user.id)}
                      className="text-[12px] font-medium text-[#6B6963] transition-colors hover:text-[#A32D2D]"
                    >
                      {user.status === "suspended" ? "Reactivate" : "Suspend"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
