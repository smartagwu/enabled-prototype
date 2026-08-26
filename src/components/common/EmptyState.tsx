import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="card flex flex-col items-center gap-2 px-6 py-10 text-center">
      <p className="font-semibold text-slate-900">{title}</p>
      {description && <p className="max-w-sm text-sm text-slate-600">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
