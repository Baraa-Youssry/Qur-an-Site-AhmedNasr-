import { cn } from '../../utils/formatters'

export default function GlassCard({ children, className, hover = true, ...props }) {
  return (
    <div
      className={cn(
        'glass-card',
        !hover && 'hover:bg-white/6 dark:hover:bg-white/6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
