import { database } from './database'

export async function migrateDatabase() {
    await database.execAsync(`
    PRAGMA foreign_keys = ON;
  `);

    const version = await database.getFirstAsync<{ user_version: number }>(
        `PRAGMA user_version;`
    );

    if ((version?.user_version ?? 0) >= 1) {
        return;
    }

    await database.withTransactionAsync(async () => {
        await database.execAsync(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        initial_balance INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL
          CHECK (type IN ('income', 'expense')),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY NOT NULL,
        description TEXT NOT NULL,
        amount INTEGER NOT NULL,
        type TEXT NOT NULL
          CHECK (type IN ('income', 'expense')),

        account_id TEXT NOT NULL,
        category_id TEXT NOT NULL,

        date TEXT NOT NULL,
        notes TEXT,

        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,

        FOREIGN KEY (account_id)
          REFERENCES accounts(id),

        FOREIGN KEY (category_id)
          REFERENCES categories(id)
      );

      PRAGMA user_version = 1;
    `);
    });
}