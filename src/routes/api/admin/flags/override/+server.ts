import { FlagDAO } from '$lib/server/db/flag';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { flags } from '$lib/flags';
import { PubSub } from '$lib/server/redis/pubsub';

export const POST: RequestHandler = async ({ request }) => {
  const { flagKey, value } = await request.json();

  const flag = flags.getFlag(flagKey);
  if (!flag) {
    return json({ success: false, error: 'Flag not found' }, { status: 404 });
  }
  if (value === null) {
    await FlagDAO.deleteFlag(flagKey);
    flag.clearOverride();
  } else {
    await FlagDAO.setFlag(flagKey, value);
    flag.override(value);
  }

  PubSub.publish('flags:update', JSON.stringify({ flagKey, value }));

  return json({ success: true });
};
