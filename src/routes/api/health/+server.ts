import { getValkeyInstance } from '$lib/server/valkey';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import pool from '$lib/server/db';

interface MigrationTable {
  name: string;
  created_at: Date;
}

async function valkeyCheck() {
  const valkey = await getValkeyInstance();
  await valkey.set('healthcheck', 'ok');
  const valkeyResult = await valkey.get('healthcheck');
  if (valkeyResult !== 'ok') {
    throw new Error('Valkey healthcheck failed');
  }
}

async function pgCheck() {
  const { rows } = await pool.query<MigrationTable>('SELECT * FROM migrations');
  if (rows.length === 0) {
    throw new Error('No migrations found');
  }
}

export const GET: RequestHandler = async () => {
  try {
    await valkeyCheck();
    await pgCheck();
    return json('OK');
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json(msg, { status: 500 });
  }
};
