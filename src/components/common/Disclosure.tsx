import { useId, useState } from 'react'
import type { ReactNode } from 'react'

interface DisclosureProps {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}

/** A section heading that expands and collapses its content; the heading stays in the document outline. */
export function Disclosure({ title, children, defaultOpen = false }: DisclosureProps) {
  const [open, setOpen] = useState(defaultOpen)
  const panelId = useId()

  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="-mx-2 flex min-h-[44px] w-full items-center justify-between gap-2 rounded-lg px-2 text-left hover:bg-slate-100"
        >
          {title}
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            className={`h-5 w-5 shrink-0 text-slate-600 transition-transform ${open ? 'rotate-180' : ''}`}
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </h2>
      <div id={panelId} hidden={!open} className="mt-2">
        {children}
      </div>
    </section>
  )
}
