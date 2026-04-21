import * as React from 'react'
import { cn } from '../lib/utils'

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, id, checked, onChange, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => {
            const event = { target: { checked: !checked } } as React.ChangeEvent<HTMLInputElement>
            onChange?.(event)
          }}
          className={cn(
            'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent',
            'transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            checked ? 'bg-primary' : 'bg-bg-soft',
            className,
          )}
          {...props}
        >
          <span
            className={cn(
              'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm',
              'transition-transform duration-200',
              checked ? 'translate-x-4' : 'translate-x-0',
            )}
          />
        </button>
        {label && (
          <label htmlFor={inputId} className="text-sm text-fg cursor-pointer select-none">
            {label}
          </label>
        )}
        <input ref={ref} type="checkbox" id={inputId} className="sr-only" checked={checked} onChange={onChange} {...props} />
      </div>
    )
  },
)
Switch.displayName = 'Switch'

export { Switch }
