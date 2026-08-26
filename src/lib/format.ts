const dateFmt = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
const timeFmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' })
const shortDateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
const relativeFmt = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' })

export function formatEventDate(iso: string): string {
  return dateFmt.format(new Date(iso))
}

export function formatTime(iso: string): string {
  return timeFmt.format(new Date(iso))
}

export function formatEventRange(startIso: string, endIso: string): string {
  return `${formatEventDate(startIso)} · ${formatTime(startIso)} – ${formatTime(endIso)}`
}

export function formatShortDate(iso: string): string {
  return shortDateFmt.format(new Date(iso))
}

export function formatRelativeTime(iso: string, nowIso: string): string {
  const diffMs = new Date(iso).getTime() - new Date(nowIso).getTime()
  const diffMinutes = Math.round(diffMs / 60000)
  const diffHours = Math.round(diffMinutes / 60)
  const diffDays = Math.round(diffHours / 24)

  if (Math.abs(diffMinutes) < 60) return relativeFmt.format(diffMinutes, 'minute')
  if (Math.abs(diffHours) < 24) return relativeFmt.format(diffHours, 'hour')
  if (Math.abs(diffDays) < 30) return relativeFmt.format(diffDays, 'day')
  return formatShortDate(iso)
}

export function formatCurrency(amount: number): string {
  if (amount === 0) return 'Free'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}
