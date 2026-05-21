import { type FormEvent, useMemo, useState } from 'react'
import { formatCurrency } from '../../lib/currency'
import { fieldClass, selectClass } from '../../lib/formStyles'
import { SectionScaffold } from './SectionScaffold'
import type { Account, AppCategory, Transaction, TransactionDraft } from '../../types/finance'

type TransactionsSectionProps = {
  transactions: Transaction[]
  accounts: Account[]
  showCreateForm: boolean
  onCreateFormVisibilityChange: (value: boolean) => void
  onAddTransaction: (draft: TransactionDraft) => Promise<void>
  onDeleteTransaction: (id: string) => Promise<void>
  onOpenAccounts: () => void
}

const categories: AppCategory[] = ['income', 'investment', 'lifestyle', 'software', 'tax', 'operations']

export function TransactionsSection({
  transactions,
  accounts,
  showCreateForm,
  onCreateFormVisibilityChange,
  onAddTransaction,
  onDeleteTransaction,
  onOpenAccounts,
}: TransactionsSectionProps) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | AppCategory>('all')
  const [selectedAccount, setSelectedAccount] = useState<'all' | string>('all')
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all')
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const [draft, setDraft] = useState<TransactionDraft>({
    description: '',
    amount: -0,
    date: new Date().toISOString().slice(0, 10),
    category: 'operations',
    accountId: accounts[0]?.id ?? '',
  })
  const effectiveDraftAccountId = draft.accountId || accounts[0]?.id || ''

  const filtered = useMemo(() => {
    return transactions
      .filter((txn) => txn.description.toLowerCase().includes(search.toLowerCase()))
      .filter((txn) => (selectedCategory === 'all' ? true : txn.category === selectedCategory))
      .filter((txn) => (selectedAccount === 'all' ? true : txn.accountId === selectedAccount))
      .filter((txn) => (selectedType === 'all' ? true : selectedType === 'income' ? txn.amount > 0 : txn.amount < 0))
      .filter((txn) => (selectedMonth ? txn.date.slice(0, 7) === selectedMonth : true))
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [search, selectedAccount, selectedCategory, selectedMonth, selectedType, transactions])

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!draft.description.trim() || !effectiveDraftAccountId) return

    const absoluteAmount = Math.abs(draft.amount)
    try {
      setError(null)
      setIsSaving(true)
      await onAddTransaction({
        ...draft,
        description: draft.description.trim(),
        amount: draft.category === 'income' || draft.category === 'investment' ? absoluteAmount : -absoluteAmount,
        accountId: effectiveDraftAccountId,
      })
      setDraft((prev) => ({ ...prev, description: '', amount: -0 }))
      onCreateFormVisibilityChange(false)
    } catch {
      setError('Could not save transaction.')
    } finally {
      setIsSaving(false)
    }
  }

  const totalInflow = filtered.filter((txn) => txn.amount > 0).reduce((sum, txn) => sum + txn.amount, 0)
  const totalOutflow = Math.abs(filtered.filter((txn) => txn.amount < 0).reduce((sum, txn) => sum + txn.amount, 0))
  const handleDelete = async (id: string) => {
    try {
      setError(null)
      await onDeleteTransaction(id)
    } catch {
      setError('Could not delete transaction.')
    }
  }

  return (
    <SectionScaffold
      eyebrow="Transactions"
      title="Editorial Feed"
      description="Create, filter, and review transactions with category and account-level controls."
      actions={
        <button
          type="button"
          onClick={() => onCreateFormVisibilityChange(!showCreateForm)}
          className="rounded-xl bg-gradient-to-b from-[#4c616c] to-[#40555f] px-4 py-2 text-sm font-medium text-[#f0f9ff]"
        >
          {showCreateForm ? 'Close Form' : 'New Transaction'}
        </button>
      }
    >
      <div className="space-y-5">
        {showCreateForm && (
          <form onSubmit={handleCreate} className="grid gap-3 rounded-2xl bg-slate-100 p-4 dark:bg-white/5 md:grid-cols-2">
            {accounts.length === 0 && (
              <div className="md:col-span-2 rounded-xl bg-amber-100 px-3 py-2 text-sm text-amber-900 dark:bg-amber-500/20 dark:text-amber-200">
                Add an account first before creating transactions.{' '}
                <button type="button" onClick={onOpenAccounts} className="underline">
                  Go to Accounts
                </button>
              </div>
            )}
            {error && <p className="md:col-span-2 text-sm text-rose-600 dark:text-rose-300">{error}</p>}
            <input
              value={draft.description}
              onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Description"
              className={fieldClass}
            />
            <input
              type="number"
              value={Math.abs(draft.amount)}
              onChange={(event) => setDraft((prev) => ({ ...prev, amount: Number(event.target.value) }))}
              placeholder="Amount"
              className={fieldClass}
            />
            <input
              type="date"
              value={draft.date}
              onChange={(event) => setDraft((prev) => ({ ...prev, date: event.target.value }))}
              className={fieldClass}
            />
            <select
              value={draft.category}
              onChange={(event) => setDraft((prev) => ({ ...prev, category: event.target.value as AppCategory }))}
              className={selectClass}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              value={effectiveDraftAccountId}
              onChange={(event) => setDraft((prev) => ({ ...prev, accountId: event.target.value }))}
              className={selectClass}
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={accounts.length === 0 || isSaving}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-white/15 dark:text-slate-100"
            >
              {isSaving ? 'Saving...' : 'Save Transaction'}
            </button>
          </form>
        )}

        <div className="grid gap-3 rounded-2xl bg-slate-100 p-4 dark:bg-white/5 md:grid-cols-2 xl:grid-cols-5">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search description..."
            className={fieldClass}
          />
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value as 'all' | AppCategory)}
            className={selectClass}
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            value={selectedAccount}
            onChange={(event) => setSelectedAccount(event.target.value)}
            className={selectClass}
          >
            <option value="all">All accounts</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
          <select
            value={selectedType}
            onChange={(event) => setSelectedType(event.target.value as 'all' | 'income' | 'expense')}
            className={selectClass}
          >
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <input
            type="month"
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
            className={fieldClass}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-700 dark:bg-white/5 dark:text-slate-200">
            Inflow: <span className="font-semibold">{formatCurrency(totalInflow)}</span>
          </div>
          <div className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-700 dark:bg-white/5 dark:text-slate-200">
            Outflow: <span className="font-semibold">{formatCurrency(totalOutflow)}</span>
          </div>
        </div>

        <ul className="space-y-4">
          {filtered.map((txn) => (
            <li
              key={txn.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-100 px-4 py-4 dark:bg-white/5"
            >
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">{txn.description}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  {txn.date} • {txn.category} • {accounts.find((acc) => acc.id === txn.accountId)?.name ?? 'Unknown'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className={`font-semibold ${txn.amount >= 0 ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`}>
                  {txn.amount >= 0 ? '+' : '-'} {formatCurrency(Math.abs(txn.amount))}
                </p>
                <button
                  type="button"
                  onClick={() => void handleDelete(txn.id)}
                  className="rounded-lg bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-300 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="rounded-2xl bg-slate-100 px-4 py-4 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300">
              No transactions match these filters.
            </li>
          )}
        </ul>
      </div>
    </SectionScaffold>
  )
}
