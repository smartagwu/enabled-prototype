import { formatDateTime, formatRelativeTime } from '../../lib/format'

/** Relative time that exposes the absolute date and time as a tooltip and in the datetime attribute. */
export function RelativeTime({ iso, className = '' }: { iso: string; className?: string }) {
  return (
    <time dateTime={iso} title={formatDateTime(iso)} className={className}>
      {formatRelativeTime(iso, new Date().toISOString())}
    </time>
  )
}
