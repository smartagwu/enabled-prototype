import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type {
  BlockEdge,
  Conversation,
  DisplayPrefs,
  EventItem,
  FollowEdge,
  Forum,
  ForumVisibility,
  Post,
  RsvpStatus,
  Ticket,
  User,
  UserReport,
} from '../types'
import { seedConversations, seedEvents, seedFollows, seedForums, seedPosts, seedUsers } from '../data/seed'
import { uid, ticketCode } from '../lib/ids'
import { extractMentionIds } from '../lib/mentions'
import { DEFAULT_DISPLAY } from '../lib/display'
import { followEdgeBetween, followingOf, isBlockedEitherWay, pendingIncomingRequests, spotsRemaining } from '../lib/selectors'

interface AppState {
  currentUserId: string | null
  users: User[]
  follows: FollowEdge[]
  conversations: Conversation[]
  forums: Forum[]
  posts: Post[]
  events: EventItem[]
  blocks: BlockEdge[]
  reports: UserReport[]
  /** Personal display settings; deliberately kept out of resetAppData. */
  display: DisplayPrefs

  setDisplay: (patch: Partial<DisplayPrefs>) => void
  setCurrentUser: (userId: string) => void
  signOut: () => void
  resetAppData: () => void

  sendFollowRequest: (followerId: string, followeeId: string) => void
  respondToFollowRequest: (edgeId: string, accept: boolean) => void
  unfollow: (followerId: string, followeeId: string) => void

  blockUser: (blockerId: string, blockedId: string) => void
  unblockUser: (blockerId: string, blockedId: string) => void
  reportUser: (reporterId: string, reportedId: string, reason: string, details: string) => void

  sendMessage: (conversationId: string, senderId: string, body: string) => void
  startDirectConversation: (userId: string, otherUserId: string) => string
  createGroup: (creatorId: string, name: string, description: string, memberIds: string[]) => string

  createForum: (ownerId: string, title: string, topic: string, description: string, visibility: ForumVisibility) => string
  requestToJoinForum: (forumId: string, userId: string) => void
  cancelJoinRequest: (forumId: string, userId: string) => void
  respondToJoinRequest: (forumId: string, userId: string, accept: boolean) => void
  joinPublicForum: (forumId: string, userId: string) => void
  leaveForum: (forumId: string, userId: string) => void

  createPost: (authorId: string, body: string, forumId: string | null) => void
  addComment: (postId: string, authorId: string, body: string) => void
  deletePost: (postId: string, userId: string) => void
  deleteComment: (postId: string, commentId: string, userId: string) => void

  rsvpToEvent: (eventId: string, userId: string, status: RsvpStatus) => void
  cancelRsvp: (eventId: string, userId: string) => void
  /** Returns null when the event has no spots left. Quantity is capped at the spots remaining. */
  purchaseTicket: (eventId: string, userId: string, tierId: string, quantity: number) => Ticket | null
}

