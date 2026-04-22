'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useGame } from '@/lib/game-context'
import {
  PlusCircle,
  PlayCircle,
  Users,
  History,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'

const navItems = [
  { href: '/nova-partida', label: 'Nova Partida', icon: PlusCircle },
  { href: '/partida', label: 'Partida Ativa', icon: PlayCircle },
  { href: '/jogadores', label: 'Jogadores', icon: Users },
  { href: '/historico', label: 'Historico', icon: History },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { activeMatch } = useGame()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen overflow-hidden border-r border-emerald-950/60 bg-gradient-to-b from-[#04120d] via-[#071a13] to-[#030b08] text-white shadow-2xl transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.12),_transparent_35%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,215,0,0.04),transparent_18%,transparent_82%,rgba(255,215,0,0.04))]" />

      <div className="relative flex h-full flex-col">
        <div className="border-b border-emerald-900/40 px-4 py-4">
          <div className={cn('flex items-center', collapsed ? 'justify-center' : 'justify-between gap-3')}>
            {!collapsed ? (
              <>
                <div className="flex min-w-0 items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-xl border border-yellow-500/40 bg-black/20 shadow-[0_0_18px_rgba(234,179,8,0.18)]">
                    <img
                      src="/iconezanchet.png"
                      alt="Pontinho do Zanchet"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <h1 className="text-sm font-bold tracking-wide text-yellow-300 drop-shadow">
                      Pontinho Zanchet
                    </h1>
                  </div>
                </div>

                <button
                  onClick={onToggle}
                  className="rounded-lg p-2 text-yellow-300 transition hover:bg-white/5"
                  title="Recolher menu"
                >
                  <PanelLeftClose className="h-5 w-5" />
                </button>
              </>
            ) : (
              <button
                onClick={onToggle}
                className="rounded-lg p-2 text-yellow-300 transition hover:bg-white/5"
                title="Abrir menu"
              >
                <PanelLeftOpen className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-3 py-6">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href === '/' && pathname === '/')
            const isPartidaAtiva = item.href === '/partida'
            const hasActiveMatch = activeMatch !== null

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'group flex items-center rounded-xl border text-sm font-semibold transition-all duration-200',
                  collapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3',
                  isActive
                    ? 'border-yellow-400/40 bg-gradient-to-r from-emerald-500 to-emerald-600 text-black shadow-[0_0_20px_rgba(34,197,94,0.28)]'
                    : 'border-transparent text-zinc-100 hover:border-yellow-500/20 hover:bg-white/[0.04] hover:text-yellow-200',
                  isPartidaAtiva && hasActiveMatch && !isActive && 'ring-1 ring-emerald-400/40'
                )}
              >
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-black/15'
                      : 'bg-white/[0.04] group-hover:bg-yellow-500/10'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5',
                      isActive ? 'text-black' : 'text-yellow-300'
                    )}
                  />
                </div>

                {!collapsed && <span className="flex-1 tracking-wide">{item.label}</span>}

                {!collapsed && isPartidaAtiva && hasActiveMatch && (
                  <span
                    className={cn(
                      'h-2.5 w-2.5 rounded-full',
                      isActive ? 'bg-black' : 'bg-emerald-400 animate-pulse'
                    )}
                  />
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}