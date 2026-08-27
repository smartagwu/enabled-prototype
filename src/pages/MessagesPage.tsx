import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { ConversationList } from '../components/messages/ConversationList'
import { MessageThread } from '../components/messages/MessageThread'
import { NewMessageModal } from '../components/messages/NewMessageModal'
import { CreateGroupModal } from '../components/groups/CreateGroupModal'
import { EmptyState } from '../components/common/EmptyState'

export function MessagesPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const currentUserId = useAppStore((state) => state.currentUserId)
  const conversations = useAppStore((state) =>
    state.conversations.filter((c) => currentUserId && c.participantIds.includes(currentUserId)),
  )
  const [showNewMessage, setShowNewMessage] = useState(false)
  const [showNewGroup, setShowNewGroup] = useState(false)

  const activeConversation = conversations.find((c) => c.id === conversationId)

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex items-center justify-between">
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
              <Link to="/messages" className="btn-ghost m-2 w-fit text-xs sm:hidden">
                ← Back to conversations
              </Link>
              <MessageThread conversation={activeConversation} />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-center text-sm text-slate-500">
              Select a conversation, or start a new message.
            </div>
          )}
        </div>
      </div>

      {showNewMessage && <NewMessageModal onClose={() => setShowNewMessage(false)} />}
      {showNewGroup && <CreateGroupModal onClose={() => setShowNewGroup(false)} />}
    </div>
  )
}