function freshSeed() {
  return {
    users: structuredClone(seedUsers),
    follows: structuredClone(seedFollows),
    conversations: structuredClone(seedConversations),
    forums: structuredClone(seedForums),
    posts: structuredClone(seedPosts),
    events: structuredClone(seedEvents),
    blocks: [] as BlockEdge[],
    reports: [] as UserReport[],
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUserId: null,
      ...freshSeed(),
      display: DEFAULT_DISPLAY,

      setDisplay: (patch) => set((state) => ({ display: { ...state.display, ...patch } })),
      setCurrentUser: (userId) => set({ currentUserId: userId }),
      signOut: () => set({ currentUserId: null }),
      resetAppData: () => set({ currentUserId: null, ...freshSeed() }),

      sendFollowRequest: (followerId, followeeId) => {
        if (followerId === followeeId) return
        set((state) => {
          if (isBlockedEitherWay(state.blocks, followerId, followeeId)) return state
          if (followEdgeBetween(state.follows, followerId, followeeId)) return state
          const edge: FollowEdge = {
            id: uid('f'),
            followerId,
            followeeId,
            status: 'pending',
            createdAt: new Date().toISOString(),
          }
          return { follows: [...state.follows, edge] }
        })
      },

      respondToFollowRequest: (edgeId, accept) => {
        set((state) => ({
          follows: accept
            ? state.follows.map((f) => (f.id === edgeId ? { ...f, status: 'accepted' } : f))
            : state.follows.filter((f) => f.id !== edgeId),
        }))
      },

      unfollow: (followerId, followeeId) => {
        set((state) => ({
          follows: state.follows.filter((f) => !(f.followerId === followerId && f.followeeId === followeeId)),
        }))
      },

      blockUser: (blockerId, blockedId) => {
        if (blockerId === blockedId) return
        set((state) => {
          if (state.blocks.some((b) => b.blockerId === blockerId && b.blockedId === blockedId)) return state
          return {
            blocks: [...state.blocks, { blockerId, blockedId, createdAt: new Date().toISOString() }],
            // Blocking ends any follow relationship or pending request in both directions.
            follows: state.follows.filter(
              (f) =>
                !(
                  (f.followerId === blockerId && f.followeeId === blockedId) ||
                  (f.followerId === blockedId && f.followeeId === blockerId)
                ),
            ),
          }
        })
      },

      unblockUser: (blockerId, blockedId) => {
        set((state) => ({
          blocks: state.blocks.filter((b) => !(b.blockerId === blockerId && b.blockedId === blockedId)),
        }))
      },

      reportUser: (reporterId, reportedId, reason, details) => {
        set((state) => ({
          reports: [
            ...state.reports,
            { id: uid('r'), reporterId, reportedId, reason, details: details.trim(), createdAt: new Date().toISOString() },
          ],
        }))
      },

      sendMessage: (conversationId, senderId, body) => {
        const trimmed = body.trim()
        if (!trimmed) return
        const target = get().conversations.find((c) => c.id === conversationId)
        if (
          target?.type === 'dm' &&
          target.participantIds.some((id) => id !== senderId && isBlockedEitherWay(get().blocks, senderId, id))
        ) {
          return
        }
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: [
                    ...c.messages,
                    {
                      id: uid('m'),
                      senderId,
                      body: trimmed,
                      mentions: extractMentionIds(trimmed, state.users),
                      createdAt: new Date().toISOString(),
                    },
                  ],
                }
              : c,
          ),
        }))
      },

      startDirectConversation: (userId, otherUserId) => {
        const existing = get().conversations.find(
          (c) =>
            c.type === 'dm' &&
            c.participantIds.length === 2 &&
            c.participantIds.includes(userId) &&
            c.participantIds.includes(otherUserId),
        )
        if (existing) return existing.id

        const newConversation: Conversation = {
          id: uid('c'),
          type: 'dm',
          participantIds: [userId, otherUserId],
          createdBy: userId,
          createdAt: new Date().toISOString(),
          messages: [],
        }
        set((state) => ({ conversations: [...state.conversations, newConversation] }))
        return newConversation.id
      },

      createGroup: (creatorId, name, description, memberIds) => {
        const participantIds = Array.from(new Set([creatorId, ...memberIds]))
        const newGroup: Conversation = {
          id: uid('c'),
          type: 'group',
          participantIds,
          name: name.trim(),
          description: description.trim(),
          createdBy: creatorId,
          createdAt: new Date().toISOString(),
          messages: [],
        }
        set((state) => ({ conversations: [...state.conversations, newGroup] }))
        return newGroup.id
      },

      createForum: (ownerId, title, topic, description, visibility) => {
        const newForum: Forum = {
          id: uid('fo'),
          title: title.trim(),
          topic: topic.trim(),
          description: description.trim(),
          visibility,
          ownerId,
          memberIds: [ownerId],
          joinRequests: [],
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ forums: [...state.forums, newForum] }))
        return newForum.id
      },

      requestToJoinForum: (forumId, userId) => {
        set((state) => ({
          forums: state.forums.map((f) => {
            if (f.id !== forumId) return f
            if (f.memberIds.includes(userId)) return f
            if (f.joinRequests.some((r) => r.userId === userId && r.status === 'pending')) return f
            return {
              ...f,
              joinRequests: [
                ...f.joinRequests.filter((r) => r.userId !== userId),
                { userId, status: 'pending', createdAt: new Date().toISOString() },
              ],
            }
          }),
        }))
      },

      cancelJoinRequest: (forumId, userId) => {
        set((state) => ({
          forums: state.forums.map((f) =>
            f.id === forumId
              ? { ...f, joinRequests: f.joinRequests.filter((r) => !(r.userId === userId && r.status === 'pending')) }
              : f,
          ),
        }))
      },

      respondToJoinRequest: (forumId, userId, accept) => {
        set((state) => ({
          forums: state.forums.map((f) => {
            if (f.id !== forumId) return f
            return {
              ...f,
              memberIds: accept ? Array.from(new Set([...f.memberIds, userId])) : f.memberIds,
              joinRequests: f.joinRequests.map((r) =>
                r.userId === userId ? { ...r, status: accept ? 'accepted' : 'declined' } : r,
              ),
            }
          }),
        }))
      },

      joinPublicForum: (forumId, userId) => {
        set((state) => ({
          forums: state.forums.map((f) =>
            f.id === forumId && f.visibility === 'public' && !f.memberIds.includes(userId)
              ? { ...f, memberIds: [...f.memberIds, userId] }
              : f,
          ),
        }))
      },

      leaveForum: (forumId, userId) => {
        set((state) => ({
          forums: state.forums.map((f) =>
            f.id === forumId ? { ...f, memberIds: f.memberIds.filter((id) => id !== userId) } : f,
          ),
        }))
      },

      createPost: (authorId, body, forumId) => {
        const trimmed = body.trim()
        if (!trimmed) return
        set((state) => ({
          posts: [
            {
              id: uid('p'),
              authorId,
              forumId,
              body: trimmed,
              mentions: extractMentionIds(trimmed, state.users),
              createdAt: new Date().toISOString(),
              comments: [],
            },
            ...state.posts,
          ],
        }))
      },

      addComment: (postId, authorId, body) => {
        const trimmed = body.trim()
        if (!trimmed) return
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  comments: [
                    ...p.comments,
                    {
                      id: uid('cm'),
                      authorId,
                      body: trimmed,
                      mentions: extractMentionIds(trimmed, state.users),
                      createdAt: new Date().toISOString(),
                    },
                  ],
                }
              : p,
          ),
        }))
      },

      deletePost: (postId, userId) => {
        set((state) => ({ posts: state.posts.filter((p) => !(p.id === postId && p.authorId === userId)) }))
      },

      deleteComment: (postId, commentId, userId) => {
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId
              ? { ...p, comments: p.comments.filter((c) => !(c.id === commentId && c.authorId === userId)) }
              : p,
          ),
        }))
      },

      rsvpToEvent: (eventId, userId, status) => {
        set((state) => ({
          events: state.events.map((e) => {
            if (e.id !== eventId) return e
            const withoutUser = e.rsvps.filter((r) => r.userId !== userId)
            return { ...e, rsvps: [...withoutUser, { userId, status, createdAt: new Date().toISOString() }] }
          }),
        }))
      },

      cancelRsvp: (eventId, userId) => {
        set((state) => ({
          events: state.events.map((e) =>
            e.id === eventId ? { ...e, rsvps: e.rsvps.filter((r) => r.userId !== userId) } : e,
          ),
        }))
      },

      purchaseTicket: (eventId, userId, tierId, quantity) => {
        const event = get().events.find((e) => e.id === eventId)
        if (!event) return null
        const capped = Math.min(Math.max(1, Math.floor(quantity) || 1), spotsRemaining(event))
        if (capped < 1) return null
        const ticket: Ticket = {
          id: uid('tk'),
          userId,
          tierId,
          quantity: capped,
          confirmationCode: ticketCode(),
          purchasedAt: new Date().toISOString(),
        }
        set((state) => ({
          events: state.events.map((e) => (e.id === eventId ? { ...e, tickets: [...e.tickets, ticket] } : e)),
        }))
        return ticket
      },
    }),
    {
      name: 'enabled-prototype-state',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

export function useFollowingUsers(userId: string | null): User[] {
  return useAppStore((state) => {
    if (!userId) return []
    const followingIds = new Set(followingOf(state.follows, userId))
    return state.users.filter((u) => followingIds.has(u.id))
  })
}

/** Follow requests to the user plus pending join requests on forums they own. */
export function usePendingRequestCount(userId: string | null): number {
  return useAppStore((state) => {
    if (!userId) return 0
    const followRequests = pendingIncomingRequests(state.follows, userId).length
    const joinRequests = state.forums
      .filter((f) => f.ownerId === userId)
      .reduce((sum, f) => sum + f.joinRequests.filter((r) => r.status === 'pending').length, 0)
    return followRequests + joinRequests
  })
}
