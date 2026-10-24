import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { findMentionCandidates } from '../../lib/mentions'
import { Avatar } from './Avatar'

interface MentionTextareaProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  excludeUserId?: string
  hideLabel?: boolean
}

const MENTION_TRIGGER = /(?:^|\s)@([^\s@]*)$/

export function MentionTextarea({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  excludeUserId,
  hideLabel = false,
}: MentionTextareaProps) {
  const users = useAppStore((state) => state.users.filter((u) => u.id !== excludeUserId))
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [query, setQuery] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const candidates = query !== null ? findMentionCandidates(users, query) : []
  const listboxId = `${id}-mention-listbox`
  const hintId = `${id}-mention-hint`
  const listOpen = query !== null && candidates.length > 0

  function syncMentionQuery(nextValue: string, cursor: number) {
    const before = nextValue.slice(0, cursor)
    const match = before.match(MENTION_TRIGGER)
    if (match) {
      setQuery(match[1])
      setActiveIndex(0)
    } else {
      setQuery(null)
    }
  }

  function handleChange(nextValue: string) {
    onChange(nextValue)
    const cursor = textareaRef.current?.selectionStart ?? nextValue.length
    syncMentionQuery(nextValue, cursor)
  }

  function selectCandidate(name: string) {
    const textarea = textareaRef.current
    const cursor = textarea?.selectionStart ?? value.length
    const before = value.slice(0, cursor)
    const after = value.slice(cursor)
    const replaced = before.replace(MENTION_TRIGGER, (whole) => (whole.startsWith(' ') ? ' ' : '') + `@${name} `)
    const nextValue = replaced + after
    onChange(nextValue)
    setQuery(null)
    requestAnimationFrame(() => {
      const nextCursor = replaced.length
      textarea?.focus()
      textarea?.setSelectionRange(nextCursor, nextCursor)
    })
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (query === null || candidates.length === 0) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((i) => (i + 1) % candidates.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((i) => (i - 1 + candidates.length) % candidates.length)
    } else if (event.key === 'Enter') {
      // Enter (not Tab) picks a suggestion, so Tab keeps moving through the page as normal.
      event.preventDefault()
      selectCandidate(candidates[activeIndex].name)
    } else if (event.key === 'Escape') {
      setQuery(null)
    }
  }

  return (
    <div className="relative">
      <label htmlFor={id} className={hideLabel ? 'sr-only' : 'label'}>
        {label}
      </label>
      <textarea
        id={id}
        ref={textareaRef}
        className="input"
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-expanded={listOpen}
        aria-haspopup="listbox"
        aria-controls={listOpen ? listboxId : undefined}
        aria-autocomplete="list"
        aria-describedby={hintId}
        aria-activedescendant={listOpen && candidates[activeIndex] ? `${listboxId}-${candidates[activeIndex].id}` : undefined}
      />
      <p id={hintId} className="mt-1 text-xs text-slate-600">
        Type @ to mention someone.
      </p>
      <p role="status" aria-live="polite" className="sr-only">
        {query === null
          ? ''
          : candidates.length === 0
            ? 'No matching people'
            : `${candidates.length} ${candidates.length === 1 ? 'suggestion' : 'suggestions'} available. Use the up and down arrow keys to review and Enter to select.`}
      </p>
      {listOpen && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Mention suggestions"
          className="absolute z-20 mt-1 w-full max-w-xs overflow-hidden rounded-lg border border-slate-200 bg-surface shadow-lg"
        >
          {candidates.map((user, index) => (
            // Options are driven from the textarea (focus never leaves it), so they are not tab stops.
            <li
              key={user.id}
              id={`${listboxId}-${user.id}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => selectCandidate(user.name)}
              className={`flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm ${
                index === activeIndex ? 'bg-brand-50' : 'hover:bg-slate-50'
              }`}
            >
              <Avatar id={user.id} name={user.name} size="sm" />
              <span>
                <span className="block font-medium text-slate-900">{user.name}</span>
                <span className="block text-xs text-slate-600">{user.headline}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
