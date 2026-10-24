import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Conversation } from '../../types'
import { useAppStore } from '../../store/useAppStore'
import { Avatar } from '../common/Avatar'
import { useAnnounce } from '../common/AnnounceContext'
import { RelativeTime } from '../common/RelativeTime'
import { UserSafetyActions } from '../users/UserSafetyActions'
import { MentionText } from '../common/MentionText'
import { MentionTextarea } from '../common/MentionTextarea'
import { hasBlocked, isBlockedEitherWay, userById } from '../../lib/selectors'

export function MessageThread({ conversation }: { conversation: Conversation }) {
  const users = useAppStore((state) => state.users)
  const currentUserId = useAppStore((state) => state.currentUserId)
  const blocks = useAppStore((state) => state.blocks)
  const sendMessage = useAppStore((state) => state.sendMessage)
  const announce = useAnnounce()
  const navigate = useNavigate()
  const [draft, setDraft] = useState('')
  const logRef = useRef<HTMLDivElement>(null)

  // Show the latest message when a conversation opens and whenever one is added.
  const messageCount = conversation.messages.length
  useEffect(() => {
    const log = logRef.current
    if (log) log.scrollTop = log.scrollHeight
  }, [conversation.id, messageCount])

  if (!currentUserId) return null

  const otherParticipants = conversation.participantIds.filter((id) => id !== currentUserId)
  const isDirect = conversation.type === 'dm'
  const dmBlocked = isDirect && otherParticipants.some((id) => isBlockedEitherWay(blocks, currentUserId, id))
  // Messages from people you've blocked stay hidden in group chats.
  const visibleMessages = conversation.messages.filter((m) => !hasBlocked(blocks, currentUserId, m.senderId))
  const heading =
    conversation.type === 'group' ? conversation.name || 'Group chat' : userById(users, otherParticipants[0])?.name ?? 'Direct message'

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!currentUserId || !draft.trim()) return
    sendMessage(conversation.id, currentUserId, draft)
    setDraft('')
    announce('Message sent')
    // The Send button disables itself once the draft is empty, so put focus back in the box.
    document.getElementById(`thread-${conversation.id}`)?.focus()
  }

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-slate-200 p-4">
        <h2 tabIndex={-1} data-route-focus className="font-semibold text-slate-900 focus:outline-none">
          {heading}
        </h2>
        {conversation.type === 'group' ? (
          <>
            {conversation.description && <p className="text-sm text-slate-600">{conversation.description}</p>}
            <p className="mt-1 text-xs text-slate-600">
              With{' '}
              {otherParticipants.map((id, index) => (
                <span key={id}>
                  <Link to={`/profile/${id}`} className="underline underline-offset-2">
                    {userById(users, id)?.name}
                  </Link>
                  {index < otherParticipants.length - 1 ? ', ' : ''}
                </span>
              ))}
            </p>
          </>
        ) : (
          <div className="-ml-2 flex flex-wrap items-center">
            <Link
              to={`/profile/${otherParticipants[0]}`}
              className="inline-flex min-h-[44px] items-center px-2 text-sm text-brand-700 hover:underline"
            >
              View profile
            </Link>
            <UserSafetyActions
              userId={otherParticipants[0]}
              userName={heading}
              onBlocked={() => navigate('/messages')}
            />
          </div>
        )}
      </header>

      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        aria-label={`Messages with ${heading}`}
        // Focusable so keyboard users can scroll it.
        tabIndex={0}
        className="max-h-[60vh] min-h-[12rem] flex-1 space-y-3 overflow-y-auto p-4 focus-visible:-outline-offset-2"
      >
        {visibleMessages.length === 0 && <p className="text-sm text-slate-600">No messages yet. Say hello!</p>}
        {visibleMessages.map((message) => {
          const sender = userById(users, message.senderId)
          const isMe = message.senderId === currentUserId
          const nameShown = conversation.type === 'group' && !isMe
          return (
            <div key={message.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
              <Avatar id={message.senderId} name={sender?.name ?? ''} size="sm" />
              <div className={`max-w-[75%] rounded-xl px-3 py-2 ${isMe ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-900'}`}>
                {nameShown ? (
                  <p className="mb-0.5 text-xs font-medium opacity-80">{sender?.name}</p>
                ) : (
                  <span className="sr-only">{isMe ? 'You' : sender?.name}: </span>
                )}
                <MentionText body={message.body} className={isMe ? 'text-white' : 'text-slate-900'} onDark={isMe} />
                <p className={`mt-1 text-right text-xs ${isMe ? 'text-brand-100' : 'text-slate-600'}`}>
                  <RelativeTime iso={message.createdAt} />
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {dmBlocked ? (
        <p className="border-t border-slate-200 p-4 text-sm text-slate-600">You can't send messages in this conversation.</p>
      ) : (
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
      )}
    </div>
  )
}
