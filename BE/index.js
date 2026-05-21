import cors from 'cors'
import Database from 'better-sqlite3'
import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataDir = process.env.DATA_DIR ?? path.join(__dirname, 'data')
const dbPath = path.join(dataDir, 'expense-tracker.db')

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

let db
try {
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  console.log(`Database ready at ${dbPath}`)
} catch (error) {
  console.error('Failed to initialize database:', error)
  process.exit(1)
}

db.exec(`
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  institution TEXT NOT NULL,
  type TEXT NOT NULL,
  start_balance REAL NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  account_id TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS preferences (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  notifications_enabled INTEGER NOT NULL DEFAULT 1,
  weekly_digest_enabled INTEGER NOT NULL DEFAULT 1,
  compact_mode INTEGER NOT NULL DEFAULT 0
);
`)

db.prepare(
  `
  INSERT OR IGNORE INTO preferences (id, notifications_enabled, weekly_digest_enabled, compact_mode)
  VALUES (1, 1, 1, 0)
`,
).run()

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'expense-tracker-api' })
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/bootstrap', (_req, res) => {
  const accounts = db
    .prepare(
      `
      SELECT id, name, institution, type, start_balance AS startBalance
      FROM accounts
      ORDER BY created_at DESC
      `,
    )
    .all()

  const transactions = db
    .prepare(
      `
      SELECT id, description, amount, date, category, account_id AS accountId
      FROM transactions
      ORDER BY date DESC, created_at DESC
      `,
    )
    .all()

  const preferences = db
    .prepare(
      `
      SELECT notifications_enabled AS notificationsEnabled,
             weekly_digest_enabled AS weeklyDigestEnabled,
             compact_mode AS compactMode
      FROM preferences
      WHERE id = 1
      `,
    )
    .get()

  res.json({
    accounts,
    transactions,
    preferences: {
      notificationsEnabled: Boolean(preferences.notificationsEnabled),
      weeklyDigestEnabled: Boolean(preferences.weeklyDigestEnabled),
      compactMode: Boolean(preferences.compactMode),
    },
  })
})

app.post('/api/accounts', (req, res) => {
  const { name, institution, type, startBalance } = req.body ?? {}
  if (!name || !institution || !type || Number.isNaN(Number(startBalance))) {
    res.status(400).json({ error: 'Invalid account payload' })
    return
  }

  const account = {
    id: randomUUID(),
    name: String(name).trim(),
    institution: String(institution).trim(),
    type: String(type),
    startBalance: Number(startBalance),
  }

  db.prepare(
    `
    INSERT INTO accounts (id, name, institution, type, start_balance, created_at)
    VALUES (@id, @name, @institution, @type, @startBalance, @createdAt)
    `,
  ).run({
    ...account,
    createdAt: new Date().toISOString(),
  })

  res.status(201).json(account)
})

app.post('/api/transactions', (req, res) => {
  const { description, amount, date, category, accountId } = req.body ?? {}
  if (!description || Number.isNaN(Number(amount)) || !date || !category || !accountId) {
    res.status(400).json({ error: 'Invalid transaction payload' })
    return
  }

  const account = db.prepare('SELECT id FROM accounts WHERE id = ?').get(accountId)
  if (!account) {
    res.status(404).json({ error: 'Account not found' })
    return
  }

  const transaction = {
    id: randomUUID(),
    description: String(description).trim(),
    amount: Number(amount),
    date: String(date),
    category: String(category),
    accountId: String(accountId),
  }

  db.prepare(
    `
    INSERT INTO transactions (id, description, amount, date, category, account_id, created_at)
    VALUES (@id, @description, @amount, @date, @category, @accountId, @createdAt)
    `,
  ).run({
    ...transaction,
    createdAt: new Date().toISOString(),
  })

  res.status(201).json(transaction)
})

app.delete('/api/transactions/:id', (req, res) => {
  const result = db.prepare('DELETE FROM transactions WHERE id = ?').run(req.params.id)
  if (result.changes === 0) {
    res.status(404).json({ error: 'Transaction not found' })
    return
  }
  res.status(204).send()
})

app.patch('/api/preferences', (req, res) => {
  const { notificationsEnabled, weeklyDigestEnabled, compactMode } = req.body ?? {}
  db.prepare(
    `
    UPDATE preferences
    SET notifications_enabled = COALESCE(@notificationsEnabled, notifications_enabled),
        weekly_digest_enabled = COALESCE(@weeklyDigestEnabled, weekly_digest_enabled),
        compact_mode = COALESCE(@compactMode, compact_mode)
    WHERE id = 1
    `,
  ).run({
    notificationsEnabled:
      typeof notificationsEnabled === 'boolean' ? (notificationsEnabled ? 1 : 0) : null,
    weeklyDigestEnabled: typeof weeklyDigestEnabled === 'boolean' ? (weeklyDigestEnabled ? 1 : 0) : null,
    compactMode: typeof compactMode === 'boolean' ? (compactMode ? 1 : 0) : null,
  })

  const updated = db
    .prepare(
      `
      SELECT notifications_enabled AS notificationsEnabled,
             weekly_digest_enabled AS weeklyDigestEnabled,
             compact_mode AS compactMode
      FROM preferences
      WHERE id = 1
      `,
    )
    .get()

  res.json({
    notificationsEnabled: Boolean(updated.notificationsEnabled),
    weeklyDigestEnabled: Boolean(updated.weeklyDigestEnabled),
    compactMode: Boolean(updated.compactMode),
  })
})

app.post('/api/reset', (_req, res) => {
  db.prepare('DELETE FROM transactions').run()
  db.prepare('DELETE FROM accounts').run()
  db.prepare('UPDATE preferences SET notifications_enabled = 1, weekly_digest_enabled = 1, compact_mode = 0 WHERE id = 1').run()
  res.status(204).send()
})

const port = Number(process.env.PORT ?? 8787)
const host = '0.0.0.0'

app.listen(port, host, () => {
  console.log(`API listening on http://${host}:${port}`)
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason)
  process.exit(1)
})
