"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { currentUser, funds } from "@/lib/mock-data"
import { User, Building2, Bell, Shield, Palette, Database } from "lucide-react"

type SettingsTab = "profile" | "funds" | "notifications" | "security" | "appearance" | "integrations"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile")

  const tabs = [
    { id: "profile" as SettingsTab, label: "Profile", icon: User },
    { id: "funds" as SettingsTab, label: "Funds", icon: Building2 },
    { id: "notifications" as SettingsTab, label: "Notifications", icon: Bell },
    { id: "security" as SettingsTab, label: "Security", icon: Shield },
    { id: "appearance" as SettingsTab, label: "Appearance", icon: Palette },
    { id: "integrations" as SettingsTab, label: "Integrations", icon: Database },
  ]

  return (
    <div className="flex min-h-screen flex-col font-sans">
      {/* Header */}
      <div className="border-b border-line px-6 py-4">
        <h1 className="text-xl font-medium text-ink">Settings</h1>
        <p className="text-[13px] text-ink-2">Manage your account and preferences</p>
      </div>

      {/* Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-56 border-r border-line bg-white p-4">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors",
                  activeTab === tab.id
                    ? "bg-bg font-medium text-ink"
                    : "text-ink-2 hover:bg-bg hover:text-ink"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeTab === "profile" && (
            <div className="max-w-xl space-y-6">
              <div>
                <h2 className="text-[15px] font-medium text-ink">Profile Settings</h2>
                <p className="mt-1 text-[12px] text-ink-2">Update your personal information</p>
              </div>

              <div className="rounded-[10px] border border-line bg-white p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ai text-lg font-medium text-on-ai">
                    {currentUser.initials}
                  </div>
                  <div>
                    <Button variant="outline" size="sm" className="border-line">
                      Change Photo
                    </Button>
                  </div>
                </div>

                <div className="mt-6 grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium text-ink-2">First Name</label>
                      <Input defaultValue={currentUser.name.split(" ")[0]} className="border-line" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium text-ink-2">Last Name</label>
                      <Input defaultValue={currentUser.name.split(" ").slice(1).join(" ")} className="border-line" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium text-ink-2">Email</label>
                    <Input defaultValue={currentUser.email} className="border-line" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium text-ink-2">Role</label>
                    <Input defaultValue={currentUser.role} disabled className="border-line bg-bg" />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button className="bg-brand text-white hover:bg-action-hover">
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "funds" && (
            <div className="max-w-xl space-y-6">
              <div>
                <h2 className="text-[15px] font-medium text-ink">Fund Configuration</h2>
                <p className="mt-1 text-[12px] text-ink-2">Manage fund settings and access</p>
              </div>

              <div className="space-y-3">
                {funds.map((fund) => (
                  <div key={fund.id} className="rounded-[10px] border border-line bg-white p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-[13px] font-medium text-ink">{fund.name}</h3>
                        <p className="mt-0.5 text-[11px] text-ink-2">Vintage {fund.vintageYear} · €{fund.committedCapital}M committed</p>
                      </div>
                      <Button variant="outline" size="sm" className="border-line">
                        Configure
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="max-w-xl space-y-6">
              <div>
                <h2 className="text-[15px] font-medium text-ink">Notification Preferences</h2>
                <p className="mt-1 text-[12px] text-ink-2">Choose how you want to be notified</p>
              </div>

              <div className="rounded-[10px] border border-line bg-white divide-y divide-line">
                {[
                  { label: "Data upload confirmations", description: "Get notified when data is processed" },
                  { label: "Alert status changes", description: "When a company status changes to Alert" },
                  { label: "Report generation complete", description: "When LP reports are ready" },
                  { label: "Weekly portfolio summary", description: "Receive a weekly digest" },
                  { label: "AI analysis insights", description: "Get notified about automated insights" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <div className="text-[13px] font-medium text-ink">{item.label}</div>
                      <div className="text-[11px] text-ink-2">{item.description}</div>
                    </div>
                    <Switch defaultChecked={i < 3} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="max-w-xl space-y-6">
              <div>
                <h2 className="text-[15px] font-medium text-ink">Security Settings</h2>
                <p className="mt-1 text-[12px] text-ink-2">Manage your account security</p>
              </div>

              <div className="rounded-[10px] border border-line bg-white p-5 space-y-4">
                <div>
                  <h3 className="text-[13px] font-medium text-ink">Change Password</h3>
                  <div className="mt-3 grid gap-3">
                    <Input type="password" placeholder="Current password" className="border-line" />
                    <Input type="password" placeholder="New password" className="border-line" />
                    <Input type="password" placeholder="Confirm new password" className="border-line" />
                  </div>
                  <Button className="mt-4 bg-brand text-white hover:bg-action-hover">
                    Update Password
                  </Button>
                </div>
              </div>

              <div className="rounded-[10px] border border-line bg-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[13px] font-medium text-ink">Two-Factor Authentication</h3>
                    <p className="mt-0.5 text-[11px] text-ink-2">Add an extra layer of security</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="max-w-xl space-y-6">
              <div>
                <h2 className="text-[15px] font-medium text-ink">Appearance</h2>
                <p className="mt-1 text-[12px] text-ink-2">Customize the look and feel</p>
              </div>

              <div className="rounded-[10px] border border-line bg-white p-5">
                <h3 className="text-[13px] font-medium text-ink">Theme</h3>
                <div className="mt-3 flex gap-3">
                  {["Light", "Dark", "System"].map((theme) => (
                    <button
                      key={theme}
                      className={cn(
                        "rounded-lg border px-4 py-2 text-[12px] font-medium transition-colors",
                        theme === "Light"
                          ? "border-brand bg-brand-soft text-brand"
                          : "border-line text-ink-2 hover:border-ai-soft"
                      )}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "integrations" && (
            <div className="max-w-xl space-y-6">
              <div>
                <h2 className="text-[15px] font-medium text-ink">Integrations</h2>
                <p className="mt-1 text-[12px] text-ink-2">Connect external services</p>
              </div>

              <div className="space-y-3">
                {[
                  { name: "Microsoft Excel", status: "Connected", description: "Import data from Excel files" },
                  { name: "Google Drive", status: "Not connected", description: "Sync files from Google Drive" },
                  { name: "Slack", status: "Not connected", description: "Send notifications to Slack" },
                ].map((integration, i) => (
                  <div key={i} className="rounded-[10px] border border-line bg-white p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-[13px] font-medium text-ink">{integration.name}</h3>
                        <p className="mt-0.5 text-[11px] text-ink-2">{integration.description}</p>
                      </div>
                      <Button
                        variant={integration.status === "Connected" ? "outline" : "default"}
                        size="sm"
                        className={cn(
                          integration.status === "Connected"
                            ? "border-line"
                            : "bg-brand text-white hover:bg-action-hover"
                        )}
                      >
                        {integration.status === "Connected" ? "Disconnect" : "Connect"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
