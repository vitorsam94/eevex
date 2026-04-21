import * as React from 'react'
import { cn } from '../lib/utils'

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base' }

function Avatar({ className, src, alt, fallback, size = 'md', ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        'relative rounded-full bg-primary/20 overflow-hidden flex items-center justify-center shrink-0',
        sizeMap[size],
        className,
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <span className="font-heading font-medium text-primary select-none">
          {fallback ?? '?'}
        </span>
      )}
    </div>
  )
}

export { Avatar }
