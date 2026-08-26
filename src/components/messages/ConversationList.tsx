import { NavLink } from 'react-router-dom'
import type { Conversation, User } from '../../types'
import { useAppStore } from '../../store/useAppStore'
import { Avatar } from '../common/Avatar'
import { userById } from '../../lib/selectors'
import { formatRelativeTime } from '../../lib/format'

function conversationLabel(conversation: Conversation, currentUserId: string, users: User[]) {
  if (conversation.type === 'group') return conversation.name || 'Group chat'
  const otherId = conversation.participantIds.find((id) => id !== currentUserId)
  return userById(users, otherId)?.name ?? 'Direct message'
}

export function ConversationList({ conversations }: { conversations: Conversation[] }) {
  const users = useAppStore((state) => state.users)
  const currentUserId = useAppStore((state) => state.currentUserId)
  const now = new Date().toISOString()

  const sorted = [...conversations].sort((a, b) => {
    const aLast = a.messages.at(-1)?.createdAt ?? a.createdAt
    const bLast = b.messages.at(-1)?.createdAt ?? b.createdAt
    return new Date(bLast).getTime() - new Date(aLast).getTime()
  })

  if (!currentUserId) return null

  return (
    <nav aria-label="Conversations" className="divide-y divide-slate-100">
      {sorted.map((conversation) => {
        const label = conversationLabel(conversation, currentUserId, users)
        const lastMessage = conversation.messages.at(-1)
        const avatarId = conversation.type === 'group' ? conversation.id : conversation.participantIds.find((id) => id !== currentUserId) ?? conversation.id

        return (
          <NavLink
            key={conversation.id}
            to={`/messages/${conversation.id}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 text-left hover:bg-slate-50 ${isActive ? 'bg-brand-50' : ''}`
            }
          >
            <Avatar id={avatarId} name={label} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate font-medium text-slate-900">{label}</span>
                {lastMessage && (
                  <span className="shrink-0 text-xs text-slate-500">{formatRelativeTime(lastMessage.createdAt, now)}</span>
                )}
              </div>
              <p className="truncate text-sm text-slate-500">
                {lastMessage ? lastMessage.body : 'No messages yet — say hello!'}
              </p>
            </div>
          </NavLink>
        )
      })}
    </nav>
  )
}
