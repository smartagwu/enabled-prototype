import { Link } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { segmentBodyWithMentions } from '../../lib/mentions'

export function MentionText({ body, className = '' }: { body: string; className?: string }) {
  const users = useAppStore((state) => state.users)
  const segments = segmentBodyWithMentions(body, users)

  return (
    <p className={`whitespace-pre-wrap break-words ${className}`}>
      {segments.map((segment, index) =>
        segment.userId ? (
          <Link
            key={index}
            to={`/profile/${segment.userId}`}
            className="font-medium text-brand-700 underline-offset-2 hover:underline"
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
