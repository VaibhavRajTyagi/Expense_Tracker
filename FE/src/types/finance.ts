export type AppCategory = 'income' | 'investment' | 'lifestyle' | 'software' | 'tax' | 'operations'

export type Account = {
  id: string
  name: string
  institution: string
  type: 'checking' | 'savings' | 'investment'
  startBalance: number
}

export type Transaction = {
  id: string
  description: string
  amount: number
  date: string
  category: AppCategory
  accountId: string
}

export type TransactionDraft = Omit<Transaction, 'id'>

export type AppPreferences = {
  notificationsEnabled: boolean
  weeklyDigestEnabled: boolean
  compactMode: boolean
}
