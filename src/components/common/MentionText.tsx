import { Link } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { segmentBodyWithMentions } from '../../lib/mentions'

/** `onDark` is for text on a dark fill (e.g. your own message bubble), where the usual link colour would vanish. */
export function MentionText({ body, className = '', onDark = false }: { body: string; className?: string; onDark?: boolean }) {
  const users = useAppStore((state) => state.users)
  const segments = segmentBodyWithMentions(body, users)

  return (
    <p className={`whitespace-pre-wrap break-words ${className}`}>
      {segments.map((segment, index) =>
        segment.userId ? (
          <Link
            key={index}
            to={`/profile/${segment.userId}`}
            className={`font-medium underline underline-offset-2 ${onDark ? 'text-white' : 'text-brand-700'}`}
          >
            {segment.text}
          </Link>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </p>
  )
}
