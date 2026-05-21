import { SectionScaffold } from './SectionScaffold'
import {
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts'
import { formatCurrency } from '../../lib/currency'
import type { Account, Transaction } from '../../types/finance'

type DashboardSectionProps = {
  accounts: Account[]
  transactions: Transaction[]
  onOpenTransactions: () => void
}

export function DashboardSection({ accounts, transactions, onOpenTransactions }: DashboardSectionProps) {
  const currentMonth = new Date().toISOString().slice(0, 7)
  const monthTxns = transactions.filter((txn) => txn.date.slice(0, 7) === currentMonth)
  const income = monthTxns.filter((txn) => txn.amount > 0).reduce((sum, txn) => sum + txn.amount, 0)
  const expenses = Math.abs(monthTxns.filter((txn) => txn.amount < 0).reduce((sum, txn) => sum + txn.amount, 0))
  const net = income - expenses
  const savingsRatio = income > 0 ? (net / income) * 100 : 0
  const debtIndex = income > 0 ? Math.min(1, expenses / income) : 0

  const accountTotals = accounts.map((account) => ({
    ...account,
    balance:
      account.startBalance +
      transactions.filter((txn) => txn.accountId === account.id).reduce((sum, txn) => sum + txn.amount, 0),
  }))
  const totalLiquidity = accountTotals.reduce((sum, account) => sum + account.balance, 0)
  const expenseByCategory = transactions
    .filter((txn) => txn.amount < 0)
    .reduce<Record<string, number>>((acc, txn) => {
      acc[txn.category] = (acc[txn.category] ?? 0) + Math.abs(txn.amount)
      return acc
    }, {})
  const totalCategorizedExpense = Object.values(expenseByCategory).reduce((sum, value) => sum + value, 0)
  const categorySplit = Object.entries(expenseByCategory).map(([name, value]) => ({
    name,
    pct: totalCategorizedExpense > 0 ? (value / totalCategorizedExpense) * 100 : 0,
  }))

  const recentTransactions = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
  const trendData = Array.from({ length: 8 }, (_, idx) => {
    const date = new Date()
    date.setDate(date.getDate() - (7 - idx))
    const key = date.toISOString().slice(0, 10)
    const netByDay = transactions.filter((txn) => txn.date === key).reduce((sum, txn) => sum + txn.amount, 0)
    return { day: key.slice(5), net: netByDay }
  })
  const piePalette = ['#4c616c', '#647883', '#7e9199', '#9aadb1', '#b4c4c7', '#c6d2d4']

  return (
    <SectionScaffold
      eyebrow="Financial Journal"
      title="Current Liquidity"
      description="Live summary of your current month performance and account health."
      actions={
        <p className={`text-sm font-medium ${net >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`}>
          {net >= 0 ? '+' : '-'} {formatCurrency(Math.abs(net))}
        </p>
      }
    >
      <div className="space-y-6">
        <div className="rounded-3xl bg-slate-100/80 p-6 dark:bg-white/5">
          <p className="text-right text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-6xl">
            {formatCurrency(totalLiquidity)}
          </p>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.65fr_1fr]">
          <article className="rounded-3xl bg-white p-6 shadow-sm dark:bg-white/5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Financial Health</h2>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Monthly performance analysis
                </p>
              </div>
              <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-white/10 dark:text-slate-200">
                Excellent
              </span>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {[
                { label: 'Burn Rate', value: formatCurrency(expenses), width: `${Math.min(100, expenses / 80)}%` },
                { label: 'Savings Ratio', value: `${Math.max(0, savingsRatio).toFixed(1)}%`, width: `${Math.min(100, Math.max(0, savingsRatio))}%` },
                { label: 'Debt Index', value: debtIndex.toFixed(2), width: `${Math.min(100, debtIndex * 100)}%` },
              ].map((metric) => (
                <div key={metric.label}>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{metric.label}</p>
                  <p className="my-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">{metric.value}</p>
                  <div className="h-1.5 rounded-full bg-slate-200 dark:bg-white/10">
                    <span
                      className="block h-full rounded-full bg-gradient-to-r from-[#4c616c] to-[#40555f]"
                      style={{ width: metric.width }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 h-44 rounded-2xl bg-slate-100 p-3 dark:bg-white/5">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Line type="monotone" dataKey="net" stroke="#4c616c" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="rounded-3xl bg-white p-6 shadow-sm dark:bg-white/5">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Category Split</h2>
            <div className="mt-4 h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categorySplit} dataKey="pct" nameKey="name" innerRadius={46} outerRadius={78} paddingAngle={3}>
                    {categorySplit.map((entry, idx) => (
                      <Cell key={entry.name} fill={piePalette[idx % piePalette.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {categorySplit.map(({ name, pct }) => (
                <p key={name} className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  {name} {pct.toFixed(0)}%
                </p>
              ))}
              {categorySplit.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">No expenses yet.</p>}
            </div>
          </article>
        </div>

        <div className="rounded-3xl bg-slate-100/70 p-6 dark:bg-white/5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-3xl font-medium tracking-[0.02em] text-slate-900 dark:text-slate-100">Recent Ledger</h2>
            <button
              type="button"
              onClick={onOpenTransactions}
              className="text-xs uppercase tracking-[0.2em] text-[#4c616c] hover:underline dark:text-slate-300"
            >
              View All Archive
            </button>
          </div>
          <ul className="space-y-6">
            {recentTransactions.map((txn) => (
              <li
                key={txn.id}
                className="flex items-center justify-between rounded-2xl bg-white px-4 py-4 transition hover:bg-slate-50 dark:bg-white/5 dark:hover:bg-white/10"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{txn.description}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{txn.date}</p>
                </div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {txn.amount >= 0 ? '+' : '-'} {formatCurrency(Math.abs(txn.amount))}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionScaffold>
  )
}
