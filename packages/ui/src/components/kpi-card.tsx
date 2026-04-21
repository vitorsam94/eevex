import * as React from 'react'
import { cn } from '../lib/utils'

interface KpiCardProps {
  label: string
  value: string | number
  delta?: string
  deltaDown?: boolean
  className?: string
}

export function KpiCard({ label, value, delta, deltaDown, className }: KpiCardProps) {
  return (
    <div
      className={cn(
        'bg-bg-elev-2 border border-border rounded-lg p-4 flex flex-col gap-1',
        className,
      )}
    >
      <span className="font-mono text-[9px] uppercase tracking-widest text-fg-dim">{label}</span>
      <span className="font-heading text-2xl font-medium tracking-tight text-fg">{value}</span>
      {delta && (
        <span
          className={cn(
            'font-mono text-[10px]',
            deltaDown ? 'text-danger' : 'text-accent',
          )}
        >
          {delta}
        </span>
      )}
    </div>
  )
}
