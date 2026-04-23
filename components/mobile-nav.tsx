'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function MobileNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const isActive = (path: string) => pathname === path

  const navItems = [
    { name: 'Overview', icon: '📊', href: '/' },
    { name: 'Traces', icon: '📍', href: '/traces' },
    { name: 'Logs', icon: '📝', href: '/logs' },
    { name: 'Metrics', icon: '📈', href: '/metrics' },
    { name: 'Services', icon: '🔗', href: '/services' },
    { name: 'Alerts', icon: '⚠️', href: '/alerts' },
    { name: 'Sample Data', icon: '📥', href: '/sample-data' },
    { name: 'Settings', icon: '⚙️', href: '/settings' },
  ]

  return (
    <>
      {/* Mobile Menu Button - visible only on small screens */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-accent text-bg-base flex items-center justify-center text-xl font-bold hover:shadow-lg transition-all"
        >
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />

          {/* Menu */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-panel border-t border-border z-40 max-h-[80vh] overflow-y-auto rounded-t-xl">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
                <div className="w-8 h-8 bg-accent rounded flex items-center justify-center text-bg-base text-sm font-bold">W</div>
                <div className="font-display text-lg font-bold text-accent">WatchTower</div>
              </div>

              <nav className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive(item.href)
                        ? 'bg-accent-dim text-accent'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm">{item.name}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  )
}
