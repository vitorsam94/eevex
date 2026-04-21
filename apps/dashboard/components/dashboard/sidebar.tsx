'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@eevex/ui'
import {
  LayoutDashboard,
  CalendarDays,
  Ticket,
  Users,
  BarChart3,
  Settings,
  Link2,
  Package,
  ScanLine,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Visão geral' },
  { href: '/dashboard/eventos', icon: CalendarDays, label: 'Eventos' },
  { href: '/dashboard/ingressos', icon: Ticket, label: 'Ingressos' },
  { href: '/dashboard/links', icon: Link2, label: 'Links de compra' },
  { href: '/dashboard/produtos', icon: Package, label: 'Produtos adicionais' },
  { href: '/dashboard/participantes', icon: Users, label: 'Participantes' },
  { href: '/dashboard/checkin', icon: ScanLine, label: 'Check-in' },
  { href: '/dashboard/relatorios', icon: BarChart3, label: 'Relatórios' },
  { href: '/dashboard/configuracoes', icon: Settings, label: 'Configurações' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 bg-bg-elev border-r border-border flex flex-col min-h-screen">
      <div className="px-4 py-5 border-b border-border">
        <span className="font-heading font-semibold text-lg text-fg">Eevex</span>
        <span className="ml-2 font-mono text-[9px] uppercase tracking-widest text-fg-dim">
          Organizador
        </span>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-fg-muted hover:text-fg hover:bg-bg-elev-2',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
