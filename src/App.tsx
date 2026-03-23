import { useEffect, useState } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { AccountsSection } from './components/sections/AccountsSection'
import { DashboardSection } from './components/sections/DashboardSection'
import { InsightsSection } from './components/sections/InsightsSection'
import { SettingsSection } from './components/sections/SettingsSection'
import { TransactionsSection } from './components/sections/TransactionsSection'
import { api } from './lib/api'
import type { Account, AppPreferences, Transaction, TransactionDraft } from './types/finance'

export type AppSection = 'dashboard' | 'transactions' | 'accounts' | 'insights' | 'settings'

const defaultPreferences: AppPreferences = {
  notificationsEnabled: true,
  weeklyDigestEnabled: true,
  compactMode: false,
}

function App() {
  const [activeSection, setActiveSection] = useState<AppSection>('dashboard')
  const [isDark, setIsDark] = useState<boolean>(() => {
    const stored = localStorage.getItem('expense-tracker-theme')
    return stored ? stored === 'dark' : true
  })
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [preferences, setPreferences] = useState<AppPreferences>(defaultPreferences)
  const [isTransactionComposerOpen, setIsTransactionComposerOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem('expense-tracker-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  useEffect(() => {
    const load = async () => {
      try {
        setApiError(null)
        const data = await api.bootstrap()
        setAccounts(data.accounts)
        setTransactions(data.transactions)
        setPreferences(data.preferences)
      } catch {
        setApiError('Cannot reach backend. Start API server with `npm run dev:server`.')
      } finally {
        setIsLoading(false)
      }
    }

    void load()
  }, [])

  const addAccount = async (payload: Omit<Account, 'id'>) => {
    const created = await api.createAccount(payload)
    setAccounts((prev) => [created, ...prev])
  }

  const addTransaction = async (draft: TransactionDraft) => {
    const created = await api.createTransaction(draft)
    setTransactions((prev) => [created, ...prev])
  }

  const deleteTransaction = async (id: string) => {
    await api.deleteTransaction(id)
    setTransactions((prev) => prev.filter((txn) => txn.id !== id))
  }

  const updatePreferences = async (patch: Partial<AppPreferences>) => {
    const updated = await api.updatePreferences(patch)
    setPreferences(updated)
  }

  const resetData = async () => {
    await api.reset()
    setAccounts([])
    setTransactions([])
    setPreferences(defaultPreferences)
    setActiveSection('dashboard')
  }

  const sectionView = (() => {
    switch (activeSection) {
      case 'transactions':
        return (
          <TransactionsSection
            accounts={accounts}
            showCreateForm={isTransactionComposerOpen}
            transactions={transactions}
            onCreateFormVisibilityChange={setIsTransactionComposerOpen}
            onAddTransaction={addTransaction}
            onDeleteTransaction={deleteTransaction}
            onOpenAccounts={() => setActiveSection('accounts')}
          />
        )
      case 'accounts':
        return <AccountsSection accounts={accounts} transactions={transactions} onAddAccount={addAccount} />
      case 'insights':
        return <InsightsSection transactions={transactions} />
      case 'settings':
        return (
          <SettingsSection
            isDark={isDark}
            preferences={preferences}
            onToggleDarkMode={() => setIsDark((prev) => !prev)}
            onUpdatePreferences={updatePreferences}
            onResetData={resetData}
          />
        )
      case 'dashboard':
      default:
        return (
          <DashboardSection
            accounts={accounts}
            transactions={transactions}
            onOpenTransactions={() => setActiveSection('transactions')}
          />
        )
    }
  })()

  return (
    <main className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 text-slate-800 transition-colors dark:bg-[#0b1114] dark:text-slate-100">
        {isLoading && (
          <div className="mx-auto max-w-[1440px] px-4 pt-4 text-sm text-slate-500 dark:text-slate-400 lg:px-8">
            Loading data...
          </div>
        )}
        {apiError && (
          <div className="mx-auto max-w-[1440px] px-4 pt-4 text-sm text-rose-600 dark:text-rose-300 lg:px-8">
            {apiError}
          </div>
        )}
        <div
          className={`mx-auto grid min-h-screen max-w-[1440px] grid-cols-1 lg:grid-cols-[260px_1fr] ${
            preferences.compactMode ? 'gap-3 p-3 lg:p-5' : 'gap-6 p-4 lg:p-8'
          }`}
        >
          <Sidebar
            activeSection={activeSection}
            isDark={isDark}
            onSelectSection={setActiveSection}
            onToggleDarkMode={() => setIsDark((prev) => !prev)}
            onQuickAddExpense={() => {
              setActiveSection('transactions')
              setIsTransactionComposerOpen(true)
            }}
          />
          {sectionView}
        </div>
      </div>
    </main>
  )
}

export default App
