import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-heading font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-white hover:bg-[#6A4AEE] active:scale-[0.98]',
        secondary:
          'bg-bg-elev border border-border text-fg hover:bg-bg-soft hover:border-border-strong',
        accent:
          'bg-accent text-[#0A0A0F] hover:bg-[#00CCa4] font-semibold',
        ghost:
          'text-fg-muted hover:text-fg hover:bg-bg-elev',
        danger:
          'bg-danger text-white hover:bg-[#E03052]',
        outline:
          'border border-border text-fg hover:border-border-strong hover:bg-bg-elev',
      },
      size: {
        sm: 'h-8 px-3 text-sm rounded-[6px]',
        md: 'h-10 px-4 text-sm rounded-[10px]',
        lg: 'h-12 px-6 text-base rounded-[10px]',
        xl: 'h-14 px-8 text-lg rounded-[12px]',
        icon: 'h-10 w-10 rounded-[10px]',
        'icon-sm': 'h-8 w-8 rounded-[6px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
