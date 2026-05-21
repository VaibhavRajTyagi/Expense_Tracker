import type { Account, AppPreferences, Transaction, TransactionDraft } from '../types/finance'

const apiBase = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

function apiPath(path: string) {
  return `${apiBase}${path}`
}

type BootstrapResponse = {
  accounts: Account[]
  transactions: Transaction[]
  preferences: AppPreferences
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export const api = {
  bootstrap: () => request<BootstrapResponse>(apiPath('/api/bootstrap')),
  createAccount: (payload: Omit<Account, 'id'>) =>
    request<Account>(apiPath('/api/accounts'), { method: 'POST', body: JSON.stringify(payload) }),
  createTransaction: (payload: TransactionDraft) =>
    request<Transaction>(apiPath('/api/transactions'), { method: 'POST', body: JSON.stringify(payload) }),
  deleteTransaction: (id: string) => request<void>(apiPath(`/api/transactions/${id}`), { method: 'DELETE' }),
  updatePreferences: (patch: Partial<AppPreferences>) =>
    request<AppPreferences>(apiPath('/api/preferences'), { method: 'PATCH', body: JSON.stringify(patch) }),
  reset: () => request<void>(apiPath('/api/reset'), { method: 'POST' }),
}
