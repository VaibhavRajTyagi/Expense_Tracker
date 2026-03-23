import { SectionScaffold } from './SectionScaffold'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Transaction } from '../../types/finance'

type InsightsSectionProps = {
  transactions: Transaction[]
}

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export function InsightsSection({ transactions }: InsightsSectionProps) {
  const monthBuckets = Array.from({ length: 6 }, (_, idx) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (5 - idx))
    const key = date.toISOString().slice(0, 7)
    const monthly = transactions.filter((txn) => txn.date.slice(0, 7) === key)
    const income = monthly.filter((txn) => txn.amount > 0).reduce((sum, txn) => sum + txn.amount, 0)
    const expense = Math.abs(monthly.filter((txn) => txn.amount < 0).reduce((sum, txn) => sum + txn.amount, 0))
    return { key, label: key.slice(5), income, expense, net: income - expense }
  })

  const maxMagnitude = Math.max(1, ...monthBuckets.map((bucket) => Math.max(bucket.income, bucket.expense)))
  const expenseByCategory = transactions
    .filter((txn) => txn.amount < 0)
    .reduce<Record<string, number>>((acc, txn) => {
      acc[txn.category] = (acc[txn.category] ?? 0) + Math.abs(txn.amount)
      return acc
    }, {})
  const topCategory = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1])[0]

  return (
    <SectionScaffold
      eyebrow="Insights"
      title="Performance Insights"
      description="Monthly trend analysis and spend category concentration from your live transaction data."
    >
      <div className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
        <article className="rounded-2xl bg-slate-100 p-6 dark:bg-white/5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Monthly Inflow vs Outflow</p>
          <div className="mt-6 h-72 rounded-xl bg-white p-2 dark:bg-white/10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthBuckets}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.3} />
                <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, maxMagnitude]} />
                <Tooltip />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
        <article className="rounded-2xl bg-slate-100 p-6 dark:bg-white/5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Strategy Notes</p>
          <ul className="mt-4 space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <li>
              Net trend: <span className="font-medium">{currency.format(monthBuckets[5]?.net ?? 0)}</span> this month.
            </li>
            <li>
              Top expense category:{' '}
              <span className="font-medium">
                {topCategory ? `${topCategory[0]} (${currency.format(topCategory[1])})` : 'No expense data yet'}
              </span>
            </li>
            <li>
              Observation: keep non-essential categories under 20% of monthly inflow to improve savings ratio.
            </li>
          </ul>
        </article>
      </div>
    </SectionScaffold>
  )
}
