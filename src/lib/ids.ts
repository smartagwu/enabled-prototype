export function uid(prefix = ''): string {
  const raw =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
  return prefix ? `${prefix}_${raw}` : raw
}

export function ticketCode(): string {
  return uid().slice(0, 8).toUpperCase()
}
