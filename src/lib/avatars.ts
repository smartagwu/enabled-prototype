const PALETTE = [
  { bg: 'bg-rose-100', text: 'text-rose-800', ring: 'ring-rose-200' },
  { bg: 'bg-amber-100', text: 'text-amber-800', ring: 'ring-amber-200' },
  { bg: 'bg-emerald-100', text: 'text-emerald-800', ring: 'ring-emerald-200' },
  { bg: 'bg-sky-100', text: 'text-sky-800', ring: 'ring-sky-200' },
  { bg: 'bg-violet-100', text: 'text-violet-800', ring: 'ring-violet-200' },
  { bg: 'bg-fuchsia-100', text: 'text-fuchsia-800', ring: 'ring-fuchsia-200' },
  { bg: 'bg-teal-100', text: 'text-teal-800', ring: 'ring-teal-200' },
  { bg: 'bg-orange-100', text: 'text-orange-800', ring: 'ring-orange-200' },
]

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

export function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

export function paletteFor(id: string) {
  return PALETTE[hashString(id) % PALETTE.length]
}
