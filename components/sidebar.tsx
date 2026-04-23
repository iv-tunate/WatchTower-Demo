'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  const navItems = [
    { name: 'Overview', icon: '📊', href: '/' },
    { name: 'Traces', icon: '📍', href: '/traces' },
    { name: 'Logs', icon: '📝', href: '/logs' },
    { name: 'Metrics', icon: '📈', href: '/metrics' },
    { name: 'Services', icon: '🔗', href: '/services' },
    { name: 'Alerts', icon: '⚠️', href: '/alerts' },
  ]

  const bottomItems = [
    { name: 'Sample Data', icon: '📥', href: '/sample-data' },
    { name: 'Settings', icon: '⚙️', href: '/settings' },
  ]

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[220px] bg-bg-panel border-r border-border flex flex-col z-100">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-accent rounded flex items-center justify-center text-bg-base text-sm font-bold">
            W
          </div>
          <div>
            <div className="font-display text-xl font-black text-accent tracking-tight">WatchTower</div>
            <div className="text-[10px] text-text-dim uppercase tracking-widest mt-0.5">Observatory</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {/* Main Section */}
        <div className="px-4 py-2 text-[9px] text-text-dim uppercase tracking-[2px] mb-2">Platform</div>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 px-4 py-2 mx-2 rounded-md text-xs transition-all border-l-2 ${
              isActive(item.href)
                ? 'bg-accent-dim text-accent border-l-accent'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover border-l-transparent'
            }`}
          >
            <span className="w-4 h-4 flex items-center justify-center text-sm">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}

        {/* Observability Section */}
        <div className="px-4 py-3 mt-4 text-[9px] text-text-dim uppercase tracking-[2px] mb-2">Observability</div>
        <div className="px-4 py-2 mx-2 rounded text-[11px] text-text-secondary">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block w-2 h-2 rounded-full bg-success animate-pulse"></span>
            <span>System Healthy</span>
          </div>
          <div className="text-[10px] text-text-dim">All services operational</div>
        </div>
      </nav>

      {/* Bottom Items */}
      <div className="border-t border-border p-4 space-y-1">
        {bottomItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 px-3 py-2 rounded text-xs transition-all ${
              isActive(item.href)
                ? 'bg-accent-dim text-accent'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
            }`}
          >
            <span className="text-sm">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </div>
    </aside>
  )
}
