import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 font-mono text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded',
  {
    variants: {
      variant: {
        default: 'bg-bg-soft text-fg-muted',
        primary: 'bg-primary/10 text-primary',
        accent: 'bg-accent/10 text-accent',
        warn: 'bg-warn/10 text-warn',
        danger: 'bg-danger/10 text-danger',
        success: 'bg-accent/10 text-accent',
        live: 'bg-danger/10 text-danger',
        draft: 'bg-bg-soft text-fg-dim',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
