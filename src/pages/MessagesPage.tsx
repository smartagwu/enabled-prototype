import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { ConversationList } from '../components/messages/ConversationList'
import { MessageThread } from '../components/messages/MessageThread'
import { NewMessageModal } from '../components/messages/NewMessageModal'
import { CreateGroupModal } from '../components/groups/CreateGroupModal'
import { EmptyState } from '../components/common/EmptyState'
import { hasBlocked } from '../lib/selectors'

export function MessagesPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const currentUserId = useAppStore((state) => state.currentUserId)
  const allConversations = useAppStore((state) =>
    state.conversations.filter((c) => currentUserId && c.participantIds.includes(currentUserId)),
  )
  const blocks = useAppStore((state) => state.blocks)
  const [showNewMessage, setShowNewMessage] = useState(false)
  const [showNewGroup, setShowNewGroup] = useState(false)

  // A direct conversation with someone you've blocked is hidden.
  const conversations = allConversations.filter(
    (c) => !(c.type === 'dm' && currentUserId && c.participantIds.some((id) => hasBlocked(blocks, currentUserId, id))),
  )

  const activeConversation = conversations.find((c) => c.id === conversationId)

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary" onClick={() => setShowNewGroup(true)}>
            New group
          </button>
          <button type="button" className="btn-primary" onClick={() => setShowNewMessage(true)}>
            New message
          </button>
        </div>
      </div>

      <div className="card grid overflow-hidden sm:grid-cols-[18rem_1fr]" style={{ minHeight: '32rem' }}>
        <div className={`border-slate-200 sm:border-r ${conversationId ? 'hidden sm:block' : ''}`}>
          {conversations.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="No conversations yet"
                description="Follow someone and start a direct message, or create a group."
              />
            </div>
          ) : (
            <ConversationList conversations={conversations} />
          )}
        </div>
        <div className={conversationId ? '' : 'hidden sm:block'}>
          {activeConversation ? (
            <div className="flex h-full flex-col">
              <Link to="/messages" className="btn-ghost m-2 w-fit sm:hidden">
                ← Back to conversations
              </Link>
              <MessageThread key={activeConversation.id} conversation={activeConversation} />
            </div>
          ) : (
            <div className="flex h-full flex-col">
              {conversationId && (
                <Link to="/messages" className="btn-ghost m-2 w-fit sm:hidden">
                  ← Back to conversations
                </Link>
              )}
              <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-slate-600">
                Select a conversation, or start a new message.
              </div>
            </div>
          )}
        </div>
      </div>

      {showNewMessage && <NewMessageModal onClose={() => setShowNewMessage(false)} />}
      {showNewGroup && <CreateGroupModal onClose={() => setShowNewGroup(false)} />}
    </div>
  )
}
