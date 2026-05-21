import type { ReactNode } from 'react'

type SectionScaffoldProps = {
  eyebrow: string
  title: string
  description: string
  actions?: ReactNode
  children: ReactNode
}

export function SectionScaffold({ eyebrow, title, description, actions, children }: SectionScaffoldProps) {
  return (
    <section className="rounded-3xl bg-white/80 p-6 ring-1 ring-slate-200/60 backdrop-blur-sm dark:bg-white/5 dark:ring-white/10 lg:p-10">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.26em] text-slate-500 dark:text-slate-400">{eyebrow}</p>
          <h1 className="mt-2 text-4xl font-medium tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
          <p className="mt-3 max-w-2xl text-base text-slate-600 dark:text-slate-300">{description}</p>
        </div>
        {actions}
      </header>
      {children}
    </section>
  )
}
