import type { AppSection } from '../../App'

type SidebarProps = {
  activeSection: AppSection
  isDark: boolean
  onSelectSection: (section: AppSection) => void
  onToggleDarkMode: () => void
  onQuickAddExpense: () => void
}

const navItems: Array<{ id: AppSection; label: string }> = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'accounts', label: 'Accounts' },
  { id: 'insights', label: 'Insights' },
  { id: 'settings', label: 'Settings' },
]

export function Sidebar({
  activeSection,
  isDark,
  onSelectSection,
  onToggleDarkMode,
  onQuickAddExpense,
}: SidebarProps) {
  return (
    <aside className="flex flex-col justify-between rounded-2xl bg-white/85 p-6 shadow-sm ring-1 ring-slate-200/60 backdrop-blur-xl dark:bg-white/5 dark:ring-white/10">
      <div>
        <p className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Atelier</p>
        <p className="mt-1 text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
          Private Vault
        </p>

        <nav className="mt-8 flex flex-col gap-2" aria-label="Primary">
          {navItems.map((item) => {
            const active = activeSection === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className={`rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  active
                    ? 'bg-slate-900 text-slate-100 dark:bg-white/15 dark:text-white'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10'
                }`}
              >
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={onToggleDarkMode}
          className="w-full rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15"
        >
          {isDark ? 'Switch to Light' : 'Switch to Dark'}
        </button>
        <button
          type="button"
          onClick={onQuickAddExpense}
          className="w-full rounded-xl bg-gradient-to-b from-[#4c616c] to-[#40555f] px-4 py-3 text-sm font-semibold text-[#f0f9ff] transition hover:brightness-110"
        >
          + Add Expense
        </button>
      </div>
    </aside>
  )
}
