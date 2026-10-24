/** Focuses the page's <h1> (making it focusable first). Returns false when the page has none. */
export function focusPageHeading(): boolean {
  const heading = document.querySelector<HTMLElement>('main h1')
  if (!heading) return false
  if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1')
  heading.focus({ preventScroll: true })
  return true
}

/**
 * Call just before an action removes `row` from a list. Once the list re-renders, focus moves to the
 * neighbouring row (its first link or button), or to the page heading if there is none.
 */
export function focusNeighbourAfterRemoval(row: Element | null) {
  const neighbour = row?.nextElementSibling ?? row?.previousElementSibling ?? null
  requestAnimationFrame(() => {
    const target = neighbour?.isConnected ? neighbour.querySelector<HTMLElement>('a[href]:not([tabindex="-1"]), button:not([disabled]), textarea') : null
    if (target) target.focus()
    else focusPageHeading()
  })
}
