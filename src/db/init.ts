import Database from 'better-sqlite3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const dbPath = path.join(process.cwd(), 'data', 'event.db');

let db: Database.Database | null = null;

export function getDatabase() {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    initializeDatabase();
  }
  return db;
}

export function initializeDatabase() {
  const database = getDatabase();

  // Create participants table if it doesn't exist
  database.exec(`
    CREATE TABLE IF NOT EXISTS participants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      food_order TEXT NOT NULL,
      coffee_order TEXT NOT NULL,
      food_taken INTEGER DEFAULT 0,
      coffee_taken INTEGER DEFAULT 0,
      qr_code TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS logs (
      id TEXT PRIMARY KEY,
      participant_id TEXT NOT NULL,
      action TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
    );
  `);
}

export interface Participant {
  id: string;
  name: string;
  food_order: string;
  coffee_order: string;
  food_taken: boolean;
  coffee_taken: boolean;
  qr_code?: string;
  created_at?: string;
  updated_at?: string;
}

// Participant operations
export function getAllParticipants(): Participant[] {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM participants ORDER BY created_at DESC');
  const rows = stmt.all() as any[];
  return rows.map(row => ({
    ...row,
    food_taken: Boolean(row.food_taken),
    coffee_taken: Boolean(row.coffee_taken),
  }));
}

export function getParticipant(id: string): Participant | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM participants WHERE id = ?');
  const row = stmt.get(id) as any;
  if (!row) return null;
  return {
    ...row,
    food_taken: Boolean(row.food_taken),
    coffee_taken: Boolean(row.coffee_taken),
  };
}

export function createParticipant(data: Omit<Participant, 'id' | 'food_taken' | 'coffee_taken' | 'created_at' | 'updated_at'>): Participant {
  const db = getDatabase();
  const id = uuidv4();
  const stmt = db.prepare(
    'INSERT INTO participants (id, name, food_order, coffee_order, qr_code) VALUES (?, ?, ?, ?, ?)'
  );
  stmt.run(id, data.name, data.food_order, data.coffee_order, data.qr_code || null);
  return getParticipant(id)!;
}

export function updateParticipant(id: string, data: Partial<Omit<Participant, 'id'>>): Participant | null {
  const db = getDatabase();
  const current = getParticipant(id);
  if (!current) return null;

  const updates: string[] = [];
  const values: any[] = [];

  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }
  if (data.food_order !== undefined) {
    updates.push('food_order = ?');
    values.push(data.food_order);
  }
  if (data.coffee_order !== undefined) {
    updates.push('coffee_order = ?');
    values.push(data.coffee_order);
  }
  if (data.food_taken !== undefined) {
    updates.push('food_taken = ?');
    values.push(data.food_taken ? 1 : 0);
  }
  if (data.coffee_taken !== undefined) {
    updates.push('coffee_taken = ?');
    values.push(data.coffee_taken ? 1 : 0);
  }
  if (data.qr_code !== undefined) {
    updates.push('qr_code = ?');
    values.push(data.qr_code);
  }

  if (updates.length === 0) return current;

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  const stmt = db.prepare(`UPDATE participants SET ${updates.join(', ')} WHERE id = ?`);
  stmt.run(...values);

  return getParticipant(id);
}

export function deleteParticipant(id: string): boolean {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM participants WHERE id = ?');
  const result = stmt.run(id);
  return (result.changes || 0) > 0;
}

export function markFoodTaken(id: string): Participant | null {
  const db = getDatabase();
  const participant = getParticipant(id);
  if (!participant) return null;

  const stmt = db.prepare(
    'UPDATE participants SET food_taken = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  );
  stmt.run(id);

  addLog(id, 'FOOD_MARKED_TAKEN');
  return getParticipant(id);
}

export function markCoffeeTaken(id: string): Participant | null {
  const db = getDatabase();
  const participant = getParticipant(id);
  if (!participant) return null;

  const stmt = db.prepare(
    'UPDATE participants SET coffee_taken = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  );
  stmt.run(id);

  addLog(id, 'COFFEE_MARKED_TAKEN');
  return getParticipant(id);
}

export function resetAllStatus(): void {
  const db = getDatabase();
  const stmt = db.prepare(
    'UPDATE participants SET food_taken = 0, coffee_taken = 0, updated_at = CURRENT_TIMESTAMP'
  );
  stmt.run();
}

export function addLog(participantId: string, action: string): void {
  const db = getDatabase();
  const logId = uuidv4();
  const stmt = db.prepare(
    'INSERT INTO logs (id, participant_id, action) VALUES (?, ?, ?)'
  );
  stmt.run(logId, participantId, action);
}

export function deleteDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
