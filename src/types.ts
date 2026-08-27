export interface User {
  id: string
  name: string
  pronouns: string
  headline: string
  bio: string
  location: string
  interests: string[]
  accessibilityNotes: string
  joinedAt: string
}

export type FollowStatus = 'pending' | 'accepted'

export interface FollowEdge {
  id: string
  followerId: string
  followeeId: string
  status: FollowStatus
  createdAt: string
}

export interface Message {
  id: string
  senderId: string
  body: string
  mentions: string[]
  createdAt: string
}

export type ConversationType = 'dm' | 'group'

export interface Conversation {
  id: string
  type: ConversationType
  participantIds: string[]
  name?: string
  description?: string
  createdBy: string
  createdAt: string
  messages: Message[]
}

export type ForumVisibility = 'public' | 'private'
export type JoinRequestStatus = 'pending' | 'accepted' | 'declined'

export interface ForumJoinRequest {
  userId: string
  status: JoinRequestStatus
  createdAt: string
}

export interface Forum {
  id: string
  title: string
  topic: string
  description: string
  visibility: ForumVisibility
  ownerId: string
  memberIds: string[]
  joinRequests: ForumJoinRequest[]
  createdAt: string
}

export interface Comment {
  id: string
  authorId: string
  body: string
  mentions: string[]
  createdAt: string
}

export interface Post {
  id: string
  authorId: string
  forumId: string | null
  body: string
  mentions: string[]
  createdAt: string
  comments: Comment[]
}

export type EventCategory =
  | 'Social Meetup'
  | 'Dance Night'
  | 'Games & Bowling'
  | 'Movie Night'
  | 'Workshop'
  | 'Outdoors'

export interface TicketTier {
  id: string
  name: string
  price: number
  description: string
}

export interface AgendaItem {
  time: string
  title: string
  detail: string
}

export type RsvpStatus = 'going' | 'interested'

export interface Rsvp {
  userId: string
  status: RsvpStatus
  createdAt: string
}

export interface Ticket {
  id: string
  userId: string
  tierId: string
  quantity: number
  confirmationCode: string
  purchasedAt: string
}

export interface EventLocation {
  name: string
  address: string
  accessibility: string
}

export interface EventItem {
  id: string
  title: string
  category: EventCategory
  coverColor: string
  startsAt: string
  endsAt: string
  location: EventLocation
  summary: string
  expectations: string[]
  agenda: AgendaItem[]
  instructions: string[]
  whoCanAttend: string
  thingsToKnow: string[]
  capacity: number
  organizer: string
  ticketTiers: TicketTier[]
  rsvps: Rsvp[]
  tickets: Ticket[]
}
