import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Conversation } from '../../types'
import { useAppStore } from '../../store/useAppStore'
import { Avatar } from '../common/Avatar'
import { MentionText } from '../common/MentionText'
import { MentionTextarea } from '../common/MentionTextarea'
import { userById } from '../../lib/selectors'
import { formatRelativeTime } from '../../lib/format'

export function MessageThread({ conversation }: { conversation: Conversation }) {
  const users = useAppStore((state) => state.users)
  const currentUserId = useAppStore((state) => state.currentUserId)
  const sendMessage = useAppStore((state) => state.sendMessage)
  const [draft, setDraft] = useState('')

  if (!currentUserId) return null

  const otherParticipants = conversation.participantIds.filter((id) => id !== currentUserId)
  const heading =
    conversation.type === 'group' ? conversation.name || 'Group chat' : userById(users, otherParticipants[0])?.name ?? 'Direct message'

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!currentUserId || !draft.trim()) return
    sendMessage(conversation.id, currentUserId, draft)
    setDraft('')
  }

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-slate-200 p-4">
        <h2 className="font-semibold text-slate-900">{heading}</h2>
        {conversation.type === 'group' ? (
          <>
            {conversation.description && <p className="text-sm text-slate-600">{conversation.description}</p>}
            <p className="mt-1 text-xs text-slate-500">
              With{' '}
              {otherParticipants.map((id, index) => (
                <span key={id}>
                  <Link to={`/profile/${id}`} className="hover:underline">
                    {userById(users, id)?.name}
                  </Link>
                  {index < otherParticipants.length - 1 ? ', ' : ''}
                </span>
              ))}
            </p>
          </>
        ) : (
          <Link to={`/profile/${otherParticipants[0]}`} className="text-sm text-brand-700 hover:underline">
            View profile
          </Link>
        )}
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {conversation.messages.length === 0 && (
          <p className="text-sm text-slate-500">No messages yet. Say hello!</p>
        )}
        {conversation.messages.map((message) => {
          const sender = userById(users, message.senderId)
          const isMe = message.senderId === currentUserId
          const now = new Date().toISOString()
          return (
            <div key={message.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
              <Avatar id={message.senderId} name={sender?.name ?? ''} size="sm" />
              <div className={`max-w-[75%] rounded-xl px-3 py-2 ${isMe ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-900'}`}>
                {conversation.type === 'group' && !isMe && (
                  <p className="mb-0.5 text-xs font-medium opacity-80">{sender?.name}</p>
                )}
                <MentionText body={message.body} className={isMe ? 'text-white' : 'text-slate-900'} />
                <p className={`mt-1 text-right text-[10px] ${isMe ? 'text-brand-100' : 'text-slate-400'}`}>
                  {formatRelativeTime(message.createdAt, now)}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-slate-200 p-3">
        <MentionTextarea
          id={`thread-${conversation.id}`}
          label="Write a message"
          value={draft}
          onChange={setDraft}
          placeholder="Type a message… use @ to mention someone"
          rows={2}
          excludeUserId={currentUserId}
          hideLabel
        />
        <div className="mt-2 flex justify-end">
          <button type="submit" className="btn-primary" disabled={!draft.trim()}>
            Send
          </button>
        </div>
      </form>
    </div>
  )
}
