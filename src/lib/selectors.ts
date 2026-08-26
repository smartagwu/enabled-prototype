import type { FollowEdge, User } from '../types'

export type FollowState = 'none' | 'pending' | 'accepted'

export function followEdgeBetween(
  follows: FollowEdge[],
  followerId: string,
  followeeId: string,
): FollowEdge | undefined {
  return follows.find((f) => f.followerId === followerId && f.followeeId === followeeId)
}

export function followStateBetween(follows: FollowEdge[], followerId: string, followeeId: string): FollowState {
  const edge = followEdgeBetween(follows, followerId, followeeId)
  return edge ? edge.status : 'none'
}

/** Users that `userId` follows (accepted only). */
export function followingOf(follows: FollowEdge[], userId: string): string[] {
  return follows.filter((f) => f.followerId === userId && f.status === 'accepted').map((f) => f.followeeId)
}

/** Users that follow `userId` (accepted only). */
export function followersOf(follows: FollowEdge[], userId: string): string[] {
  return follows.filter((f) => f.followeeId === userId && f.status === 'accepted').map((f) => f.followerId)
}

export function pendingIncomingRequests(follows: FollowEdge[], userId: string): FollowEdge[] {
  return follows.filter((f) => f.followeeId === userId && f.status === 'pending')
}

export function canMessage(follows: FollowEdge[], currentUserId: string, otherUserId: string): boolean {
  return followStateBetween(follows, currentUserId, otherUserId) === 'accepted'
}

export function userById(users: User[], id: string | undefined | null): User | undefined {
  if (!id) return undefined
  return users.find((u) => u.id === id)
}

export function displayName(users: User[], id: string): string {
  return userById(users, id)?.name ?? 'Unknown member'
}
