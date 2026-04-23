'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { TopBar } from '@/components/topbar'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    autoRefresh: true,
    refreshInterval: 30,
    theme: 'dark',
    notifications: true,
    alertEmail: 'admin@example.com',
  })

  const handleToggle = (key: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleChange = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleRefresh = () => {
    console.log('Refreshing...')
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <TopBar title="Settings" onTimeRangeChange={() => {}} onRefresh={handleRefresh} />

      <main className="md:ml-[220px] mt-[52px] p-4 md:p-6 pb-24 md:pb-0">
        <div className="max-w-2xl">
          {/* General Settings */}
          <div className="bg-bg-card border border-border rounded-lg p-6 mb-6">
            <h2 className="font-display text-base font-semibold text-text-primary mb-5">General Settings</h2>

            <div className="space-y-5">
              {/* Auto Refresh */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-text-primary text-sm">Auto Refresh</div>
                  <p className="text-[11px] text-text-dim mt-1">Automatically refresh data at regular intervals</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={settings.autoRefresh} onChange={() => handleToggle('autoRefresh')} className="sr-only peer" />
                  <div className="w-11 h-6 bg-bg-panel peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-dim peer-checked:bg-accent after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>

              {/* Refresh Interval */}
              {settings.autoRefresh && (
                <div>
                  <label className="text-sm font-semibold text-text-primary block mb-2">Refresh Interval (seconds)</label>
                  <input
                    type="number"
                    value={settings.refreshInterval}
                    onChange={(e) => handleChange('refreshInterval', parseInt(e.target.value))}
                    min="10"
                    max="300"
                    className="w-full px-3 py-2 bg-bg-panel border border-border rounded text-text-primary focus:outline-none focus:border-accent transition-colors text-sm"
                  />
                </div>
              )}

              {/* Theme */}
              <div>
                <label className="text-sm font-semibold text-text-primary block mb-2">Theme</label>
                <select
                  value={settings.theme}
                  onChange={(e) => handleChange('theme', e.target.value)}
                  className="w-full px-3 py-2 bg-bg-panel border border-border rounded text-text-primary focus:outline-none focus:border-accent transition-colors text-sm"
                >
                  <option value="dark">Dark (Default)</option>
                  <option value="light">Light</option>
                  <option value="auto">Auto (System Preference)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-bg-card border border-border rounded-lg p-6 mb-6">
            <h2 className="font-display text-base font-semibold text-text-primary mb-5">Notifications</h2>

            <div className="space-y-5">
              {/* Enable Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-text-primary text-sm">Enable Notifications</div>
                  <p className="text-[11px] text-text-dim mt-1">Receive alerts and important updates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={settings.notifications} onChange={() => handleToggle('notifications')} className="sr-only peer" />
                  <div className="w-11 h-6 bg-bg-panel peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-dim peer-checked:bg-accent after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>

              {/* Alert Email */}
              {settings.notifications && (
                <div>
                  <label className="text-sm font-semibold text-text-primary block mb-2">Alert Email</label>
                  <input
                    type="email"
                    value={settings.alertEmail}
                    onChange={(e) => handleChange('alertEmail', e.target.value)}
                    className="w-full px-3 py-2 bg-bg-panel border border-border rounded text-text-primary focus:outline-none focus:border-accent transition-colors text-sm"
                  />
                </div>
              )}
            </div>
          </div>

          {/* API & Integration */}
          <div className="bg-bg-card border border-border rounded-lg p-6 mb-6">
            <h2 className="font-display text-base font-semibold text-text-primary mb-5">API & Integration</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-text-primary block mb-2">API Key</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value="••••••••••••••••"
                    readOnly
                    className="flex-1 px-3 py-2 bg-bg-panel border border-border rounded text-text-secondary focus:outline-none text-sm"
                  />
                  <button className="px-4 py-2 bg-accent-dim text-accent border border-accent rounded text-[11px] font-semibold hover:bg-opacity-20 transition-all">
                    Regenerate
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-[10px] text-text-dim mb-3 uppercase tracking-widest">Integrations</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-bg-panel rounded">
                    <span className="text-[11px] text-text-primary">OpenSearch Cluster</span>
                    <span className="text-[10px] text-success">✓ Connected</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-bg-panel rounded">
                    <span className="text-[11px] text-text-primary">Slack Notifications</span>
                    <button className="text-[10px] text-accent hover:underline">Configure</button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-bg-panel rounded">
                    <span className="text-[11px] text-text-primary">PagerDuty</span>
                    <button className="text-[10px] text-accent hover:underline">Configure</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="bg-bg-card border border-border rounded-lg p-6">
            <h2 className="font-display text-base font-semibold text-text-primary mb-4">About</h2>
            <div className="space-y-3 text-[11px] text-text-secondary">
              <div className="flex justify-between">
                <span>WatchTower Version</span>
                <span className="text-text-primary">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>Build Date</span>
                <span className="text-text-primary">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Environment</span>
                <span className="text-text-primary">Production</span>
              </div>
              <div className="pt-3 border-t border-border">
                <p>WatchTower is an enterprise-grade observability platform built for monitoring distributed systems at scale.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
