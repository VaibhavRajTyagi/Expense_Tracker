import { useState } from 'react'
import { SectionScaffold } from './SectionScaffold'
import type { AppPreferences } from '../../types/finance'

type SettingsSectionProps = {
  isDark: boolean
  onToggleDarkMode: () => void
  preferences: AppPreferences
  onUpdatePreferences: (patch: Partial<AppPreferences>) => Promise<void>
  onResetData: () => Promise<void>
}

export function SettingsSection({
  isDark,
  onToggleDarkMode,
  preferences,
  onUpdatePreferences,
  onResetData,
}: SettingsSectionProps) {
  const [error, setError] = useState<string | null>(null)

  const safeUpdate = async (patch: Partial<AppPreferences>) => {
    try {
      setError(null)
      await onUpdatePreferences(patch)
    } catch {
      setError('Could not save preference.')
    }
  }

  const safeReset = async () => {
    try {
      setError(null)
      await onResetData()
    } catch {
      setError('Could not reset data.')
    }
  }

  return (
    <SectionScaffold
      eyebrow="Settings"
      title="System Preferences"
      description="Manage personalization, notifications, and app data controls."
    >
      <div className="space-y-4">
        {error && <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p>}
        <article className="flex items-center justify-between rounded-2xl bg-slate-100 p-5 dark:bg-white/5">
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100">Theme</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">Switch between dark and light mode.</p>
          </div>
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-white/15"
          >
            {isDark ? 'Dark' : 'Light'}
          </button>
        </article>
        <article className="space-y-3 rounded-2xl bg-slate-100 p-5 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300">
          <p className="font-medium text-slate-900 dark:text-slate-100">Notification Preferences</p>
          <label className="flex items-center justify-between">
            <span>Real-time alerts</span>
            <input
              type="checkbox"
              checked={preferences.notificationsEnabled}
              onChange={(event) => void safeUpdate({ notificationsEnabled: event.target.checked })}
            />
          </label>
          <label className="flex items-center justify-between">
            <span>Weekly digest</span>
            <input
              type="checkbox"
              checked={preferences.weeklyDigestEnabled}
              onChange={(event) => void safeUpdate({ weeklyDigestEnabled: event.target.checked })}
            />
          </label>
        </article>
        <article className="space-y-3 rounded-2xl bg-slate-100 p-5 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300">
          <p className="font-medium text-slate-900 dark:text-slate-100">Layout Preferences</p>
          <label className="flex items-center justify-between">
            <span>Compact mode</span>
            <input
              type="checkbox"
              checked={preferences.compactMode}
              onChange={(event) => void safeUpdate({ compactMode: event.target.checked })}
            />
          </label>
        </article>
        <article className="rounded-2xl bg-slate-100 p-5 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300">
          <p className="mb-3 font-medium text-slate-900 dark:text-slate-100">Data Controls</p>
          <button
            type="button"
            onClick={() => void safeReset()}
            className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white hover:bg-rose-700"
          >
            Reset Demo Data
          </button>
        </article>
      </div>
    </SectionScaffold>
  )
}
