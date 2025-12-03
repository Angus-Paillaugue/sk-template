import pool from '.';

interface FlagDefinitionType {
  key: string;
  description: string;
  overrideValue: boolean | null;
  chance: number;
}

export class Flag {
  key: FlagDefinitionType['key'];
  description: FlagDefinitionType['description'];
  chance: FlagDefinitionType['chance'];
  overrideValue: FlagDefinitionType['overrideValue'];

  constructor(definition: FlagDefinitionType) {
    this.key = definition.key;
    this.description = definition.description;
    this.chance = definition.chance;
    this.overrideValue = definition.overrideValue;
  }

  decide(visitorId: string, chance: number): boolean {
    // No need to take the overrideValue into account, here it is done via [globals.svelte.ts](src/lib/globals.svelte.ts)
    // Simple deterministic hash function
    let hash = 0;
    for (let i = 0; i < visitorId.length; i++) {
      hash = (hash << 5) - hash + visitorId.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    // Normalize hash to 0-99
    const normalized = Math.abs(hash) % 100;
    return normalized < chance;
  }
}

export interface FlagDecisions {
  [key: string]: { value: boolean; override: boolean | null };
}

export interface FlagTable {
  flag_key: string;
  override_value: boolean;
  description?: string;
  chance: number;
  created_at: string;
}

export class FlagDAO {
  static convertToFlag(row: FlagTable): Flag {
    return new Flag({
      key: row.flag_key,
      description: row.description || '',
      overrideValue: row.override_value ?? null,
      chance: Math.round(row.chance || 0),
    });
  }

  static async getFlag(key: string): Promise<Flag | null> {
    const res = await pool.query<FlagTable>('SELECT * FROM flag WHERE flag_key = $1', [key]);
    return this.convertToFlag(res.rows[0]) || null;
  }

  static async overrideFlag(key: string, overrideValue: boolean): Promise<void> {
    await pool.query('UPDATE flag SET override_value = $2 WHERE flag_key = $1;', [
      key,
      overrideValue,
    ]);
  }

  static async deleteFlag(key: string): Promise<void> {
    await pool.query('DELETE FROM flag WHERE flag_key = $1', [key]);
  }

  static async getAllFlags(): Promise<Flag[]> {
    const res = await pool.query<FlagTable>('SELECT * FROM flag ORDER BY created_at DESC');
    return res.rows.map(this.convertToFlag);
  }

  static async createFlag(key: string, description: string, chance: number): Promise<void> {
    await pool.query('INSERT INTO flag (flag_key, description, chance) VALUES ($1, $2, $3)', [
      key,
      description,
      chance,
    ]);
  }

  static async editFlag(
    originalKey: string,
    newKey: string,
    description: string,
    chance: number
  ): Promise<void> {
    await pool.query(
      'UPDATE flag SET flag_key = $2, description = $3, chance = $4 WHERE flag_key = $1',
      [originalKey, newKey, description, chance]
    );
  }
}
