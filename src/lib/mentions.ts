import type { User } from '../types'

/** Users whose name matches the in-progress @query, most relevant first. */
export function findMentionCandidates(users: User[], query: string): User[] {
  const q = query.trim().toLowerCase()
  if (!q) return users.slice(0, 6)
  return users.filter((u) => u.name.toLowerCase().includes(q)).slice(0, 6)
}

/** Recomputes mentioned user ids by scanning body text for "@Full Name" occurrences. */
export function extractMentionIds(body: string, users: User[]): string[] {
  const found = new Set<string>()
  const byLongestName = [...users].sort((a, b) => b.name.length - a.name.length)
  for (const user of byLongestName) {
    if (body.includes(`@${user.name}`)) found.add(user.id)
  }
  return Array.from(found)
}

export type BodySegment = { text: string; userId?: string }

/** Splits body text into plain-text and @mention segments for rendering as links. */
export function segmentBodyWithMentions(body: string, users: User[]): BodySegment[] {
  const mentionable = [...users].sort((a, b) => b.name.length - a.name.length)
  if (mentionable.length === 0) return [{ text: body }]

  const pattern = mentionable.map((u) => `@${escapeRegExp(u.name)}`).join('|')
  const regex = new RegExp(`(${pattern})`, 'g')
  const nameToId = new Map(mentionable.map((u) => [`@${u.name}`, u.id]))

  const segments: BodySegment[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = regex.exec(body)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: body.slice(lastIndex, match.index) })
    }
    segments.push({ text: match[0], userId: nameToId.get(match[0]) })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < body.length) {
    segments.push({ text: body.slice(lastIndex) })
  }
  return segments
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
