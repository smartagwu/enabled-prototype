import { useEffect, useRef, useState } from 'react'

/**
 * Screen-reader-only live region that announces how many results a search or filter produced.
 * Stays silent until the count first changes, so it isn't read out on page load.
 */
export function ResultsStatus({ count }: { count: number }) {
  const previous = useRef(count)
  const [changed, setChanged] = useState(false)

  useEffect(() => {
    if (previous.current !== count) {
      previous.current = count
      setChanged(true)
    }
  }, [count])

  return (
    <p role="status" aria-live="polite" className="sr-only">
      {changed && `${count} ${count === 1 ? 'result' : 'results'}`}
    </p>
  )
}
