import * as SQLite from 'expo-sqlite';

export const database = SQLite.openDatabaseSync('financas.db');