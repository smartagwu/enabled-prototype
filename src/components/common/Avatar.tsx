import { initialsFor, paletteFor } from '../../lib/avatars'

interface AvatarProps {
  id: string
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const SIZE_CLASSES: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
}

/** Decorative: every use sits next to the person's name, so it is hidden from assistive tech. */
export function Avatar({ id, name, size = 'md', className = '' }: AvatarProps) {
  const palette = paletteFor(id)
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold ${palette.bg} ${palette.text} ${SIZE_CLASSES[size]} ${className}`}
    >
      {initialsFor(name)}
    </span>
  )
}
