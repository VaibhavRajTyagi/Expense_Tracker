import { type FormEvent, useState } from 'react'
import { formatCurrency } from '../../lib/currency'
import { fieldClass, selectClass } from '../../lib/formStyles'
import { SectionScaffold } from './SectionScaffold'
import type { Account, Transaction } from '../../types/finance'

type AccountsSectionProps = {
  accounts: Account[]
  transactions: Transaction[]
  onAddAccount: (payload: Omit<Account, 'id'>) => Promise<void>
}

export function AccountsSection({ accounts, transactions, onAddAccount }: AccountsSectionProps) {
  const [draft, setDraft] = useState<Omit<Account, 'id'>>({
    name: '',
    institution: '',
    type: 'checking',
    startBalance: 0,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const accountMetrics = accounts.map((account) => {
    const accountTransactions = transactions.filter((txn) => txn.accountId === account.id)
    const delta = accountTransactions.reduce((sum, txn) => sum + txn.amount, 0)
    const balance = account.startBalance + delta
    return { account, balance, txCount: accountTransactions.length, latest: accountTransactions[0] }
  })

  const totalBalance = accountMetrics.reduce((sum, item) => sum + item.balance, 0)
  const createAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!draft.name.trim() || !draft.institution.trim()) return
    try {
      setError(null)
      setIsSaving(true)
      await onAddAccount({ ...draft, name: draft.name.trim(), institution: draft.institution.trim() })
      setDraft({ name: '', institution: '', type: 'checking', startBalance: 0 })
    } catch {
      setError('Could not create account.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <SectionScaffold
      eyebrow="Accounts"
      title="Vault Accounts"
      description="Track account balances, activity, and portfolio distribution across institutions."
    >
      <form onSubmit={createAccount} className="mb-5 grid gap-3 rounded-2xl bg-slate-100 p-4 dark:bg-white/5 md:grid-cols-4">
        {error && <p className="md:col-span-4 text-sm text-rose-600 dark:text-rose-300">{error}</p>}
        <input
          value={draft.name}
          onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
          placeholder="Account name"
          className={fieldClass}
        />
        <input
          value={draft.institution}
          onChange={(event) => setDraft((prev) => ({ ...prev, institution: event.target.value }))}
          placeholder="Institution"
          className={fieldClass}
        />
        <select
          value={draft.type}
          onChange={(event) => setDraft((prev) => ({ ...prev, type: event.target.value as Account['type'] }))}
          className={selectClass}
        >
          <option value="checking">checking</option>
          <option value="savings">savings</option>
          <option value="investment">investment</option>
        </select>
        <div className="flex gap-2">
          <input
            type="number"
            value={draft.startBalance}
            onChange={(event) => setDraft((prev) => ({ ...prev, startBalance: Number(event.target.value) }))}
            placeholder="Starting balance"
            className={`${fieldClass} w-full`}
          />
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-gradient-to-b from-[#4c616c] to-[#40555f] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#f0f9ff]"
          >
            {isSaving ? 'Adding...' : 'Add'}
          </button>
        </div>
      </form>
      <div className="grid gap-5 lg:grid-cols-2">
        {accountMetrics.map(({ account, balance, txCount, latest }) => (
          <article key={account.id} className="rounded-2xl bg-slate-100 p-6 dark:bg-white/5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Account</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">{account.name}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{account.institution}</p>
            <p className="mt-5 text-3xl font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(balance)}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              {((balance / totalBalance) * 100 || 0).toFixed(1)}% of total • {txCount} transactions
            </p>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
              Last activity: {latest ? `${latest.date} (${latest.description})` : 'No transactions yet'}
            </p>
          </article>
        ))}
        {accountMetrics.length === 0 && (
          <article className="rounded-2xl bg-slate-100 p-6 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300">
            No accounts yet. Add your first account above.
          </article>
        )}
      </div>
    </SectionScaffold>
  )
}
