import pool from '.';
import { flags } from '$lib/flags';
import { type Flag } from '$lib/flags/flags';

export interface FlagTable {
  flag_key: string;
  override_value: boolean;
  description?: string;
  decide_code: string;
  created_at: string;
}

export class FlagDAO {
  static convertToFlag(row: FlagTable): Flag {
    const f = flags.getFlag(row.flag_key);
    if (!f) {
      throw new Error(`Flag with key ${row.flag_key} not found`);
    }
    f.override(row.override_value);
    return f;
  }

  static async getFlag(key: string): Promise<FlagTable | null> {
    const res = await pool.query<FlagTable>('SELECT * FROM flag_decisions WHERE flag_key = $1', [
      key,
    ]);
    return res.rows[0] || null;
  }

  static async setFlag(key: string, overrideValue: boolean): Promise<void> {
    await pool.query(
      `
      INSERT INTO flag_decisions (flag_key, override_value)
      VALUES ($1, $2)
      ON CONFLICT (flag_key)
      DO UPDATE SET override_value = EXCLUDED.override_value
    `,
      [key, overrideValue]
    );
  }

  static async deleteFlag(key: string): Promise<void> {
    await pool.query('DELETE FROM flag_decisions WHERE flag_key = $1', [key]);
  }

  static async getAllFlags(): Promise<Flag[]> {
    const allFlags = flags.getAllFlags().map((f) => f.key);
    const res = await pool.query<FlagTable>('SELECT * FROM flag_decisions');
    const flagMap: Record<string, FlagTable> = {};
    res.rows.forEach((row) => {
      flagMap[row.flag_key] = row;
    });
    return allFlags.map((key) => {
      if (flagMap[key]) {
        return this.convertToFlag(flagMap[key]);
      } else {
        return flags.getFlag(key)!;
      }
    });
  }
}
